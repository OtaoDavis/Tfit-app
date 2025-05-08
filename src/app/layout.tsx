import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/layout/theme-provider';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Standard favicon links are now handled by Next.js metadata.icons */}
        {/* You can add more specific links here if needed, e.g., for different sizes or manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${quicksand.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
