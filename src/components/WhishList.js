import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import './WhishList.css'; // We'll create this CSS file

function WhishList() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/whishlist');
      setWishlist(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wishlist data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`/api/whishlist/${productId}`);
      setWishlist(wishlist.filter(item => item.productId._id !== productId));
      // Using a more admin-appropriate notification instead of alert
      setError('Product removed from wishlist successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('Failed to remove product from wishlist');
      console.error(err);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-admin-container">
        <div className="wishlist-loading">Loading wishlist data...</div>
      </div>
    );
  }

  return (
    <div className="wishlist-admin-container">
      <h2 className="wishlist-admin-title">Wishlist Management</h2>
      
      {error && (
        <div className={`wishlist-message ${error.includes('Failed') ? 'error' : 'success'}`}>
          {error}
        </div>
      )}
      
      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <p>No products in wishlist.</p>
        </div>
      ) : (
        <div className="wishlist-table-container">
          <table className="wishlist-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Image</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map(item => (
                <tr key={item.productId._id}>
                  <td className="product-id">{item.productId.productId}</td>
                  <td className="product-name">{item.productId.name}</td>
                  <td className="product-image">
                    {item.productId.images && item.productId.images.length > 0 && (
                      <img
                        src={item.productId.images[0]}
                        alt={item.productId.name}
                      />
                    )}
                  </td>
                  <td className="product-price">${item.productId.price}</td>
                  <td className="product-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemove(item.productId._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WhishList;