import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Modeky - The WhatsApp Workforce Operating System',
  description: 'Verify employee attendance and site presence directly through WhatsApp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
