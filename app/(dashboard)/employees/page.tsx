import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmployeeStatusBadge } from '@/components/status-badge';
import { toggleEmployeeStatus } from '@/lib/actions/employees';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchParams.q) {
    query = query.or(`full_name.ilike.%${searchParams.q}%,phone_number.ilike.%${searchParams.q}%,employee_code.ilike.%${searchParams.q}%`);
  }

  const { data: employees } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Employees</h1>
          <p className="text-sm text-slate-500">Manage your workforce</p>
        </div>
        <Link href="/employees/new" className="btn-primary self-start">
          + Add employee
        </Link>
      </div>

      <form method="get" className="card p-4">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by name, phone, or employee code"
          className="input"
        />
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Employee Code</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(employees ?? []).map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{employee.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.employee_code ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.phone_number}</td>
                  <td className="px-4 py-3"><EmployeeStatusBadge status={employee.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/employees/${employee.id}`} className="btn-secondary text-xs">
                        Edit
                      </Link>
                      <form action={toggleEmployeeStatus.bind(null, employee.id, employee.status)}>
                        <button type="submit" className="btn-secondary text-xs">
                          {employee.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(employees ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
