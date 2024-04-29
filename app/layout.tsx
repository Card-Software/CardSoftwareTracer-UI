// layouts/RootLayout.tsx
import React from 'react';
import { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'Tracer',
  description: 'App for tracing documents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col">
        <Navbar />
        <div className="flex flex-grow">
          <Sidebar />
          <main className="flex-grow p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
