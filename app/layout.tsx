import type { Metadata } from 'next';

import StoreProvider from './StoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Griddy',
  description: '', // TODO write metadata
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className="bg-slate-700">{children}</body>
      </html>
    </StoreProvider>
  );
}
