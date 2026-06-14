import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Returns the company_id (tenant) of the currently authenticated user.
 * Redirects to /login if there is no session, and throws if the user's
 * profile is missing a company_id (which should never happen for a
 * company_admin created via the signup flow).
 */
export async function getCurrentUserContext() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, company_id, role')
    .eq('id', user.id)
    .single();

  if (error || !profile?.company_id) {
    throw new Error('User profile is missing a company. Contact support.');
  }

  return { supabase, userId: user.id, companyId: profile.company_id, role: profile.role };
}

/** Normalizes a phone number to E.164-ish format (digits only, with leading +). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  return `+${digits}`;
}
