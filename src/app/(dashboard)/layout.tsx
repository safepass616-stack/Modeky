import { ModekyLogo } from '@/components/ModekyLogo';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ModekyLogo size={36} showText={true} variant="horizontal" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <p>© 2024 Modeky</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 sm:px-6 lg:px-8">
          {/* Mobile Logo */}
          <div className="md:hidden">
            <ModekyLogo size={28} showText={false} variant="icon" />
          </div>

          {/* Topbar Content */}
          <div className="flex-1 flex items-center justify-end">
            <Topbar />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
