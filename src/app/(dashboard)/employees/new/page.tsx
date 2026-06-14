import Link from 'next/link';
import { createEmployee } from '@/lib/actions/employees';

export default function NewEmployeePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Add employee</h1>
        <p className="text-sm text-slate-500">New employees can check in via WhatsApp immediately.</p>
      </div>

      <div className="card p-6">
        {searchParams.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <form action={createEmployee} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="label">Full name</label>
            <input id="full_name" name="full_name" type="text" required className="input" placeholder="John Mwangi" />
          </div>
          <div>
            <label htmlFor="phone_number" className="label">WhatsApp phone number</label>
            <input id="phone_number" name="phone_number" type="text" required className="input" placeholder="+254712345678" />
            <p className="mt-1 text-xs text-slate-500">Include the country code. This is the number the employee uses to message Modeky Bot.</p>
          </div>
          <div>
            <label htmlFor="employee_code" className="label">Employee code (optional)</label>
            <input id="employee_code" name="employee_code" type="text" className="input" placeholder="EMP-001" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save employee</button>
            <Link href="/employees" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
