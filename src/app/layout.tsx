import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TradeEdge PRO - Personal Trading Journal & Behavioral Performance',
  description:
    'Production-ready intraday trading journal for NIFTY, BANKNIFTY & Index options with behavioral analytics, rule violation tracking, and strategy expectancy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
