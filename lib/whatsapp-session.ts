import type { createAdminSupabaseClient } from '@/lib/supabase/server';

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;

export type SessionType = 'check_in' | 'incident' | 'leave_request' | 'payslip';

export interface WhatsappSession {
  id: string;
  company_id: string;
  employee_id: string;
  session_type: SessionType;
  current_step: string;
  metadata: Record<string, any>;
  expires_at: string | null;
  updated_at: string;
}

/** How long an in-progress session is allowed to sit idle before it's treated as abandoned. */
const SESSION_TTL_MINUTES = 30;

/**
 * Loads the employee's current session, if any. If the session has expired
 * (past expires_at), it's treated as if it doesn't exist — the caller will
 * naturally start a fresh flow on the next handled message.
 */
export async function getActiveSession(
  supabase: SupabaseAdmin,
  employeeId: string
): Promise<WhatsappSession | null> {
  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (!data) return null;

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  return data as WhatsappSession;
}

/**
 * Starts (or restarts) a session for the given employee in a specific flow.
 * Overwrites any previous session, since an employee only ever has one
 * conversation in flight at a time.
 */
export async function startSession(
  supabase: SupabaseAdmin,
  companyId: string,
  employeeId: string,
  sessionType: SessionType,
  initialStep: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000).toISOString();

  await supabase
    .from('whatsapp_sessions')
    .upsert(
      {
        company_id: companyId,
        employee_id: employeeId,
        session_type: sessionType,
        current_step: initialStep,
        metadata,
        expires_at: expiresAt,
        // Keep legacy columns harmlessly in sync for any code/reports that
        // might still read them during the transition period.
        state: 'idle',
        pending_action: null,
        pending_latitude: null,
        pending_longitude: null,
      },
      { onConflict: 'employee_id' }
    );
}

/**
 * Advances an existing session to a new step, optionally merging in new
 * metadata (shallow merge — pass the full updated object for nested keys).
 */
export async function advanceSession(
  supabase: SupabaseAdmin,
  sessionId: string,
  nextStep: string,
  metadataPatch: Record<string, any> = {}
): Promise<void> {
  const { data: current } = await supabase
    .from('whatsapp_sessions')
    .select('metadata')
    .eq('id', sessionId)
    .single();

  const mergedMetadata = { ...(current?.metadata ?? {}), ...metadataPatch };
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000).toISOString();

  await supabase
    .from('whatsapp_sessions')
    .update({
      current_step: nextStep,
      metadata: mergedMetadata,
      expires_at: expiresAt,
    })
    .eq('id', sessionId);
}

/**
 * Ends the session and returns the employee to idle, ready for a new flow.
 */
export async function endSession(supabase: SupabaseAdmin, sessionId: string): Promise<void> {
  await supabase
    .from('whatsapp_sessions')
    .update({
      session_type: 'check_in',
      current_step: 'idle',
      metadata: {},
      expires_at: null,
      // Clear legacy columns too.
      state: 'idle',
      pending_action: null,
      pending_latitude: null,
      pending_longitude: null,
    })
    .eq('id', sessionId);
}
