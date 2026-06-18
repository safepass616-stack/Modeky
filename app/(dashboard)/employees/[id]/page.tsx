import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateEmployee } from '@/lib/actions/employees';

export default async function EditEmployeePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!employee) {
    notFound();
  }

  const updateAction = updateEmployee.bind(null, employee.id);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Edit employee</h1>
      </div>

      <div className="card p-6">
        {searchParams.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <form action={updateAction} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="label">Full name</label>
            <input id="full_name" name="full_name" type="text" required defaultValue={employee.full_name} className="input" />
          </div>
          <div>
            <label htmlFor="phone_number" className="label">WhatsApp phone number</label>
            <input id="phone_number" name="phone_number" type="text" required defaultValue={employee.phone_number} className="input" />
          </div>
          <div>
            <label htmlFor="employee_code" className="label">Employee code</label>
            <input id="employee_code" name="employee_code" type="text" defaultValue={employee.employee_code ?? ''} className="input" />
          </div>
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" defaultValue={employee.status} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save changes</button>
            <Link href="/employees" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
