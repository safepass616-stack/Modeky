import { signOut } from '@/lib/actions/auth';

export default function Topbar({
  companyName,
  userName,
}: {
  companyName: string;
  userName: string;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="ml-10 lg:ml-0">
        <p className="text-sm font-semibold text-primary">{companyName}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate-600 sm:inline">{userName}</span>
        <form action={signOut}>
          <button type="submit" className="btn-secondary text-sm">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
