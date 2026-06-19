// lib/whatsapp-session.ts
// Generic session engine for WhatsApp conversation flows
// Manages the whatsapp_sessions table with session_type, current_step, metadata

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

type SupabaseAdmin = SupabaseClient<Database>;

const SESSION_TTL_MINUTES = 30;

export interface WhatsappSession {
  id: string;
  company_id: string;
  employee_id: string;
  session_type: 'check_in' | 'incident' | 'leave_request' | 'payslip';
  current_step: string;
  metadata: Record<string, any>;
  status: 'active' | 'closed' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

// ── Get Active Session ────────────────────────────────────────────────────

export async function getActiveSession(
  supabase: SupabaseAdmin,
  employeeId: string
): Promise<WhatsappSession | null> {
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active session:', error);
    return null;
  }

  // Check if session expired
  if (data && data.expires_at && new Date(data.expires_at) < new Date()) {
    await expireSession(supabase, data.id);
    return null;
  }

  return data;
}

// ── Start New Session ─────────────────────────────────────────────────────

export async function startSession(
  supabase: SupabaseAdmin,
  companyId: string,
  employeeId: string,
  sessionType: WhatsappSession['session_type'],
  initialStep: string,
  metadata: Record<string, any> = {}
): Promise<WhatsappSession> {
  // Close any existing active sessions for this employee
  await closeEmployeeSessions(supabase, employeeId);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MINUTES * 60 * 1000);

  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      session_type: sessionType,
      current_step: initialStep,
      metadata,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting session:', error);
    throw new Error('Failed to start WhatsApp session');
  }

  return data;
}

// ── Advance Session Step ──────────────────────────────────────────────────

export async function advanceSession(
  supabase: SupabaseAdmin,
  sessionId: string,
  newStep: string,
  metadataUpdates: Record<string, any> = {}
): Promise<void> {
  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('metadata')
    .eq('id', sessionId)
    .single();

  const updatedMetadata = {
    ...(session?.metadata || {}),
    ...metadataUpdates,
  };

  const newExpiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({
      current_step: newStep,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
      expires_at: newExpiresAt.toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error advancing session:', error);
    throw new Error('Failed to advance session step');
  }
}

// ── End Session ───────────────────────────────────────────────────────────

export async function endSession(supabase: SupabaseAdmin, sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error ending session:', error);
    throw new Error('Failed to end WhatsApp session');
  }
}

// ── Expire Session ────────────────────────────────────────────────────────

export async function expireSession(supabase: SupabaseAdmin, sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error expiring session:', error);
  }
}

// ── Close All Employee Sessions ───────────────────────────────────────────

export async function closeEmployeeSessions(
  supabase: SupabaseAdmin,
  employeeId: string
): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('employee_id', employeeId)
    .eq('status', 'active');

  if (error) {
    console.error('Error closing employee sessions:', error);
  }
}