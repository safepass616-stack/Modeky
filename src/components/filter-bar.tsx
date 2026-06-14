import type { Employee, Site } from '@/lib/types';

export default function FilterBar({
  sites,
  employees,
  date,
  siteId,
  employeeId,
}: {
  sites: Pick<Site, 'id' | 'site_name'>[];
  employees: Pick<Employee, 'id' | 'full_name'>[];
  date: string;
  siteId?: string;
  employeeId?: string;
}) {
  return (
    <form method="get" className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-4">
      <div>
        <label htmlFor="date" className="label">Date</label>
        <input id="date" name="date" type="date" defaultValue={date} className="input" />
      </div>
      <div>
        <label htmlFor="site_id" className="label">Site</label>
        <select id="site_id" name="site_id" defaultValue={siteId ?? ''} className="input">
          <option value="">All sites</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.site_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="employee_id" className="label">Employee</label>
        <select id="employee_id" name="employee_id" defaultValue={employeeId ?? ''} className="input">
          <option value="">All employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>{employee.full_name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full">Apply filters</button>
      </div>
    </form>
  );
}
