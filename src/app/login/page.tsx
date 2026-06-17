import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { ModekyLogo } from '@/components/ModekyLogo';

export default async function LoginPage() {
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
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your Modeky workspace
              </p>
            </div>

            {/* Form */}
            <LoginForm />

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  New to Modeky?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              href="/signup"
              className="block w-full text-center px-4 py-2.5 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition"
            >
              Create an account
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Contact support
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
