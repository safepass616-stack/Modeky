// lib/constants.ts
// Application-wide constants

// Hour after which a check-in without a schedule is considered late
export const LATE_CHECKIN_HOUR = 8; // 8:00 AM

// Session timeout in minutes
export const SESSION_TIMEOUT_MINUTES = 30;

// Maximum file size for media uploads (10MB)
export const MAX_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;

// Supported media types for selfies
export const SELFIE_CONTENT_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Supported media types for incident reports
export const INCIDENT_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
];

// Default site radius in meters (if not specified)
export const DEFAULT_SITE_RADIUS_METERS = 500;

// Timezone for South Africa
export const TIMEZONE = 'Africa/Johannesburg';

// Date format for display
export const DISPLAY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// Time format for display
export const DISPLAY_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};