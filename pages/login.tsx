import { userAuthenticationService } from '@/services/user-authentication.service';
import { useState, KeyboardEvent, useEffect } from 'react';
import '../app/globals.css';
import router from 'next/router';
import LoadingOverlay from '@/components/loading-overlay.component';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  //check if the user is logged in
  useEffect(() => {
    const loggedIn = userAuthenticationService.isLoggedIn();
    if (loggedIn) {
      router.push('/dashboard');
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true); // Set loading to true
    // Call the authentication service
    const logginStatus = await userAuthenticationService.login(
      username.trim().toLocaleLowerCase(),
      password,
    );
    setLoading(false); // Set loading to false

    if (!logginStatus) {
      alert('Invalid username or password');
      return;
    } else {
      router.push('/dashboard');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <LoadingOverlay show={loading} />
      {/* Left Side (Background with Title) */}
      <div
        className="hidden items-center justify-center bg-cover bg-center text-4xl font-bold text-white lg:flex lg:w-1/2"
        style={{ backgroundColor: '#051b38' }}
      >
        <div>
          <svg
            width="59"
            height="53"
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
        </div>
        <div className="ps-2 pt-2">Card Software Traceability</div>
      </div>
      {/* Mobile Layout Adjustment */}
      <div
        className="mb-20 flex w-full items-center justify-center rounded-b-lg bg-cover bg-center py-12 text-2xl font-bold text-white lg:hidden"
        style={{ backgroundColor: '#051b38' }}
      >
        Card Software Traceability
      </div>
      {/* Right Side (Login Form) */}
      <div className="flex w-full items-center justify-center bg-white lg:w-1/2">
        <div className="w-full max-w-xl p-8 lg:p-16">
          <h1 className="mb-8 text-center text-3xl font-bold">Login</h1>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">
              Email:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-600 focus:outline-none"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-7 border-none border-white bg-none text-sm text-gray-500 shadow-none"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            onClick={handleLogin}
            type="button"
            className="w-full rounded-md px-4 py-2 text-white focus:outline-none"
            style={{ backgroundColor: '#051b38' }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
