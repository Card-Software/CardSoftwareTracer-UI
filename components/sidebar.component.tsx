'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons for toggle button
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';

interface MenuItem {
  id: number;
  label: string;
  link?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { id: 2, label: 'Trac. Stream', link: '/traceability-stream' },
  { id: 3, label: 'Dashboard', link: '/dashboard' },
  { id: 4, label: 'Man. Dashboard', link: '/manager-dashboard' },
  {
    id: 5,
    label: 'Admin',
    subItems: [
      { id: 6, label: 'Groups', link: '/admin/groups' },
      { id: 7, label: 'Team Labels', link: '/admin/team-labels' },
      { id: 8, label: 'Statuses', link: '/admin/team-statuses' },
    ],
  },
  { id: 9, label: 'Requests', link: '/requests' },
];

const Sidebar: React.FC = () => {
  const fullPath = usePathname() || '/';
  const highestHierarchyPath = '/' + fullPath.split('/')[1];
  const [pathname, setPathname] = useState(fullPath);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for collapse
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({}); // State for expand

  useEffect(() => {
    setPathname(fullPath);
  }, [fullPath]);

  useEffect(() => {
    const user: User = userAuthenticationService.getUser() as User;
    if (!user) return;
    setIsAdmin(user.role.includes('Admin'));
  }, []);

  useEffect(() => {
    const adminMenu = menuItems.find((item) => item.label === 'Admin');
    if (adminMenu?.subItems) {
      const expanded = adminMenu.subItems.some((subItem) =>
        fullPath.includes(subItem.link || ''),
      );
      setExpandedItems((prevState) => ({
        ...prevState,
        [adminMenu.id]: expanded,
      }));
    }
  }, [fullPath]);

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const toggleExpand = (id: number) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <aside
      className={`sidebar flex h-full min-h-screen ${
        isCollapsed ? 'w-16' : 'w-44 min-w-44'
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
          const isExpanded = expandedItems[menu.id];
          return (
            <div key={menu.id} style={{ width: '100%' }}>
              {menu.link ? (
                <Link href={menu.link}>
                  <div
                    className={`px-4 py-2 ${
                      isActive
                        ? 'bg-gray-200 font-bold text-black'
                        : 'hover:bg-gray-500 hover:text-white'
                    } ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'} rounded-md transition-all duration-700 ease-in-out`}
                  >
                    {menu.label}
                  </div>
                </Link>
              ) : (
                isAdmin && (
                  <div
                    className={`cursor-pointer px-4 py-2 ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'} rounded-md transition-all duration-700 ease-in-out`}
                    onClick={() => toggleExpand(menu.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{menu.label}</span>
                      <span
                        className={`transition-transform duration-300 ease-in-out ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      >
                        <FaChevronDown size={12} color="gray" />
                      </span>
                    </div>
                  </div>
                )
              )}

              <div
                className={`ml-5 mr-3 overflow-hidden transition-all duration-700 ease-in-out`}
              >
                {menu.subItems &&
                  isExpanded &&
                  menu.subItems.map((subItem) => (
                    <Link key={subItem.id} href={subItem.link || '#'}>
                      <div
                        className={`px-4 py-2 ${
                          pathname.includes(subItem.link || '')
                            ? 'bg-gray-200 font-bold text-black'
                            : 'hover:bg-gray-500 hover:text-white'
                        } rounded-md transition-all duration-300 ease-in-out`}
                      >
                        {subItem.label}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
