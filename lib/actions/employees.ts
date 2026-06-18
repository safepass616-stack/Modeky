'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUserContext, normalizePhone } from '@/lib/actions/helpers';

export async function createEmployee(formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();

  const full_name = String(formData.get('full_name') || '').trim();
  const phone_number = normalizePhone(String(formData.get('phone_number') || ''));
  const employee_code = String(formData.get('employee_code') || '').trim() || null;

  if (!full_name || phone_number === '+') {
    redirect('/employees/new?error=' + encodeURIComponent('Full name and phone number are required.'));
  }

  const { error } = await supabase.from('employees').insert({
    company_id: companyId,
    full_name,
    phone_number,
    employee_code,
    status: 'active',
  });

  if (error) {
    const message = error.code === '23505'
      ? 'A employee with this phone number already exists.'
      : error.message;
    redirect('/employees/new?error=' + encodeURIComponent(message));
  }

  revalidatePath('/employees');
  redirect('/employees');
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();

  const full_name = String(formData.get('full_name') || '').trim();
  const phone_number = normalizePhone(String(formData.get('phone_number') || ''));
  const employee_code = String(formData.get('employee_code') || '').trim() || null;
  const status = String(formData.get('status') || 'active') as 'active' | 'inactive';

  if (!full_name || phone_number === '+') {
    redirect(`/employees/${employeeId}?error=` + encodeURIComponent('Full name and phone number are required.'));
  }

  const { error } = await supabase
    .from('employees')
    .update({ full_name, phone_number, employee_code, status })
    .eq('id', employeeId)
    .eq('company_id', companyId);

  if (error) {
    const message = error.code === '23505'
      ? 'A employee with this phone number already exists.'
      : error.message;
    redirect(`/employees/${employeeId}?error=` + encodeURIComponent(message));
  }

  revalidatePath('/employees');
  redirect('/employees');
}

export async function toggleEmployeeStatus(employeeId: string, currentStatus: 'active' | 'inactive') {
  const { supabase, companyId } = await getCurrentUserContext();

  await supabase
    .from('employees')
    .update({ status: currentStatus === 'active' ? 'inactive' : 'active' })
    .eq('id', employeeId)
    .eq('company_id', companyId);

  revalidatePath('/employees');
}
