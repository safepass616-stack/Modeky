import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { deleteSite } from '@/lib/actions/sites';

export default async function SitesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createServerSupabaseClient();

  let query = supabase.from('sites').select('*').order('created_at', { ascending: false });

  if (searchParams.q) {
    query = query.or(`site_name.ilike.%${searchParams.q}%,client_name.ilike.%${searchParams.q}%,address.ilike.%${searchParams.q}%`);
  }

  const { data: sites } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Sites</h1>
          <p className="text-sm text-slate-500">Work sites your employees check in to</p>
        </div>
        <Link href="/sites/new" className="btn-primary self-start">
          + Add site
        </Link>
      </div>

      <form method="get" className="card p-4">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by site, client, or address"
          className="input"
        />
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Site</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Client</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Address</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Radius</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(sites ?? []).map((site) => (
                <tr key={site.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{site.site_name}</td>
                  <td className="px-4 py-3 text-slate-600">{site.client_name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{site.address ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{site.radius_meters}m</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/sites/${site.id}`} className="btn-secondary text-xs">
                        Edit
                      </Link>
                      <form action={deleteSite.bind(null, site.id)}>
                        <button type="submit" className="btn-danger text-xs">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(sites ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No sites found.
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
