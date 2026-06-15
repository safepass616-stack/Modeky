'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/actions/helpers';

/**
 * Manager review / manual override for an attendance record. Used to
 * correct exceptions (outside_site, missing_selfie, missing_gps) once a
 * manager has investigated - e.g. the employee was genuinely on site but
 * GPS drifted, or the manager confirms the absence is excused.
 */
export async function overrideAttendance(attendanceId: string, formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();

  const status = String(formData.get('status') || '') as 'present' | 'late' | 'absent' | 'checked_out';
  const site_id = String(formData.get('site_id') || '') || null;

  if (!['present', 'late', 'absent', 'checked_out'].includes(status)) {
    redirect(`/attendance/${attendanceId}?error=` + encodeURIComponent('Invalid status.'));
  }

  const { error } = await supabase
    .from('attendance')
    .update({
      status,
      site_id,
      verification_status: 'manual_override',
    })
    .eq('id', attendanceId)
    .eq('company_id', companyId);

  if (error) {
    redirect(`/attendance/${attendanceId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/dashboard');
  revalidatePath('/reports');
  redirect('/dashboard');
}
