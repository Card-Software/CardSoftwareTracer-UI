'use client';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

interface MenuItem {
  id: number;
  label: string;
  link: string;
}

const menuItems: MenuItem[] = [
  { id: 1, label: 'Home', link: '/' },
  { id: 2, label: 'Trac. Stream', link: '/TraceabilityStream' },
  { id: 3, label: 'Dashboard', link: '/Dashboard' },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname() || '/';

  return (
    <aside className="sidebar inline-block h-full w-44 bg-gray-100 text-teal-900">
      <div className="flex flex-col items-end">
        {menuItems.map((menu) => {
          const isActive = pathname === menu.link;
          return (
            <Link key={menu.id} href={menu.link} style={{ width: '100%' }}>
              <div
                className={`px-4 py-2 text-right ${
                  isActive ? 'bg-teal-700' : 'hover:bg-teal-500'
                }`}
              >
                {menu.label}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
