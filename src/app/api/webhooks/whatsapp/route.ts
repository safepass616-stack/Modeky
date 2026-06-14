import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import {
  sendTextMessage,
  sendLocationRequest,
  downloadWhatsappMedia,
  normalizePhoneNumber,
  HELP_MESSAGE,
} from '@/lib/whatsapp';
import { findNearestSite } from '@/lib/geo';
import { LATE_CHECKIN_HOUR } from '@/lib/constants';

// ----------------------------------------------------------------------------
// GET: Webhook verification handshake (Meta calls this once when you
// configure the webhook URL in the App dashboard).
// ----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// ----------------------------------------------------------------------------
// POST: Incoming message events from the WhatsApp Cloud API.
// ----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Ignore status updates (delivered/read receipts) and anything without
    // an actual inbound message.
    if (!message) {
      return NextResponse.json({ status: 'ignored' });
    }

    const fromRaw = message.from as string; // e.g. "254712345678"
    const phoneNumber = normalizePhoneNumber(fromRaw);

    await handleIncomingMessage(phoneNumber, message);

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    // Always return 200 so Meta does not retry indefinitely.
    return NextResponse.json({ status: 'error' });
  }
}

// ----------------------------------------------------------------------------
// Core conversation handler
// ----------------------------------------------------------------------------
async function handleIncomingMessage(phoneNumber: string, message: any) {
  const supabase = createAdminSupabaseClient();

  // 1. Look up the employee by phone number (globally unique across tenants).
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('phone_number', phoneNumber)
    .maybeSingle();

  if (!employee) {
    await sendTextMessage(
      phoneNumber,
      "We couldn't find your number in any company's employee list. Please contact your administrator."
    );
    return;
  }

  if (employee.status !== 'active') {
    await sendTextMessage(phoneNumber, 'Your account is inactive. Please contact your administrator.');
    return;
  }

  // 2. Load (or create) the WhatsApp conversation session for this employee.
  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('employee_id', employee.id)
    .maybeSingle();

  const messageType = message.type as string;

  // --- Text commands -------------------------------------------------------
  if (messageType === 'text') {
    const text = (message.text?.body || '').trim().toUpperCase();

    if (text === 'HELP') {
      await sendTextMessage(phoneNumber, HELP_MESSAGE);
      return;
    }

    if (text === 'START') {
      await handleStart(supabase, employee, phoneNumber);
      return;
    }

    if (text === 'END') {
      await handleEnd(supabase, employee, phoneNumber);
      return;
    }

    // Unrecognized text
    await sendTextMessage(
      phoneNumber,
      `Sorry, I didn't understand that.\n\n${HELP_MESSAGE}`
    );
    return;
  }

  // --- Location messages -----------------------------------------------------
  if (messageType === 'location') {
    if (session?.state === 'awaiting_location' && session.pending_action === 'check_in') {
      const { latitude, longitude } = message.location;

      await supabase
        .from('whatsapp_sessions')
        .update({
          state: 'awaiting_selfie',
          pending_latitude: latitude,
          pending_longitude: longitude,
        })
        .eq('id', session.id);

      await sendTextMessage(phoneNumber, 'Please send a selfie.');
      return;
    }

    await sendTextMessage(
      phoneNumber,
      `I wasn't expecting a location right now. Send START to begin your shift.`
    );
    return;
  }

  // --- Image (selfie) messages -----------------------------------------------
  if (messageType === 'image') {
    if (session?.state === 'awaiting_selfie' && session.pending_action === 'check_in') {
      await handleSelfie(supabase, employee, session, message, phoneNumber);
      return;
    }

    await sendTextMessage(
      phoneNumber,
      `I wasn't expecting a photo right now. Send START to begin your shift.`
    );
    return;
  }

  // --- Anything else ---------------------------------------------------------
  await sendTextMessage(phoneNumber, HELP_MESSAGE);
}

// ----------------------------------------------------------------------------
// START -> begin check-in flow
// ----------------------------------------------------------------------------
async function handleStart(supabase: ReturnType<typeof createAdminSupabaseClient>, employee: any, phoneNumber: string) {
  const today = new Date().toISOString().slice(0, 10);

  // If the employee already checked in today, don't let them check in again.
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, checkin_time')
    .eq('employee_id', employee.id)
    .eq('attendance_date', today)
    .maybeSingle();

  if (existing?.checkin_time) {
    await sendTextMessage(phoneNumber, "You're already checked in for today. Send END to check out.");
    return;
  }

  await supabase
    .from('whatsapp_sessions')
    .upsert({
      company_id: employee.company_id,
      employee_id: employee.id,
      state: 'awaiting_location',
      pending_action: 'check_in',
      pending_latitude: null,
      pending_longitude: null,
    }, { onConflict: 'employee_id' });

  await sendLocationRequest(phoneNumber, 'Please share your location to check in.');
}

// ----------------------------------------------------------------------------
// END -> record checkout time
// ----------------------------------------------------------------------------
async function handleEnd(supabase: ReturnType<typeof createAdminSupabaseClient>, employee: any, phoneNumber: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('attendance_date', today)
    .maybeSingle();

  if (!attendance?.checkin_time) {
    await sendTextMessage(phoneNumber, "You haven't checked in today. Send START to begin your shift.");
    return;
  }

  if (attendance.checkout_time) {
    await sendTextMessage(phoneNumber, "You've already checked out today.");
    return;
  }

  await supabase
    .from('attendance')
    .update({
      checkout_time: new Date().toISOString(),
      status: 'checked_out',
    })
    .eq('id', attendance.id);

  await sendTextMessage(phoneNumber, 'Checkout successful.');
}

// ----------------------------------------------------------------------------
// Selfie received -> finalize the check-in
// ----------------------------------------------------------------------------
async function handleSelfie(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  employee: any,
  session: any,
  message: any,
  phoneNumber: string
) {
  const media = await downloadWhatsappMedia(message.image.id);

  if (!media) {
    await sendTextMessage(phoneNumber, 'Sorry, we could not process that photo. Please try sending the selfie again.');
    return;
  }

  // Upload selfie to Supabase Storage.
  const today = new Date().toISOString().slice(0, 10);
  const ext = media.contentType.includes('png') ? 'png' : 'jpg';
  const path = `${employee.company_id}/${employee.id}/${today}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('selfies')
    .upload(path, Buffer.from(media.bytes), {
      contentType: media.contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Selfie upload error:', uploadError);
    await sendTextMessage(phoneNumber, 'Sorry, we could not save your photo. Please try again.');
    return;
  }

  const { data: publicUrlData } = supabase.storage.from('selfies').getPublicUrl(path);
  const selfieUrl = publicUrlData.publicUrl;

  // Determine which site (if any) the employee is checking in at.
  const { data: sites } = await supabase
    .from('sites')
    .select('id, site_name, latitude, longitude, radius_meters')
    .eq('company_id', employee.company_id);

  const latitude = session.pending_latitude as number;
  const longitude = session.pending_longitude as number;

  let siteId: string | null = null;
  if (sites && sites.length > 0) {
    const nearest = findNearestSite(sites, latitude, longitude);
    if (nearest?.withinRadius) {
      siteId = nearest.site.id;
    }
  }

  // Determine attendance status based on check-in time.
  const now = new Date();
  const status = now.getHours() >= LATE_CHECKIN_HOUR ? 'late' : 'present';

  // Record (or update) the attendance row for today.
  await supabase
    .from('attendance')
    .upsert(
      {
        company_id: employee.company_id,
        employee_id: employee.id,
        site_id: siteId,
        checkin_time: now.toISOString(),
        checkin_latitude: latitude,
        checkin_longitude: longitude,
        selfie_url: selfieUrl,
        status,
        attendance_date: today,
      },
      { onConflict: 'employee_id,attendance_date' }
    );

  // Reset the conversation session.
  await supabase
    .from('whatsapp_sessions')
    .update({
      state: 'idle',
      pending_action: null,
      pending_latitude: null,
      pending_longitude: null,
    })
    .eq('id', session.id);

  await sendTextMessage(phoneNumber, 'Check-in successful.');
}
