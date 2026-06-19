// lib/whatsapp.ts
// Meta Cloud API integration for WhatsApp Business Platform
// Handles sending messages, downloading media, and phone normalization

const META_API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// ── Types ───────────────────────────────────────────────────────────────────

interface SendMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text' | 'interactive' | 'location';
  text?: { body: string; preview_url?: boolean };
  interactive?: InteractiveMessage;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

interface InteractiveMessage {
  type: 'button' | 'list';
  body: { text: string };
  action: {
    buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
    sections?: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
    button?: string;
  };
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: { link: string };
  };
  footer?: { text: string };
}

interface MediaResponse {
  url: string;
  mime_type: string;
  sha256: string;
  file_size: number;
  id: string;
  messaging_product: string;
}

export interface DownloadedMedia {
  bytes: ArrayBuffer;
  contentType: string;
  filename: string;
}

// ── Send Text Message ───────────────────────────────────────────────────────

export async function sendTextMessage(to: string, text: string): Promise<void> {
  await sendMessage(to, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'text',
    text: { body: text, preview_url: false },
  });
}

// ── Send Button Message ───────────────────────────────────────────────────

export async function sendButtonMessage(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>,
  footer?: string
): Promise<void> {
  const payload: SendMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
      ...(footer && { footer: { text: footer } }),
    },
  };

  await sendMessage(to, payload);
}

// ── Send List Message ─────────────────────────────────────────────────────

export async function sendListMessage(
  to: string,
  body: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>,
  header?: string
): Promise<void> {
  const payload: SendMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: body },
      action: {
        button: buttonText,
        sections,
      },
      ...(header && {
        header: { type: 'text', text: header },
      }),
    },
  };

  await sendMessage(to, payload);
}

// ── Request Location (sends a text prompt — WhatsApp has no native location request API) ──

export async function sendLocationRequest(to: string, prompt: string): Promise<void> {
  await sendTextMessage(
    to,
    `${prompt}\n\n📍 To share your location:\n1. Tap the 📎 (attachment) button\n2. Select "Location"\n3. Tap "Send your current location"`
  );
}

// ── Send Template Message (for 24h+ window or proactive messages) ─────────

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components: any[] = []
): Promise<void> {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  await sendMessage(to, payload as any);
}

// ── Download Media from Meta CDN ──────────────────────────────────────────

export async function downloadWhatsappMedia(mediaId: string): Promise<DownloadedMedia | null> {
  try {
    // Step 1: Get the media URL from Meta
    const mediaUrl = `${BASE_URL}/${mediaId}`;
    const metaResponse = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
      },
    });

    if (!metaResponse.ok) {
      console.error('Failed to fetch media metadata:', await metaResponse.text());
      return null;
    }

    const mediaData: MediaResponse = await metaResponse.json();

    // Step 2: Download the actual file from the CDN URL
    const fileResponse = await fetch(mediaData.url, {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
      },
    });

    if (!fileResponse.ok) {
      console.error('Failed to download media file:', await fileResponse.text());
      return null;
    }

    const bytes = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || mediaData.mime_type || 'application/octet-stream';

    // Extract filename from Content-Disposition header or use media ID
    const disposition = fileResponse.headers.get('content-disposition');
    let filename = mediaId;
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    }

    return { bytes, contentType, filename };
  } catch (error) {
    console.error('Error downloading WhatsApp media:', error);
    return null;
  }
}

// ── Phone Number Normalization ────────────────────────────────────────────

export function normalizePhoneNumber(raw: string): string {
  // Remove any non-digit characters
  let cleaned = raw.replace(/\D/g, '');

  // Remove leading 0 and replace with country code if needed
  // Assumes South African numbers (27) if no country code
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '27' + cleaned.slice(1);
  }

  // If it doesn't start with a country code and is 9 digits, assume SA
  if (!cleaned.startsWith('27') && cleaned.length === 9) {
    cleaned = '27' + cleaned;
  }

  return cleaned;
}

// ── Internal: Send Message via Meta API ───────────────────────────────────

async function sendMessage(to: string, payload: SendMessagePayload): Promise<void> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('Missing META_PHONE_NUMBER_ID or META_ACCESS_TOKEN environment variables');
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('WhatsApp API error:', error);
    throw new Error(`WhatsApp API error: ${response.status} ${error}`);
  }

  const result = await response.json();
  console.log('WhatsApp message sent:', result.messages?.[0]?.id);
}

// ── Help Message ────────────────────────────────────────────────────────────

export const HELP_MESSAGE = `🤖 *Modeky Bot Commands*

*START* — Begin your shift (clock in)
*END* — End your shift (clock out)
*INCIDENT* — Report an incident
*LEAVE* — Request time off
*HELP* — Show this message

To check in:
1. Send START
2. Share your location 📍
3. Send a selfie 🤳`;