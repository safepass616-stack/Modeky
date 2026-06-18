import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Modeky</h1>
          <p className="mt-1 text-sm text-slate-400">Create your company account</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Get started</h2>

          {searchParams.error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
              {searchParams.error}
            </div>
          )}

          <form action={signUp} className="space-y-4">
            <div>
              <label htmlFor="company_name" className="label">Company name</label>
              <input id="company_name" name="company_name" type="text" required className="input" placeholder="ABC Security Ltd" />
            </div>
            <div>
              <label htmlFor="full_name" className="label">Your full name</label>
              <input id="full_name" name="full_name" type="text" required className="input" placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@company.com" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
            </div>
            <button type="submit" className="btn-primary w-full">Create account</button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-secondary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
