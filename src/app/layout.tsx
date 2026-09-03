import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const extensionErrorSuppressor = `(function() {
  function isExtensionError(msg, src, err) {
    var str = String(msg || '') + ' ' + String(src || '') + ' ' + (err && err.stack ? String(err.stack) : '');
    return str.indexOf('chrome-extension://') !== -1 ||
           str.indexOf('moz-extension://') !== -1 ||
           str.indexOf('safari-extension://') !== -1 ||
           str.indexOf('registerSolanaInjectedWallet') !== -1 ||
           str.indexOf('initSolanaConnect') !== -1 ||
           str.indexOf('solana.js') !== -1 ||
           str.indexOf('extensionPageScript') !== -1 ||
           str.indexOf('bybit') !== -1;
  }
  window.addEventListener('error', function(e) {
    if (isExtensionError(e.message, e.filename, e.error)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
  }, true);
  window.addEventListener('unhandledrejection', function(e) {
    var reason = e.reason;
    var str = reason ? (reason.stack || reason.message || String(reason)) : '';
    if (isExtensionError(str, '', reason)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
  }, true);
})();`;

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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#070A12] text-slate-100 font-sans antialiased flex selection:bg-rose-500/20 selection:text-rose-300"
        suppressHydrationWarning
      >
        <Script
          id="extension-error-suppressor"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: extensionErrorSuppressor }}
        />
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
