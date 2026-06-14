// ----------------------------------------------------------------------------
// Meta WhatsApp Cloud API helpers
// ----------------------------------------------------------------------------
// Thin wrapper around the Graph API "messages" endpoint used to send replies
// from Modeky Bot back to employees.

const GRAPH_API_VERSION = 'v20.0';

function graphUrl(path: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}${path}`;
}

async function sendWhatsappRequest(body: Record<string, unknown>) {
  const token = process.env.WHATSAPP_TOKEN;

  const res = await fetch(graphUrl('/messages'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      ...body,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('WhatsApp API error:', res.status, errText);
  }

  return res;
}

/** Send a plain text message to a WhatsApp user. */
export async function sendTextMessage(to: string, text: string) {
  return sendWhatsappRequest({
    to,
    type: 'text',
    text: { body: text, preview_url: false },
  });
}

/** Request the user's current location using a location request message. */
export async function sendLocationRequest(to: string, body: string) {
  return sendWhatsappRequest({
    to,
    type: 'interactive',
    interactive: {
      type: 'location_request_message',
      body: { text: body },
      action: { name: 'send_location' },
    },
  });
}

/**
 * Download media (e.g. an image sent by a user) from the WhatsApp Cloud API.
 * Returns the raw bytes and content type, ready to be re-uploaded to
 * Supabase Storage.
 */
export async function downloadWhatsappMedia(mediaId: string): Promise<{
  bytes: ArrayBuffer;
  contentType: string;
} | null> {
  const token = process.env.WHATSAPP_TOKEN;

  // Step 1: resolve the media ID to a temporary download URL.
  const metaRes = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${mediaId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!metaRes.ok) {
    console.error('Failed to resolve WhatsApp media URL:', await metaRes.text());
    return null;
  }

  const meta = await metaRes.json();

  // Step 2: download the actual file bytes.
  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!fileRes.ok) {
    console.error('Failed to download WhatsApp media:', await fileRes.text());
    return null;
  }

  const bytes = await fileRes.arrayBuffer();
  const contentType = fileRes.headers.get('content-type') || meta.mime_type || 'image/jpeg';

  return { bytes, contentType };
}

/**
 * Normalize a phone number coming from the WhatsApp webhook (e.g.
 * "447911123456") into the E.164 format used to store employees
 * ("+447911123456").
 */
export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  return `+${digits}`;
}

export const HELP_MESSAGE = `Available commands:

START - Begin shift
END - End shift
HELP - Show commands`;
