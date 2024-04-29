// components/Sidebar.tsx
import React from "react";

const menuItems = [
  { id: 1, label: "Home", link: "/" },
  { id: 2, label: "Process Editor", link: "/process-editor" },
  { id: 3, label: "Dashboard", link: "/dashboard" },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-blue-900 text-white h-full w-32">
      <div className="flex flex-col items-start mt-24">
        {menuItems.map(({ ...menu }) => {
          return <div>{menu.label}</div>;
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
