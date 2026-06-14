'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required.'));
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Tenant onboarding: creates a new Company (tenant) and its first
 * Company Administrator user. Uses the service-role client because the
 * `companies` table has no public insert policy - only the server is
 * allowed to provision new tenants.
 */
export async function signUp(formData: FormData) {
  const companyName = String(formData.get('company_name') || '').trim();
  const fullName = String(formData.get('full_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!companyName || !fullName || !email || !password) {
    redirect('/signup?error=' + encodeURIComponent('All fields are required.'));
  }

  if (password.length < 8) {
    redirect('/signup?error=' + encodeURIComponent('Password must be at least 8 characters.'));
  }

  const admin = createAdminSupabaseClient();

  // 1. Create the tenant (company) record.
  const { data: company, error: companyError } = await admin
    .from('companies')
    .insert({ name: companyName })
    .select()
    .single();

  if (companyError || !company) {
    redirect('/signup?error=' + encodeURIComponent(companyError?.message || 'Could not create company.'));
  }

  // 2. Create the auth user. The `on_auth_user_created` trigger will create
  //    the matching public.users row using this metadata, including
  //    company_id, so the admin's records are correctly scoped from the
  //    very first record they create.
  const { error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      company_id: company!.id,
      role: 'company_admin',
      full_name: fullName,
    },
  });

  if (userError) {
    // Roll back the company record if user creation failed.
    await admin.from('companies').delete().eq('id', company!.id);
    redirect('/signup?error=' + encodeURIComponent(userError.message));
  }

  // 3. Sign the new admin in immediately.
  const supabase = createServerSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    redirect('/login?error=' + encodeURIComponent('Account created. Please sign in.'));
  }

  redirect('/dashboard');
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') || '').trim();

  if (!email) {
    redirect('/reset-password?error=' + encodeURIComponent('Email is required.'));
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/update-password`,
  });

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message));
  }

  redirect('/reset-password?sent=1');
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') || '');

  if (password.length < 8) {
    redirect('/update-password?error=' + encodeURIComponent('Password must be at least 8 characters.'));
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect('/update-password?error=' + encodeURIComponent(error.message));
  }

  redirect('/dashboard');
}
