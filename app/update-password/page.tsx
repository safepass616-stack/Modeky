import { updatePassword } from '@/lib/actions/auth';

export default function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Modeky</h1>
          <p className="mt-1 text-sm text-slate-400">Choose a new password</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Update password</h2>

          {searchParams.error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
              {searchParams.error}
            </div>
          )}

          <form action={updatePassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="label">New password</label>
              <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
            </div>
            <button type="submit" className="btn-primary w-full">Update password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
