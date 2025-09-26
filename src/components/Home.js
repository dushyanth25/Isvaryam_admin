import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // We'll create this CSS file

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-menu">
            <span>Welcome, {user.name || 'Admin'}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Navigation Cards */}
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/add-product')}>
            <div className="card-icon">📦</div>
            <h3>Add Product</h3>
            <p>Create new product listings</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/display-products')}>
            <div className="card-icon">📋</div>
            <h3>Display Products</h3>
            <p>View and manage products</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/reviews')}>
            <div className="card-icon">⭐</div>
            <h3>Reviews</h3>
            <p>Manage customer reviews</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/wishlist')}>
            <div className="card-icon">❤️</div>
            <h3>Wishlist</h3>
            <p>View customer wishlists</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/coupons')}>
            <div className="card-icon">🎫</div>
            <h3>Coupons</h3>
            <p>Create and manage discounts</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/display-recipes')}>
            <div className="card-icon">📝</div>
            <h3>Display Recipes</h3>
            <p>View and manage recipes</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/add-recipe')}>
            <div className="card-icon">🍳</div>
            <h3>Add Recipe</h3>
            <p>Create new recipes</p>
          </div>
        

        <div className="dashboard-card" onClick={() => navigate('/Order')}>
            <div className="card-icon">🍳</div>
            <h3>Orders</h3>
            <p>All orders</p>
          </div>
        </div>
<div className="dashboard-card" onClick={() => navigate('/users')}>
            <div className="card-icon">👤</div>
            <h3>Users</h3>
            <p>View and manage users</p>
          </div>
        
        {/* Fastbot Integration */}
        
        
      </div>
    </div>
  );
}

export default Home;
