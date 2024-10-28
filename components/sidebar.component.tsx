'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons for toggle button

interface MenuItem {
  id: number;
  label: string;
  link: string;
}

const menuItems: MenuItem[] = [
  { id: 2, label: 'Trac. Stream', link: '/traceability-stream' },
  { id: 3, label: 'Dashboard', link: '/dashboard' },
  { id: 4, label: 'Man. Dashboard', link: '/manager-dashboard' },
  { id: 5, label: 'Requests', link: '/requests' },
];

const Sidebar: React.FC = () => {
  const fullPath = usePathname() || '/';
  const highestHierarchyPath = '/' + fullPath.split('/')[1];
  const [pathname, setPathname] = useState(highestHierarchyPath);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for collapse

  useEffect(() => {
    const highestHierarchy = '/' + fullPath.split('/')[1];
    setPathname(highestHierarchy);
  }, [fullPath]);

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  return (
    <aside
      className={`sidebar flex h-full min-h-screen ${
        isCollapsed ? 'w-16' : 'w-44'
      } flex-col border-e-2 border-white bg-gray-100 text-black transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button */}
      <div className="flex justify-start p-2">
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center rounded border-none p-2 shadow-none transition "
        >
          {isCollapsed ? (
            <svg
              width="30"
              height="19"
              viewBox="0 0 30 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H28.25"
                stroke="#000D26"
                strokeWidth="2.8125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 9.5H28.25"
                stroke="#000D26"
                strokeWidth="2.8125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17H28.25"
                stroke="#000D26"
                strokeWidth="2.8125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="30"
              height="19"
              viewBox="0 0 30 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H28.25"
                stroke="#000D26"
                strokeWidth="2.8125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 9.5H28.25"
                stroke="#000D26"
                strokeWidth="2.8125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17H28.25"
                stroke="#000D26"
                strokeWidth="2.8125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-grow flex-col items-start">
        {menuItems.map((menu) => {
          const isActive = highestHierarchyPath === menu.link;
          return (
            <Link key={menu.id} href={menu.link} style={{ width: '100%' }}>
              <div
                className={`px-4 py-2 ${
                  isActive
                    ? 'bg-gray-200 font-bold text-black'
                    : 'hover:bg-gray-500 hover:text-white'
                } ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'} rounded-md transition-all duration-300 ease-in-out`}
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
