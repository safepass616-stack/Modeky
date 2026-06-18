'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/actions/helpers';

function parseSiteFields(formData: FormData) {
  const site_name = String(formData.get('site_name') || '').trim();
  const client_name = String(formData.get('client_name') || '').trim() || null;
  const address = String(formData.get('address') || '').trim() || null;
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));
  const radius_meters = Number(formData.get('radius_meters') || 150);

  return { site_name, client_name, address, latitude, longitude, radius_meters };
}

export async function createSite(formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();
  const fields = parseSiteFields(formData);

  if (!fields.site_name || Number.isNaN(fields.latitude) || Number.isNaN(fields.longitude)) {
    redirect('/sites/new?error=' + encodeURIComponent('Site name, latitude and longitude are required.'));
  }

  const { error } = await supabase.from('sites').insert({
    company_id: companyId,
    ...fields,
  });

  if (error) {
    redirect('/sites/new?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/sites');
  redirect('/sites');
}

export async function updateSite(siteId: string, formData: FormData) {
  const { supabase, companyId } = await getCurrentUserContext();
  const fields = parseSiteFields(formData);

  if (!fields.site_name || Number.isNaN(fields.latitude) || Number.isNaN(fields.longitude)) {
    redirect(`/sites/${siteId}?error=` + encodeURIComponent('Site name, latitude and longitude are required.'));
  }

  const { error } = await supabase
    .from('sites')
    .update(fields)
    .eq('id', siteId)
    .eq('company_id', companyId);

  if (error) {
    redirect(`/sites/${siteId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/sites');
  redirect('/sites');
}

export async function deleteSite(siteId: string) {
  const { supabase, companyId } = await getCurrentUserContext();

  await supabase
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('company_id', companyId);

  revalidatePath('/sites');
}
