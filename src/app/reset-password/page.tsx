import Link from 'next/link';
import { requestPasswordReset } from '@/lib/actions/auth';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Modeky</h1>
          <p className="mt-1 text-sm text-slate-400">Reset your password</p>
        </div>

        <div className="card p-6">
          {searchParams.sent ? (
            <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-success">
              If an account exists for that email, a reset link has been sent.
            </div>
          ) : (
            <>
              <h2 className="mb-4 text-lg font-semibold text-primary">Forgot password</h2>

              {searchParams.error && (
                <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
                  {searchParams.error}
                </div>
              )}

              <form action={requestPasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input id="email" name="email" type="email" required className="input" placeholder="you@company.com" />
                </div>
                <button type="submit" className="btn-primary w-full">Send reset link</button>
              </form>
            </>
          )}

          <p className="mt-4 text-center text-sm text-slate-600">
            <Link href="/login" className="text-secondary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
