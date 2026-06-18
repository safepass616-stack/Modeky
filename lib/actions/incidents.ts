'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/actions/helpers';

export type IncidentStatus = 'open' | 'reviewed' | 'resolved';

/**
 * Updates the triage status of an incident (open -> reviewed -> resolved).
 * RLS already scopes this to the caller's own company, so no explicit
 * company_id check is needed beyond what getCurrentUserContext enforces.
 */
export async function updateIncidentStatus(incidentId: string, status: IncidentStatus) {
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from('incidents')
    .update({ status })
    .eq('id', incidentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/incidents');
  revalidatePath('/dashboard');
}
