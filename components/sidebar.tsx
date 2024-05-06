// components/Sidebar.tsx
import Link from "next/link";
import React from "react";

const menuItems = [
  { id: 1, label: "Home", link: "/" },
  { id: 2, label: "Process Editor", link: "/ProcessEditorPage" },
  { id: 3, label: "Dashboard", link: "/DashboardPage" },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-blue-900 text-white flex flex-col sidebar">
      <div className="flex flex-col items-start mt-24">
        {menuItems.map(({ ...menu }) => {
          return (
            <div>
              <Link href={menu.link}>
                <div>{menu.label}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
