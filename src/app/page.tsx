import Link from 'next/link';
import { ArrowRight, MapPin, Camera, Eye, FileText, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">M</div>
            <span className="font-bold text-lg text-foreground">Modeky</span>
          </div>
          
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-secondary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Verify Your Workforce Through WhatsApp
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Modeky helps security companies, cleaning businesses, contractors, and field teams verify attendance, track site activity, and manage operations directly through WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Book a Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Split Screen Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
            {/* WhatsApp Demo */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
                  {/* Phone Frame */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-3 rounded-3xl">
                    <div className="bg-white rounded-2xl overflow-hidden">
                      {/* WhatsApp Header */}
                      <div className="bg-green-600 text-white px-4 py-3 text-sm font-medium">
                        Modeky Bot
                      </div>
                      
                      {/* Messages */}
                      <div className="bg-green-50 p-4 space-y-4 h-96">
                        <div className="flex justify-end">
                          <div className="bg-green-100 text-foreground px-3 py-2 rounded-lg text-sm max-w-xs">
                            START
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-white border border-border text-foreground px-3 py-2 rounded-lg text-sm max-w-xs">
                            👋 Hello! Please share your location
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <div className="bg-green-100 text-foreground px-3 py-2 rounded-lg text-sm max-w-xs">
                            📍 Location shared
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-white border border-border text-foreground px-3 py-2 rounded-lg text-sm max-w-xs">
                            Now please take a selfie 📸
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <div className="bg-green-100 text-foreground px-3 py-2 rounded-lg text-sm max-w-xs">
                            📸 Photo sent
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                            ✅ Check-in successful!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Demo */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-foreground text-white px-4 py-3">
                  <h3 className="text-sm font-semibold">Dashboard</h3>
                </div>
                
                {/* Stats Cards */}
                <div className="p-4 space-y-3 bg-background">
                  <div className="bg-card p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold text-foreground">24</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Checked In Today</p>
                    <p className="text-2xl font-bold text-success">22</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Late Employees</p>
                    <p className="text-2xl font-bold text-warning">2</p>
                  </div>
                </div>

                {/* Attendance Table Preview */}
                <div className="p-4 border-t border-border">
                  <p className="text-xs font-semibold text-foreground mb-2">Recent Check-ins</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">John M.</span>
                      <span className="text-success font-medium">✓ On time</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">Sarah P.</span>
                      <span className="text-success font-medium">✓ Verified</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">Mike D.</span>
                      <span className="text-warning font-medium">⚠ 15 min late</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Simple Workflow
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three steps. Instant verification. Real-time visibility.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Employee Sends START', desc: 'Worker texts START on WhatsApp', icon: MessageSquare },
              { step: 2, title: 'Location & Selfie', desc: 'Share GPS location and take a selfie', icon: Camera },
              { step: 3, title: 'Instant Dashboard Update', desc: 'Attendance appears in real-time', icon: CheckCircle },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-bold mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Why Modeky</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Built for field operations. Trusted by enterprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: MapPin, title: 'GPS Verification', desc: 'Know exactly where employees checked in' },
              { icon: Camera, title: 'Selfie Verification', desc: 'Confirm who checked in with photo proof' },
              { icon: Eye, title: 'Site Visibility', desc: 'Monitor all locations in real time' },
              { icon: FileText, title: 'Compliance Reports', desc: 'Export attendance records instantly' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Powerful Dashboard
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to manage your workforce in one place
          </p>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
            <div className="bg-foreground text-white px-6 py-4">
              <h3 className="font-semibold">Dashboard Overview</h3>
            </div>
            <div className="p-8 bg-muted/50 grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Employees', value: '256' },
                { label: 'Checked In Today', value: '248' },
                { label: 'Late Employees', value: '5' },
                { label: 'Sites Covered', value: '12' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">{label}</p>
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Built for Your Industry</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Security Companies', desc: 'Verify guard attendance and site coverage in real-time' },
              { title: 'Cleaning Businesses', desc: 'Track teams across multiple client sites with ease' },
              { title: 'Construction', desc: 'Monitor workforce attendance across projects and job sites' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-6 bg-card rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What Customers Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "Modeky has transformed how we manage our guards. Real-time visibility across 50+ sites.", author: 'John M.', role: 'Operations Manager, Security Corp' },
              { quote: 'The WhatsApp integration is genius. All our cleaners already have WhatsApp, zero learning curve.', author: 'Sarah P.', role: 'HR Manager, Clean Pro' },
              { quote: 'GPS verification eliminates excuses. We know exactly where our teams are, every moment.', author: 'Mike D.', role: 'Site Manager, BuildCo' },
            ].map(({ quote, author, role }) => (
              <div key={author} className="p-6 bg-card rounded-lg border border-border">
                <p className="text-foreground mb-4 italic">"{quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{author}</p>
                  <p className="text-sm text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-background to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            The Key to Workforce Operations
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Everything starts with a WhatsApp message. Join companies across Africa who trust Modeky.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition text-lg">
              Book a Demo
            </button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required. Set up in minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
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
