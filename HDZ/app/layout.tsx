import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HDZ Assessment Dashboard — Human Dignity Zone Tool',
  description:
    'A GIS-based decision-support tool for evaluating locations for housing and facilities for vulnerable groups. Assess spatial feasibility, social justice, and legal defensibility.',
  keywords: ['urban planning', 'housing', 'GIS', 'policy', 'vulnerable groups', 'spatial analysis'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#0a0e1a] text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
