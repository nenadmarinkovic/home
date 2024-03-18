import type { Metadata } from 'next';

import '../styles/globals.css';

import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['400', '500', '600', '800'],
  subsets: ['latin'],
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
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}
