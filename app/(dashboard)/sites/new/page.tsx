import Link from 'next/link';
import { createSite } from '@/lib/actions/sites';

export default function NewSitePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Add site</h1>
        <p className="text-sm text-slate-500">Employees checking in within the radius will be marked present at this site.</p>
      </div>

      <div className="card p-6">
        {searchParams.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <form action={createSite} className="space-y-4">
          <div>
            <label htmlFor="site_name" className="label">Site name</label>
            <input id="site_name" name="site_name" type="text" required className="input" placeholder="Westlands Mall" />
          </div>
          <div>
            <label htmlFor="client_name" className="label">Client name</label>
            <input id="client_name" name="client_name" type="text" className="input" placeholder="Westlands Mall Ltd" />
          </div>
          <div>
            <label htmlFor="address" className="label">Address</label>
            <input id="address" name="address" type="text" className="input" placeholder="Waiyaki Way, Nairobi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="label">Latitude</label>
              <input id="latitude" name="latitude" type="number" step="any" required className="input" placeholder="-1.2667" />
            </div>
            <div>
              <label htmlFor="longitude" className="label">Longitude</label>
              <input id="longitude" name="longitude" type="number" step="any" required className="input" placeholder="36.8121" />
            </div>
          </div>
          <div>
            <label htmlFor="radius_meters" className="label">Allowed radius (meters)</label>
            <input id="radius_meters" name="radius_meters" type="number" defaultValue={150} className="input" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save site</button>
            <Link href="/sites" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
