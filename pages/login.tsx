import { userAuthenticationService } from '@/services/UserAuthentication.service';
import { useState } from 'react';
import '../app/globals.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Call the authentication service
    userAuthenticationService.login(username, password);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Side (Background with Title) */}
      <div className="hidden items-center justify-center bg-teal-800 bg-cover bg-center text-4xl font-bold text-white lg:flex lg:w-1/2">
        Card Software Traceability
      </div>
      {/* Mobile Layout Adjustment */}
      <div className="flex w-full items-center justify-center rounded-b-lg bg-teal-800 bg-cover bg-center py-12 text-2xl font-bold text-white lg:hidden">
        Card Software Traceability
      </div>
      {/* Right Side (Login Form) */}
      <div className="flex w-full items-center justify-center bg-white lg:w-1/2">
        <div className="w-full max-w-xl p-8 lg:p-16">
          <h1 className="mb-8 text-center text-3xl font-bold">Login</h1>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-600 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-600 focus:outline-none"
            />
          </div>
          <button
            onClick={handleLogin}
            type="button"
            className="w-full rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
