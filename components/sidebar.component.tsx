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
    label: 'Groups',
    subItems: [
      { id: 6, label: 'Groups', link: '/group1' },
      { id: 7, label: 'Team Labels', link: '/group2' },
      { id: 8, label: 'Statuses', link: '/group3' },
    ],
  },
];

const Sidebar: React.FC = () => {
  const fullPath = usePathname() || '/';
  const highestHierarchyPath = '/' + fullPath.split('/')[1];
  const [pathname, setPathname] = useState(highestHierarchyPath);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for collapse
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({}); // State for expand

  useEffect(() => {
    const highestHierarchy = '/' + fullPath.split('/')[1];
    setPathname(highestHierarchy);
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

  const user = userAuthenticationService.getUser() as User;
  const isAdmin = user.role.includes('Admin');

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
                style={{
                  maxHeight: isExpanded
                    ? `${(menu.subItems?.length || 0) * 48}px`
                    : '0px',
                }}
              >
                {menu.subItems &&
                  menu.subItems.map((subItem) => (
                    <Link key={subItem.id} href={subItem.link || '#'}>
                      <div
                        className={`px-4 py-2 ${
                          pathname === subItem.link
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

    // <aside
    //   className={`sidebar flex h-full min-h-screen ${
    //     isCollapsed ? 'w-16' : 'w-44'
    //   } flex-col border-e-2 border-white bg-gray-100 text-black transition-all duration-300 ease-in-out`}
    // >
    //   {/* Toggle Button */}
    //   <div className="flex justify-start p-2">
    //     <button
    //       onClick={toggleCollapse}
    //       className="flex items-center justify-center rounded border-none p-2 shadow-none transition "
    //     >
    //       {isCollapsed ? (
    //         <FaChevronRight />
    //       ) : (
    //         <FaChevronLeft />
    //       )}
    //     </button>
    //   </div>

    //   <div className="flex flex-grow flex-col items-start">
    //     {menuItems.map((menu) => {
    //       const isActive = highestHierarchyPath === menu.link;
    //       const isExpanded = expanded[menu.id];

    //       return (
    //         <div key={menu.id} style={{ width: '100%' }}>
    //           {/* Render parent menu items */}
    //           {menu.link ? (
    //             <Link href={menu.link}>
    //               <div
    //                 className={`px-4 py-2 ${
    //                   isActive
    //                     ? 'bg-gray-200 font-bold text-black'
    //                     : 'hover:bg-gray-500 hover:text-white'
    //                 } ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'} rounded-md transition-all duration-300 ease-in-out`}
    //               >
    //                 {menu.label}
    //               </div>
    //             </Link>
    //           ) : (
    //             <div
    //               className={`px-4 py-2 cursor-pointer ${
    //                 isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
    //               } rounded-md transition-all duration-300 ease-in-out`}
    //               onClick={() => toggleExpand(menu.id)}
    //             >
    //               <div className="flex items-center justify-between">
    //                 <span>{menu.label}</span>
    //                 {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
    //               </div>
    //             </div>
    //           )}

    //           {/* Render sub-items if they exist and are expanded */}
    //           {isExpanded && menu.subItems && (
    //             <div className={`pl-4 ${isCollapsed ? 'hidden' : 'block'}`}>
    //               {menu.subItems.map((subItem) => (
    //                 <Link key={subItem.id} href={subItem.link || '#'}>
    //                   <div
    //                     className={`px-4 py-2 ${
    //                       pathname === subItem.link
    //                         ? 'bg-gray-200 font-bold text-black'
    //                         : 'hover:bg-gray-500 hover:text-white'
    //                     } rounded-md transition-all duration-300 ease-in-out`}
    //                   >
    //                     {subItem.label}
    //                   </div>
    //                 </Link>
    //               ))}
    //             </div>
    //           )}
    //         </div>
    //       );
    //     })}
    //   </div>
    // </aside>
  );
};

export default Sidebar;
