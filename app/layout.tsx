import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

import '../styles/globals.css';

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
    <html lang="en" className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
