'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FiLogIn } from 'react-icons/fi'; // Importing a login icon from react-icons

const Navbar: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(true); // Change this to `true` or `false` to simulate login state
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const userName = 'John Doe'; // Replace with dynamic user name if available

  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out');
    setLoggedIn(false);
    setShowLogoutMenu(false);
  };

  return (
    <nav className="flex items-center justify-between  bg-teal-800 px-4 py-4 shadow-lg">
      <div className="text-xl font-bold text-gray-100">CS Tracer</div>
      {loggedIn && (
        <div className="relative">
          <div
            className="flex cursor-pointer items-center space-x-2 text-white"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            <FiLogIn className="text-xl" />
            <span>{userName}</span>
          </div>
          {showLogoutMenu && (
            <div className="absolute right-0 mt-2 w-32 rounded border border-gray-300 bg-white shadow-lg">
              <div
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
