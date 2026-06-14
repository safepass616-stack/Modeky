import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, role, company_id')
    .eq('id', user.id)
    .single();

  let companyName = 'Modeky';
  if (profile?.company_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single();
    companyName = company?.name ?? 'Modeky';
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar companyName={companyName} role={profile?.role ?? 'company_admin'} />
      <div className="flex-1 lg:ml-64">
        <Topbar
          companyName={companyName}
          userName={profile?.full_name || profile?.email || ''}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
