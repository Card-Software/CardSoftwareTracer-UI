import React, { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      {' '}
      {/* Updated to flex-col */}
      <Navbar />
      <div className="flex flex-grow">
        {' '}
        {/* Updated to flex-grow */}
        <Sidebar />
        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
