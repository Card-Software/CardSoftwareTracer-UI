import React, { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/nav-bar.component';
import Sidebar from '@/components/sidebar.component';

interface Props {
  children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
