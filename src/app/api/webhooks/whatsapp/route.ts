import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import {
  sendTextMessage,
  sendLocationRequest,
  sendButtonMessage,
  downloadWhatsappMedia,
  normalizePhoneNumber,
  HELP_MESSAGE,
} from '@/lib/whatsapp';
import { findNearestSite } from '@/lib/geo';
import { computeLateness } from '@/lib/schedule';
import { LATE_CHECKIN_HOUR } from '@/lib/constants';
import {
  getActiveSession,
  startSession,
  advanceSession,
  endSession,
  WhatsappSession,
} from '@/lib/whatsapp-session';

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;

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
  const crypto = require('crypto');

  // Add this inside POST(), after const body = await request.json();
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifySignature(body, signature)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Add this function at the bottom of the file
  function verifySignature(body: any, signature: string | null): boolean {
    if (!signature) return false;
    
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      console.error('META_APP_SECRET not configured');
      return false;
    }
  
    const expected = crypto
      .createHmac('sha256', appSecret)
      .update(JSON.stringify(body))
      .digest('hex');
  
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature.replace('sha256=', '')),
        Buffer.from(expected)
      );
    } catch {
      return false;
    }
  }
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
  const session = await getActiveSession(supabase, employee.id);
  const messageType = message.type as string;

  // --- Button/list replies (interactive) ------------------------------------
  if (messageType === 'interactive') {
    const buttonId =
      message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id;

    if (buttonId && session) {
      await routeToFlow(supabase, employee, session, phoneNumber, { kind: 'button', buttonId });
      return;
    }
  }

  // --- Text commands ----------------------------------------------------------
  if (messageType === 'text') {
    const rawText = (message.text?.body || '').trim();
    const text = rawText.toUpperCase();

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

    // If we're mid-flow, treat free text as input for that flow (e.g. an
    // incident description) instead of an unrecognized command.
    if (session) {
      await routeToFlow(supabase, employee, session, phoneNumber, { kind: 'text', text: rawText });
      return;
    }

    // Unrecognized text with no active flow.
    await sendTextMessage(phoneNumber, `Sorry, I didn't understand that.\n\n${HELP_MESSAGE}`);
    return;
  }

  // --- Location messages --------------------------------------------------
  if (messageType === 'location') {
    if (session) {
      await routeToFlow(supabase, employee, session, phoneNumber, {
        kind: 'location',
        latitude: message.location.latitude,
        longitude: message.location.longitude,
      });
      return;
    }

    await sendTextMessage(phoneNumber, `I wasn't expecting a location right now. Send START to begin your shift.`);
    return;
  }

  // --- Image messages -------------------------------------------------------
  if (messageType === 'image') {
    if (session) {
      await routeToFlow(supabase, employee, session, phoneNumber, { kind: 'image', mediaId: message.image.id });
      return;
    }

    await sendTextMessage(phoneNumber, `I wasn't expecting a photo right now. Send START to begin your shift.`);
    return;
  }

  // --- Audio / voice note messages ------------------------------------------
  if (messageType === 'audio') {
    if (session) {
      await routeToFlow(supabase, employee, session, phoneNumber, { kind: 'audio', mediaId: message.audio.id });
      return;
    }

    await sendTextMessage(phoneNumber, `I wasn't expecting a voice note right now. Send START to begin your shift.`);
    return;
  }

  // --- Anything else ---------------------------------------------------------
  await sendTextMessage(phoneNumber, HELP_MESSAGE);
}

// ----------------------------------------------------------------------------
// Flow input shape — a single normalized "what did the user just send"
// envelope, regardless of message type, handed to whichever flow owns the
// active session.
// ----------------------------------------------------------------------------
type FlowInput =
  | { kind: 'text'; text: string }
  | { kind: 'location'; latitude: number; longitude: number }
  | { kind: 'image'; mediaId: string }
  | { kind: 'audio'; mediaId: string }
  | { kind: 'button'; buttonId: string };

async function routeToFlow(
  supabase: SupabaseAdmin,
  employee: any,
  session: WhatsappSession,
  phoneNumber: string,
  input: FlowInput
) {
  if (session.session_type === 'incident') {
    await handleIncidentFlowInput(supabase, employee, session, phoneNumber, input);
    return;
  }

  // Default / fallback: check_in is the only other flow today.
  await handleCheckInFlowInput(supabase, employee, session, phoneNumber, input);
}

// ----------------------------------------------------------------------------
// START -> begin check-in flow
// ----------------------------------------------------------------------------
async function handleStart(supabase: SupabaseAdmin, employee: any, phoneNumber: string) {
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

  await startSession(supabase, employee.company_id, employee.id, 'check_in', 'awaiting_location');

  await sendLocationRequest(phoneNumber, 'Please share your location to check in.');
}

// ----------------------------------------------------------------------------
// END -> record checkout time
// ----------------------------------------------------------------------------
async function handleEnd(supabase: SupabaseAdmin, employee: any, phoneNumber: string) {
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
// Check-in flow — drives the awaiting_location -> awaiting_selfie steps.
// Behavior is identical to the pre-refactor version; only the session
// storage mechanism changed (generic engine instead of dedicated columns).
// ----------------------------------------------------------------------------
async function handleCheckInFlowInput(
  supabase: SupabaseAdmin,
  employee: any,
  session: WhatsappSession,
  phoneNumber: string,
  input: FlowInput
) {
  if (session.current_step === 'awaiting_location') {
    if (input.kind !== 'location') {
      await sendTextMessage(phoneNumber, 'Please share your location to continue checking in.');
      return;
    }

    await advanceSession(supabase, session.id, 'awaiting_selfie', {
      pending_latitude: input.latitude,
      pending_longitude: input.longitude,
    });

    await sendTextMessage(phoneNumber, 'Please send a selfie.');
    return;
  }

  if (session.current_step === 'awaiting_selfie') {
    if (input.kind !== 'image') {
      await sendTextMessage(phoneNumber, 'Please send a selfie photo to finish checking in.');
      return;
    }

    await finalizeCheckIn(supabase, employee, session, input.mediaId, phoneNumber);
    return;
  }

  // Unexpected step — reset so the employee isn't stuck.
  await endSession(supabase, session.id);
  await sendTextMessage(phoneNumber, `Something went wrong. Send START to begin your shift again.`);
}

// ----------------------------------------------------------------------------
// Selfie received -> finalize the check-in
// ----------------------------------------------------------------------------
async function finalizeCheckIn(
  supabase: SupabaseAdmin,
  employee: any,
  session: WhatsappSession,
  selfieMediaId: string,
  phoneNumber: string
) {
  const media = await downloadWhatsappMedia(selfieMediaId);

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

  const latitude = session.metadata?.pending_latitude as number;
  const longitude = session.metadata?.pending_longitude as number;

  let siteId: string | null = null;
  let withinAnySiteRadius = false;
  if (sites && sites.length > 0) {
    const nearest = findNearestSite(sites, latitude, longitude);
    if (nearest?.withinRadius) {
      siteId = nearest.site.id;
      withinAnySiteRadius = true;
    }
  }

  // Look up today's planned shift (if any) for accurate lateness detection.
  const { data: schedule } = await supabase
    .from('schedules')
    .select('id, site_id, start_time, status')
    .eq('employee_id', employee.id)
    .eq('shift_date', today)
    .neq('status', 'cancelled')
    .maybeSingle();

  const now = new Date();
  let status: 'present' | 'late';
  let minutesLate: number | null = null;

  if (schedule) {
    const lateness = computeLateness(schedule.start_time, now);
    minutesLate = lateness.minutesLate;
    status = lateness.isLate ? 'late' : 'present';

    if (!siteId && schedule.site_id) {
      siteId = schedule.site_id;
    }
  } else {
    status = now.getHours() >= LATE_CHECKIN_HOUR ? 'late' : 'present';
  }

  // ---------------------------------------------------------------------
  // Evidence / verification status - what managers actually care about.
  // ---------------------------------------------------------------------
  let verificationStatus: 'verified' | 'outside_site' | 'missing_selfie' | 'missing_gps';

  if (!selfieUrl) {
    verificationStatus = 'missing_selfie';
  } else if (latitude == null || longitude == null) {
    verificationStatus = 'missing_gps';
  } else if (!withinAnySiteRadius) {
    verificationStatus = 'outside_site';
  } else {
    verificationStatus = 'verified';
  }

  // Record (or update) the attendance row for today.
  const { data: attendanceRow } = await supabase
    .from('attendance')
    .upsert(
      {
        company_id: employee.company_id,
        employee_id: employee.id,
        site_id: siteId,
        schedule_id: schedule?.id ?? null,
        checkin_time: now.toISOString(),
        checkin_latitude: latitude,
        checkin_longitude: longitude,
        selfie_url: selfieUrl,
        status,
        verification_status: verificationStatus,
        minutes_late: minutesLate,
        attendance_date: today,
      },
      { onConflict: 'employee_id,attendance_date' }
    )
    .select('id, site_id')
    .single();

  // Offer the incident-reporting flow right after a successful check-in.
  await startSession(supabase, employee.company_id, employee.id, 'incident', 'awaiting_incident_choice', {
    attendance_id: attendanceRow?.id ?? null,
    site_id: attendanceRow?.site_id ?? null,
  });

  await sendButtonMessage(phoneNumber, 'Check-in successful. Any incidents to report?', [
    { id: 'incident_none', title: 'No incidents' },
    { id: 'incident_report', title: 'Report incident' },
  ]);
}

// ----------------------------------------------------------------------------
// Incident flow
// ----------------------------------------------------------------------------
// Steps:
//   awaiting_incident_choice  -> "No incidents" (ends flow) or "Report incident"
//   awaiting_incident_media   -> employee sends text, photo, or voice note
// ----------------------------------------------------------------------------
async function handleIncidentFlowInput(
  supabase: SupabaseAdmin,
  employee: any,
  session: WhatsappSession,
  phoneNumber: string,
  input: FlowInput
) {
  if (session.current_step === 'awaiting_incident_choice') {
    if (input.kind === 'button' && input.buttonId === 'incident_none') {
      await endSession(supabase, session.id);
      await sendTextMessage(phoneNumber, 'Got it — have a great shift!');
      return;
    }

    if (input.kind === 'button' && input.buttonId === 'incident_report') {
      await advanceSession(supabase, session.id, 'awaiting_incident_media');
      await sendTextMessage(
        phoneNumber,
        'Please describe the incident. You can send text, a photo, or a voice note.'
      );
      return;
    }

    // Anything else while we're waiting on the button tap — re-prompt.
    await sendButtonMessage(phoneNumber, 'Any incidents to report?', [
      { id: 'incident_none', title: 'No incidents' },
      { id: 'incident_report', title: 'Report incident' },
    ]);
    return;
  }

  if (session.current_step === 'awaiting_incident_media') {
    await recordIncident(supabase, employee, session, phoneNumber, input);
    return;
  }

  // Unexpected step — reset so the employee isn't stuck.
  await endSession(supabase, session.id);
}

async function recordIncident(
  supabase: SupabaseAdmin,
  employee: any,
  session: WhatsappSession,
  phoneNumber: string,
  input: FlowInput
) {
  let description: string | null = null;
  let mediaUrl: string | null = null;
  let mediaType: 'photo' | 'voice' | null = null;

  if (input.kind === 'text') {
    description = input.text;
  } else if (input.kind === 'image' || input.kind === 'audio') {
    const media = await downloadWhatsappMedia(input.mediaId);

    if (!media) {
      await sendTextMessage(phoneNumber, 'Sorry, we could not process that file. Please try again.');
      return;
    }

    const isAudio = input.kind === 'audio';
    const ext = isAudio ? 'ogg' : media.contentType.includes('png') ? 'png' : 'jpg';
    const path = `${employee.company_id}/${employee.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('incident-media')
      .upload(path, Buffer.from(media.bytes), {
        contentType: media.contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Incident media upload error:', uploadError);
      await sendTextMessage(phoneNumber, 'Sorry, we could not save that file. Please try again.');
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('incident-media').getPublicUrl(path);
    mediaUrl = publicUrlData.publicUrl;
    mediaType = isAudio ? 'voice' : 'photo';
  } else {
    // A button tap or location ping while we're expecting media/text.
    await sendTextMessage(phoneNumber, 'Please send a text description, a photo, or a voice note.');
    return;
  }

  await supabase.from('incidents').insert({
    company_id: employee.company_id,
    employee_id: employee.id,
    site_id: session.metadata?.site_id ?? null,
    attendance_id: session.metadata?.attendance_id ?? null,
    description,
    media_url: mediaUrl,
    media_type: mediaType,
  });

  await endSession(supabase, session.id);
  await sendTextMessage(phoneNumber, 'Incident reported. Your supervisor has been notified.');
}
