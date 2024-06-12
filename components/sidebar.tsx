// components/Sidebar.tsx
import Link from 'next/link';
import React from 'react';

interface MenuItem {
  id: number;
  label: string;
  link: string;
}

const menuItems: MenuItem[] = [
  { id: 1, label: 'Home', link: '/' },
  { id: 2, label: 'Trac. Stream', link: '/TraceabilityStream' },
  { id: 3, label: 'Dashboard', link: '/DashboardPage' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar inline-block h-full bg-blue-900 text-white">
      <div className="flex flex-col items-end">
        {menuItems.map((menu) => (
          <Link key={menu.id} href={menu.link} style={{ width: '100%' }}>
            <div className="px-4 py-2 text-right hover:bg-blue-700">
              {menu.label}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
