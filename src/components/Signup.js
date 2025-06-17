import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register', form);
      alert('Signup successful');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <br />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <br />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <br />
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default Signup;