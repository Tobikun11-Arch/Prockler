import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://prockler.vercel.app/'),
  title: "Prockler",
  description:
    "Prockler is a productivity app for tracking daily tasks and goals.",
  icons: {
    icon: [
      {url: '/logo.png', type: 'image/png', sizes: '32x32'},
      {url: '/logo.png', type: 'image/png', sizes: '192x192'}
    ],
    apple: '/logo.png'
  },
  openGraph: {
    title: "Prockler",
    description:
      "Prockler is a productivity app for tracking daily tasks and goals.",
    url: 'https://prockler.vercel.app//',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: "Prockler Preview"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
