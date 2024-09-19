'use client';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { useRouter } from 'next/navigation'; // Correct import for Next.js App Router
import React, { useEffect, useState } from 'react';
import { FiLogIn } from 'react-icons/fi'; // Importing a login icon from react-icons
import '../styles/main.css';
import { User } from '@/models/user';

const Navbar: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(true); // Simulate login state
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const router = useRouter(); // Use useRouter from 'next/navigation'

  const user: User | null = userAuthenticationService.getUser();

  const handleProfile = () => {
    console.log('Profile icon clicked');
    router.push('/profile'); // Navigate to Profile page
  };

  // Check if the user is logged in
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
    <nav
      className="flex items-center justify-between px-4 py-4"
      style={{ backgroundColor: 'var(--primary-color)' }}
    >
      <div className="flex flex-row items-center">
        <svg
          width="45"
          height="40"
          viewBox="0 0 59 53"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M40.8225 11.9603V0H40.8243L54.068 17.4184L46.9231 23.0816C47.104 23.9042 47.2388 24.7441 47.3266 25.5971C47.404 26.364 47.444 27.1405 47.444 27.9275C47.444 28.4048 47.4292 28.8787 47.3988 29.3483C46.6675 41.1495 36.8653 50.4925 24.8798 50.4925C22.4573 50.4925 20.1261 50.1065 17.9392 49.4004L0 52.5412L16.5349 36.2471L40.8225 11.9603ZM54.6585 27.624V19.8409L59 23.2824L54.6585 27.624Z"
            fill="#D51E3E"
          />
        </svg>
        <div className="ms-6 cursor-pointer pt-3 text-lg font-bold text-gray-300">
          Card Software Tracer
        </div>
      </div>
      {loggedIn && (
        <div className="relative flex flex-row items-center gap-3">
          {/* Profile Icon */}
          <div>
            <h3 className="text-white">
              {user?.firstName} {user?.lastname}
            </h3>
          </div>
          <div className="cursor-pointer" onClick={handleProfile}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 33 33"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.25 0C13.0361 0 9.89429 0.953046 7.22199 2.73862C4.54969 4.52419 2.46689 7.06209 1.23696 10.0314C0.0070408 13.0007 -0.314763 16.268 0.312246 19.4202C0.939256 22.5724 2.48692 25.4679 4.75952 27.7405C7.03212 30.0131 9.92759 31.5607 13.0798 32.1878C16.232 32.8148 19.4993 32.493 22.4686 31.263C25.4379 30.0331 27.9758 27.9503 29.7614 25.278C31.547 22.6057 32.5 19.4639 32.5 16.25C32.4956 11.9416 30.7821 7.8109 27.7356 4.76439C24.6891 1.71788 20.5584 0.0044121 16.25 0ZM26.25 25.7C25.0877 24.1445 23.5786 22.8816 21.8427 22.0117C20.1067 21.1418 18.1917 20.6889 16.25 20.6889C14.3083 20.6889 12.3933 21.1418 10.6573 22.0117C8.92137 22.8816 7.41228 24.1445 6.25001 25.7C4.40674 23.7468 3.17581 21.2966 2.70916 18.6519C2.24252 16.0071 2.5606 13.2836 3.62413 10.8175C4.68767 8.35149 6.45009 6.25087 8.69383 4.77503C10.9376 3.29918 13.5644 2.51271 16.25 2.51271C18.9356 2.51271 21.5624 3.29918 23.8062 4.77503C26.0499 6.25087 27.8123 8.35149 28.8759 10.8175C29.9394 13.2836 30.2575 16.0071 29.7908 18.6519C29.3242 21.2966 28.0933 23.7468 26.25 25.7Z"
                fill="#F4F6FA"
              />
              <path
                d="M16.2497 6.56668C15.3235 6.56668 14.418 6.84135 13.6478 7.35596C12.8776 7.87058 12.2774 8.60201 11.9229 9.45778C11.5684 10.3135 11.4757 11.2552 11.6564 12.1637C11.8371 13.0722 12.2831 13.9067 12.9381 14.5616C13.5931 15.2166 14.4276 15.6626 15.3361 15.8434C16.2445 16.0241 17.1862 15.9313 18.042 15.5768C18.8977 15.2224 19.6292 14.6221 20.1438 13.8519C20.6584 13.0818 20.9331 12.1763 20.9331 11.25C20.9353 10.6344 20.8156 10.0244 20.5811 9.45518C20.3465 8.88597 20.0016 8.36881 19.5663 7.93349C19.1309 7.49816 18.6138 7.15327 18.0446 6.91869C17.4754 6.68411 16.8654 6.56448 16.2497 6.56668Z"
                fill="#F4F6FA"
              />
            </svg>
          </div>

          {/* Logout Icon */}
          <div
            className="flex cursor-pointer items-center text-white"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            <FiLogIn className="text-xl" />
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
