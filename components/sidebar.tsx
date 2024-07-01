'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface MenuItem {
  id: number;
  label: string;
  link: string;
}

const menuItems: MenuItem[] = [
  { id: 2, label: 'Trac. Stream', link: '/TraceabilityStream' },
  { id: 3, label: 'Dashboard', link: '/Dashboard' },
];

const Sidebar: React.FC = () => {
  const fullPath = usePathname() || '/';
  const highestHierarchyPath = '/' + fullPath.split('/')[1];
  const [pathname, setPathname] = useState(highestHierarchyPath);

  useEffect(() => {
    const highestHierarchy = '/' + fullPath.split('/')[1];
    console.log('Current path:', fullPath);
    console.log('Highest hierarchy:', highestHierarchy);
    setPathname(highestHierarchy);
    console.log('Pathname after update:', highestHierarchy);
  }, [fullPath]);

  return (
    <aside className="sidebar flex h-full min-h-screen w-44 flex-col border-e-2 border-white bg-gray-100 text-teal-700">
      <div className="flex flex-grow flex-col items-end">
        {menuItems.map((menu) => {
          const isActive = highestHierarchyPath === menu.link;
          return (
            <Link key={menu.id} href={menu.link} style={{ width: '100%' }}>
              <div
                className={`px-4 py-2 text-right ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'hover:bg-teal-600 hover:text-white'
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
