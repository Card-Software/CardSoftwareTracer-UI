// components/Sidebar.tsx
import React from "react";

const menuItems = [
  { id: 1, label: "Home", link: "/" },
  { id: 2, label: "Manage Posts", link: "/posts" },
  { id: 3, label: "Manage Users", link: "/users" },
  { id: 4, label: "Manage Tutorials", link: "/tutorials" },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-200 h-full w-64">
      <div className="flex flex-col items-start mt-24">
        {menuItems.map(({ ...menu }) => {
          return <div>{menu.label}</div>;
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
