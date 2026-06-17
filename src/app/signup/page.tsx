import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ModekyLogo } from '@/components/ModekyLogo';

export default async function SignupPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/50">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition">
          <ModekyLogo size={32} showText={true} variant="horizontal" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card border border-border rounded-xl shadow-lg p-8 sm:p-10">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Create Your Workspace
              </h1>
              <p className="text-muted-foreground">
                Set up your company and start managing attendance
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-secondary/50 border border-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                🎯 <span className="font-medium text-foreground">Get started in minutes</span>. Set up your company, add employees, and start using Modeky.
              </p>
            </div>

            {/* Form Container */}
            <form className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SafeGuard Security"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              {/* Agree to Terms */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-border bg-background cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition mt-6"
              >
                Create Workspace
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2.5 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition"
            >
              Sign In
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              By signing up, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                terms
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
    </div>
  );
}
