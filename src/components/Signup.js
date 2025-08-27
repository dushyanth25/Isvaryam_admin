import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // We'll create this CSS file

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post('/api/users/register', form);
      setIsLoading(false);
      alert('Signup successful');
      navigate('/login');
    } catch (err) {
      setIsLoading(false);
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Create Admin Account</h2>
          <p>Register for system access</p>
        </div>
        
        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input 
              name="name" 
              id="name"
              placeholder="Enter your full name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              name="email" 
              type="email" 
              id="email"
              placeholder="Enter your email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              name="password" 
              type="password" 
              id="password"
              placeholder="Create a strong password" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="address">Address</label>
            <input 
              name="address" 
              id="address"
              placeholder="Enter your address" 
              value={form.address} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className={`signup-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>
        
        <div className="signup-footer">
          <p>Already have an account? <a href="/login" className="login-link">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;