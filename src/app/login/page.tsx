import Link from 'next/link';
import { signIn } from '@/lib/actions/auth';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Modeky</h1>
          <p className="mt-1 text-sm text-slate-400">The WhatsApp Workforce Operating System</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Sign in</h2>

          {searchParams.error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
              {searchParams.error}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@company.com" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/reset-password" className="text-secondary hover:underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-secondary hover:underline">
              Create company account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
