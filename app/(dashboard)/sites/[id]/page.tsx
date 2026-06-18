import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateSite } from '@/lib/actions/sites';

export default async function EditSitePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: site } = await supabase.from('sites').select('*').eq('id', params.id).single();

  if (!site) {
    notFound();
  }

  const updateAction = updateSite.bind(null, site.id);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Edit site</h1>
      </div>

      <div className="card p-6">
        {searchParams.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <form action={updateAction} className="space-y-4">
          <div>
            <label htmlFor="site_name" className="label">Site name</label>
            <input id="site_name" name="site_name" type="text" required defaultValue={site.site_name} className="input" />
          </div>
          <div>
            <label htmlFor="client_name" className="label">Client name</label>
            <input id="client_name" name="client_name" type="text" defaultValue={site.client_name ?? ''} className="input" />
          </div>
          <div>
            <label htmlFor="address" className="label">Address</label>
            <input id="address" name="address" type="text" defaultValue={site.address ?? ''} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="label">Latitude</label>
              <input id="latitude" name="latitude" type="number" step="any" required defaultValue={site.latitude} className="input" />
            </div>
            <div>
              <label htmlFor="longitude" className="label">Longitude</label>
              <input id="longitude" name="longitude" type="number" step="any" required defaultValue={site.longitude} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="radius_meters" className="label">Allowed radius (meters)</label>
            <input id="radius_meters" name="radius_meters" type="number" defaultValue={site.radius_meters} className="input" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save changes</button>
            <Link href="/sites" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
