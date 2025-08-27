import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // We'll create this CSS file

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsLoading(false);
      navigate('/home');
    } catch (err) {
      setIsLoading(false);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Admin Portal</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="/signup" className="signup-link">Request access</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;