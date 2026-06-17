import Link from 'next/link';
import { Check, Users } from 'lucide-react';
import { ModekyLogo } from '@/components/ModekyLogo';

const TIERS = [
  {
    name: 'Starter',
    description: 'Perfect for small operations getting started with digital attendance.',
    price: 'R299',
    period: '/mo',
    seats: 'Up to 20 employees',
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: false,
    features: [
      'WhatsApp check-in & check-out',
      'GPS location verification',
      'Selfie verification',
      'Up to 3 sites',
      'Live attendance dashboard',
      'Basic reports (CSV export)',
      'Email support',
      'Mobile-friendly dashboard',
    ],
  },
  {
    name: 'Business',
    description: 'For growing teams that need full visibility across multiple sites.',
    price: 'R999',
    period: '/mo',
    seats: 'Up to 100 employees',
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: true,
    features: [
      'Everything in Starter',
      'Unlimited sites',
      'Incident reporting via WhatsApp',
      'Advanced compliance reports',
      'PDF & Excel export',
      'Leave request management',
      'Scheduling module',
      'Priority email & chat support',
      'Manager mobile app',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Custom deployment for large workforces requiring dedicated support.',
    price: 'Custom',
    period: '',
    seats: '250+ employees',
    cta: 'Contact Sales',
    href: 'mailto:hello@modeky.com',
    highlighted: false,
    features: [
      'Everything in Business',
      'Unlimited employees & sites',
      'Payroll integration API',
      'Workforce analytics & BI',
      'Custom WhatsApp flows',
      'SSO / Active Directory',
      'Dedicated account manager',
      '99.9% SLA uptime',
      'On-site onboarding',
      'Custom contract & invoicing',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ModekyLogo size={32} />
            <span className="font-bold text-lg text-foreground">Modeky</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as your workforce grows. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.highlighted
                  ? 'rounded-2xl border-2 border-primary bg-card p-8 shadow-card-hover relative md:-mt-4'
                  : 'rounded-2xl border border-border bg-card p-8 shadow-card'
              }
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 min-h-[2.5rem]">{tier.description}</p>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {tier.price}
                </span>
                {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                <Users className="w-4 h-4" />
                {tier.seats}
              </div>

              <Link
                href={tier.href}
                className={
                  tier.highlighted
                    ? 'block w-full text-center py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition mb-6'
                    : 'block w-full text-center py-3 rounded-xl font-semibold bg-foreground text-background hover:opacity-90 transition mb-6'
                }
              >
                {tier.cta}
              </Link>

              <div className="border-t border-border pt-6">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
                  WHAT&rsquo;S INCLUDED
                </p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:hello@modeky.com" className="hover:text-foreground transition">hello@modeky.com</a></li>
                <li><a href="tel:+27" className="hover:text-foreground transition">+27 (South Africa)</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Modeky. The workforce operating system for Africa.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition">LinkedIn</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
