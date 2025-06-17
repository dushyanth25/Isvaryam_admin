import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

function WhishList() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const res = await axios.get('/api/whishlist');
    setWishlist(res.data);
  };

  const handleRemove = async (productId) => {
    await axios.delete(`/api/whishlist/${productId}`);
    setWishlist(wishlist.filter(item => item.productId._id !== productId));
    alert('Removed from wishlist');
  };

  return (
    <div>
      <h2>My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No products in wishlist.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>ProductId</th>
              <th>Name</th>
              <th>Image</th>
              <th>Price</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.map(item => (
              <tr key={item.productId._id}>
                <td>{item.productId.productId}</td>
                <td>{item.productId.name}</td>
                <td>
                  {item.productId.images && item.productId.images.length > 0 && (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                  )}
                </td>
                <td>{item.productId.price}</td>
                <td>
                  <button onClick={() => handleRemove(item.productId._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WhishList;