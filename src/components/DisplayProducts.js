import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function DisplayProducts() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [avgRatings, setAvgRatings] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});
  const [editingProduct, setEditingProduct] = useState(null); // <-- new state
  const [editForm, setEditForm] = useState({}); // <-- new state
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/foods').then(res => setProducts(res.data));
    axios.get('/api/whishlist').then(res => setWishlist(res.data.map(w => w.productId && w.productId._id).filter(Boolean)));
    axios.get('/api/reviews/average-ratings').then(res => {
      const ratingsObj = {};
      res.data.forEach(r => {
        ratingsObj[r._id] = r.avgRating;
      });
      setAvgRatings(ratingsObj);
    });
  }, []);

  const handleWishlistToggle = async (productId) => {
    if (wishlist.includes(productId)) {
      await axios.delete(`/api/whishlist/${productId}`);
      setWishlist(wishlist.filter(id => id !== productId));
      alert('Removed from wishlist');
    } else {
      await axios.post('/api/whishlist', { productId });
      setWishlist([...wishlist, productId]);
      alert('Product added to wishlist');
    }
  };

  // --- Review logic ---
  const handleReviewInputChange = (productId, field, value) => {
    setReviewInputs(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleReviewImageChange = (productId, files) => {
    setReviewInputs(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        images: files
      }
    }));
  };

  const handleReviewSubmit = async (productId) => {
    const reviewData = reviewInputs[productId];
    if (!reviewData || !reviewData.text || !reviewData.rating) {
      alert('Please enter review text and select a rating.');
      return;
    }

    // Prepare form data for images
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('review', reviewData.text);
    formData.append('rating', reviewData.rating);
    if (reviewData.images && reviewData.images.length > 0) {
      for (let i = 0; i < reviewData.images.length; i++) {
        formData.append('images', reviewData.images[i]);
      }
    }

    try {
      await axios.post('/api/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Review submitted!');
      setReviewInputs(prev => ({ ...prev, [productId]: { text: '', rating: 0, images: [] } }));
    } catch (err) {
      alert('Error submitting review');
    }
  };

  // --- Star rating component ---
  const StarRating = ({ value, onChange }) => (
    <span>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{ cursor: 'pointer', color: star <= value ? '#ffc107' : '#e4e5e9', fontSize: 20 }}
          onClick={() => onChange(star)}
        >★</span>
      ))}
    </span>
  );

  const handleRemoveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      try {
        await axios.delete(`/api/foods/${productId}`);
        setProducts(products.filter(prod => prod._id !== productId));
        alert('Product removed');
      } catch (err) {
        alert('Error removing product');
      }
    }
  };

  // --- Update logic ---
  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      id: product._id,
      productId: product.productId,
      name: product.name,
      description: product.description,
      images: product.images ? [...product.images] : [],
      category: product.category,
      specifications: product.specifications ? [...product.specifications] : [],
      quantities: product.quantities ? [...product.quantities] : [],
      discount: product.discount ?? 0
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormArrayChange = (field, idx, subfield, value) => {
    setEditForm(prev => {
      const arr = [...prev[field]];
      arr[idx][subfield] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleEditFormArrayAdd = (field, template) => {
    setEditForm(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

  const handleEditFormArrayRemove = (field, idx) => {
    setEditForm(prev => {
      const arr = [...prev[field]];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleEditFormImageChange = (idx, value) => {
    setEditForm(prev => {
      const arr = [...prev.images];
      arr[idx] = value;
      return { ...prev, images: arr };
    });
  };

  const handleEditFormImageAdd = () => {
    setEditForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleEditFormImageRemove = (idx) => {
    setEditForm(prev => {
      const arr = [...prev.images];
      arr.splice(idx, 1);
      return { ...prev, images: arr };
    });
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/foods', editForm);
      setProducts(products.map(prod => prod._id === editForm.id ? { ...prod, ...editForm } : prod));
      setEditingProduct(null);
      setEditForm({});
      alert('Product updated!');
    } catch (err) {
      alert('Error updating product');
    }
  };

  return (
    <div>
      <h2>All Products</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ProductId</th>
            <th>Name</th>
            <th>Image</th>
            <th>Quantities & Prices</th>
            <th>Category</th>
            <th>Average Rating</th>
            <th>Wishlist</th>
            <th>Actions</th>
            <th>Review</th>
            <th>Remove</th>
            <th>Update</th> {/* <-- Add this */}
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod._id || prod.productId}>
              <td>{prod.productId}</td>
              <td>
                {editingProduct === prod._id ? (
                  <input
                    value={editForm.name}
                    onChange={e => handleEditFormChange('name', e.target.value)}
                  />
                ) : (
                  prod.name
                )}
              </td>
              <td>
                {editingProduct === prod._id ? (
                  <div>
                    {editForm.images && editForm.images.map((img, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          value={img}
                          onChange={e => handleEditFormImageChange(idx, e.target.value)}
                          style={{ width: 120 }}
                        />
                        <button type="button" onClick={() => handleEditFormImageRemove(idx)}>-</button>
                      </div>
                    ))}
                    <button type="button" onClick={handleEditFormImageAdd}>Add Image</button>
                  </div>
                ) : (
                  prod.images && prod.images.length > 0 && (
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                  )
                )}
              </td>
              <td>
                {editingProduct === prod._id ? (
                  <div>
                    {editForm.quantities && editForm.quantities.map((q, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          value={q.size}
                          onChange={e => handleEditFormArrayChange('quantities', idx, 'size', e.target.value)}
                          placeholder="Size"
                          style={{ width: 50 }}
                        />
                        <input
                          type="number"
                          value={q.price}
                          onChange={e => handleEditFormArrayChange('quantities', idx, 'price', e.target.value)}
                          placeholder="Price"
                          style={{ width: 70, marginLeft: 4 }}
                        />
                        <button type="button" onClick={() => handleEditFormArrayRemove('quantities', idx)}>-</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleEditFormArrayAdd('quantities', { size: '', price: '' })}>Add</button>
                  </div>
                ) : (
                  prod.quantities && prod.quantities.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {prod.quantities.map(q => (
                        <li key={q.size}>
                          {q.size}: ₹{q.price}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No price'
                  )
                )}
              </td>
              <td>
                {editingProduct === prod._id ? (
                  <input
                    value={editForm.category}
                    onChange={e => handleEditFormChange('category', e.target.value)}
                  />
                ) : (
                  prod.category
                )}
              </td>
              <td>
                {avgRatings[prod._id]
                  ? avgRatings[prod._id].toFixed(1)
                  : 'No ratings'}
              </td>
              <td>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 24,
                    color: wishlist.includes(prod._id) ? 'red' : 'gray'
                  }}
                  onClick={() => handleWishlistToggle(prod._id)}
                  title={wishlist.includes(prod._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlist.includes(prod._id) ? '♥' : '♡'}
                </button>
              </td>
              {/* ...other columns/actions... */}
              <td>
                {/* --- Review writing area --- */}
                <div style={{ minWidth: 200 }}>
                  <textarea
                    rows={2}
                    placeholder="Write your review..."
                    value={reviewInputs[prod._id]?.text || ''}
                    onChange={e => handleReviewInputChange(prod._id, 'text', e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div>
                    <StarRating
                      value={reviewInputs[prod._id]?.rating || 0}
                      onChange={val => handleReviewInputChange(prod._id, 'rating', val)}
                    />
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleReviewImageChange(prod._id, e.target.files)}
                  />
                  <button onClick={() => handleReviewSubmit(prod._id)}>
                    Submit Review
                  </button>
                </div>
              </td>
              <td>
                <button
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                  onClick={() => handleRemoveProduct(prod._id)}
                >
                  Remove
                </button>
              </td>
              <td>
                {editingProduct === prod._id ? (
                  <form onSubmit={handleEditSubmit}>
                    <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
                      Save
                    </button>
                    <button type="button" onClick={handleEditCancel} style={{ marginLeft: 8 }}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => handleEditClick(prod)}
                  >
                    Update
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayProducts;