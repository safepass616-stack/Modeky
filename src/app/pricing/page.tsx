'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { ModekyLogo } from '@/components/ModekyLogo';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'R499',
      period: '/month',
      description: 'Perfect for small teams',
      features: [
        'Up to 50 employees',
        '1 site location',
        'Basic attendance tracking',
        'WhatsApp notifications',
        'Email support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: 'R1,299',
      period: '/month',
      description: 'For growing operations',
      features: [
        'Up to 250 employees',
        'Unlimited sites',
        'GPS verification',
        'Incident reporting',
        'Schedule management',
        'CSV/Excel exports',
        'Priority support',
        'Custom integrations',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        'Custom workflows',
        'White-label option',
        'Advanced analytics',
        'SLA guarantee',
        '24/7 phone support',
        'On-premise option',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition">
            <ModekyLogo size={32} showText={true} variant="horizontal" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-foreground hover:text-primary transition font-medium">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your team. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-card border border-border rounded-lg p-1">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium transition">
              Monthly
            </button>
            <button className="px-6 py-2 text-foreground hover:bg-muted rounded-md font-medium transition">
              Annual
              <span className="ml-2 text-sm font-semibold text-success">-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border transition ${
                  plan.highlighted
                    ? 'bg-primary/5 border-primary shadow-xl scale-105 md:scale-100'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-2.5 rounded-lg font-medium transition mb-8 ${
                      plan.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, get 14 days free on any plan. No credit card required.',
              },
              {
                q: 'What about data security?',
                a: 'All data is encrypted end-to-end and stored securely on enterprise-grade servers.',
              },
              {
                q: 'Do you offer discounts for annual plans?',
                a: 'Yes, save 20% when you pay annually. Enterprise customers can negotiate custom rates.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-background rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of companies using Modeky to manage their workforce.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
