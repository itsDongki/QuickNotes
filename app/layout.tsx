import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import AuthSessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'QuickNotes - Minimal Notes App',
  description: 'A simple and elegant notes app built with Next.js and Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AuthSessionProvider>
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
