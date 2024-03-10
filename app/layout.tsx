import type { Metadata } from 'next';
import localFont from 'next/font/local';

import '../styles/globals.css';

const suisseIntl = localFont({
  src: [
    {
      path: '../public/fonts/SuisseIntl-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SuisseIntl-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-sans-serif',
});

export const metadata: Metadata = {
  title: 'Nenad Marinković — Frontend Developer',
  description: 'I build websites, web interfaces, and applications.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${suisseIntl.variable}`}>{children}</body>
    </html>
  );
}
