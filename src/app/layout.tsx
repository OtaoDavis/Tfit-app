import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/contexts/auth-context'; // Import AuthProvider

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'The Treasured Collective',
  description: 'Your personal fitness companion for mindset, nutrition, movement, and community.',
  icons: {
    icon: '/favicon.ico', // General favicon
    apple: '/apple-touch-icon.png', // For Apple devices
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${quicksand.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> {/* Wrap children with AuthProvider */}
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
