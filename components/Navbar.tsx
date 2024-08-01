'use client';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import router from 'next/router';
import React, { use, useEffect, useRef, useState } from 'react';
import { FiLogIn } from 'react-icons/fi'; // Importing a login icon from react-icons

const Navbar: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(true); // Change this to `true` or `false` to simulate login state
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [userName, setUserName] = useState(''); // Change this to the user's name

  useEffect(() => {
    const fullName = userAuthenticationService.getFullName();
    if (fullName) {
      setUserName(fullName);
    }
  }, []);

  const handleProfile = () => {
    router.push('/Profile');
  };

  //use effect to now if the user is logged in
  useEffect(() => {
    const loggedIn = userAuthenticationService.isLoggedIn();
    setLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    userAuthenticationService.logout();
    router.push('/login');
    setLoggedIn(false);
    setShowLogoutMenu(false);
  };

  return (
    <nav className="flex items-center justify-between  border-b-2 border-white bg-teal-700 px-4 py-4 shadow-lg">
      <div className="text-xl font-bold text-white">CS Tracer</div>
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
              <div
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={handleProfile}
              >
                Profile
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
