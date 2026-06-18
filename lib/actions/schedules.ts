'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/actions/helpers';

function parseScheduleFields(formData: FormData) {
  const employee_id = String(formData.get('employee_id') || '');
  const site_id = String(formData.get('site_id') || '') || null;
  const shift_date = String(formData.get('shift_date') || '');
  const start_time = String(formData.get('start_time') || '');
  const end_time = String(formData.get('end_time') || '');
  const status = String(formData.get('status') || 'scheduled') as 'scheduled' | 'completed' | 'cancelled';

  return { employee_id, site_id, shift_date, start_time, end_time, status };
}

export async function createSchedule(formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();
  const fields = parseScheduleFields(formData);

  if (!fields.employee_id || !fields.shift_date || !fields.start_time || !fields.end_time) {
    redirect('/schedules/new?error=' + encodeURIComponent('Employee, date, start time and end time are required.'));
  }

  const { error } = await supabase.from('schedules').insert({
    company_id: companyId,
    ...fields,
  });

  if (error) {
    const message = error.code === '23505'
      ? 'This employee already has a shift scheduled for that date.'
      : error.message;
    redirect('/schedules/new?error=' + encodeURIComponent(message));
  }

  revalidatePath('/schedules');
  redirect('/schedules');
}

export async function updateSchedule(scheduleId: string, formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();
  const fields = parseScheduleFields(formData);

  if (!fields.employee_id || !fields.shift_date || !fields.start_time || !fields.end_time) {
    redirect(`/schedules/${scheduleId}?error=` + encodeURIComponent('Employee, date, start time and end time are required.'));
  }

  const { error } = await supabase
    .from('schedules')
    .update(fields)
    .eq('id', scheduleId)
    .eq('company_id', companyId);

  if (error) {
    const message = error.code === '23505'
      ? 'This employee already has a shift scheduled for that date.'
      : error.message;
    redirect(`/schedules/${scheduleId}?error=` + encodeURIComponent(message));
  }

  revalidatePath('/schedules');
  redirect('/schedules');
}

export async function deleteSchedule(scheduleId: string) {
  const { supabase, companyId } = await getCurrentUserContext();

  await supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId)
    .eq('company_id', companyId);

  revalidatePath('/schedules');
}
