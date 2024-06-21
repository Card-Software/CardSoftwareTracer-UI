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
  // { id: 1, label: 'Home', link: '/' },
  { id: 2, label: 'Trac. Stream', link: '/TraceabilityStream' },
  { id: 3, label: 'Dashboard', link: '/Dashboard' },
];

const Sidebar: React.FC = () => {
  const fullPath = usePathname() || '/'; // Get the full current path
  const highestHierarchyPath = '/' + fullPath.split('/')[1]; // Extract the highest hierarchy part
  const [pathname, setPathname] = useState(highestHierarchyPath); // Initialize state with the highest hierarchy

  // Use useEffect to update the pathname state whenever the path changes
  useEffect(() => {
    const highestHierarchy = '/' + fullPath.split('/')[1]; // Extract highest hierarchy
    console.log('Current path:', fullPath);
    console.log('Highest hierarchy:', highestHierarchy);
    setPathname(highestHierarchy); // Update state with new highest hierarchy
    console.log('Pathname after update:', highestHierarchy);
  }, [fullPath]);

  return (
    <aside className="sidebar inline-block h-full w-44 border-e-2 border-white bg-gray-100 text-teal-800">
      <div className="flex flex-col items-end">
        {menuItems.map((menu) => {
          const isActive = highestHierarchyPath === menu.link;
          return (
            <Link key={menu.id} href={menu.link} style={{ width: '100%' }}>
              <div
                className={`px-4 py-2 text-right ${
                  isActive ? 'bg-teal-800 text-white' : 'hover:bg-teal-500'
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
