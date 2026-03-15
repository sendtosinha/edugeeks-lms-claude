import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://edugeeks.co.in'),
  title: {
    default: 'EduGeeks — Smart Learning for Class 9–12 | CBSE, JEE, NEET, CUET',
    template: '%s | EduGeeks',
  },
  description: 'Affordable HD video courses, revision notes, and test series for Class 9–12 CBSE students. Prepare for JEE, NEET, and CUET with expert instructors.',
  keywords: ['CBSE', 'JEE preparation', 'NEET preparation', 'CUET', 'Class 9 10 11 12', 'online learning', 'test series', 'video lectures'],
  openGraph: {
    type: 'website',
    siteName: 'EduGeeks',
    locale: 'en_IN',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'EduGeeks LMS' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@EduGeeks',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1E293B',
                color: '#F8FAFC',
                borderRadius: '12px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
