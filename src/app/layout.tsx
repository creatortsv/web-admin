import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';

export const metadata: Metadata = {
  title: 'Venom Finance — Super-Admin Back-Office',
  description: 'Isolated administration cockpit for Venom Finance quantitative platform.',
  robots: 'noindex, nofollow', // Strictly private back-office
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#070A12] text-[#F8FAFC] antialiased flex" suppressHydrationWarning>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
