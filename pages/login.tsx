import Layout from '@/app/layout';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Call the authentication service
    userAuthenticationService.login(username, password);
  };

  return (
    <div>
      <h1>Login</h1>
      <div>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleLogin} type="button">
        Login
      </button>
    </div>
  );
};

export default Login;
