import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './DisplayProducts.css'; // We'll create this CSS file

function DisplayProducts() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [avgRatings, setAvgRatings] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedProduct, setExpandedProduct] = useState(null);
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

  const StarRating = ({ value, onChange, readonly = false }) => (
    <span className="star-rating">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''} ${readonly ? 'readonly' : 'clickable'}`}
          onClick={() => !readonly && onChange(star)}
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

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  return (
    <div className="admin-products-container">
      <div className="admin-header">
        <h2>Product Management</h2>
        <button className="btn-primary" onClick={() => navigate('/add-product')}>
          Add New Product
        </button>
      </div>

      <div className="products-grid">
        {products.map(prod => (
          <div key={prod._id || prod.productId} className="product-card">
            <div className="product-card-header">
              <h3>{prod.name}</h3>
              <span className="product-id">ID: {prod.productId}</span>
            </div>

            <div className="product-images">
              {prod.images && prod.images.length > 0 ? (
                <div className="image-gallery">
                  {prod.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={prod.name}
                      className="product-thumbnail"
                    />
                  ))}
                </div>
              ) : (
                <div className="no-image-placeholder">No images</div>
              )}
            </div>

            <div className="product-details">
              <p className="product-description">{prod.description}</p>
              
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{prod.category}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Discount:</span>
                <span className="detail-value">{prod.discount ?? 0}%</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Rating:</span>
                <span className="detail-value">
                  {avgRatings[prod._id] ? (
                    <div className="rating-display">
                      <StarRating value={avgRatings[prod._id]} readonly={true} />
                      <span>({avgRatings[prod._id].toFixed(1)})</span>
                    </div>
                  ) : (
                    'No ratings'
                  )}
                </span>
              </div>
            </div>

            <div className="expandable-section">
              <button 
                className="expand-toggle"
                onClick={() => toggleProductExpansion(prod._id)}
              >
                {expandedProduct === prod._id ? 'Hide Details' : 'Show Details'}
              </button>
              
              {expandedProduct === prod._id && (
                <div className="expanded-details">
                  <div className="detail-section">
                    <h4>Pricing</h4>
                    {prod.quantities && prod.quantities.length > 0 ? (
                      <ul className="detail-list">
                        {prod.quantities.map((q, idx) => (
                          <li key={idx} className="detail-item">
                            <span className="size">{q.size}:</span>
                            <span className="price">₹{q.price}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No pricing information</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Specifications</h4>
                    {prod.specifications && prod.specifications.length > 0 ? (
                      <ul className="detail-list">
                        {prod.specifications.map((spec, idx) => (
                          <li key={idx} className="detail-item">
                            <span className="spec-name">{spec.name}:</span>
                            <span className="spec-value">{spec.value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No specifications</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Ingredients</h4>
                    {prod.ingredients && prod.ingredients.length > 0 ? (
                      <ul className="detail-list">
                        {prod.ingredients.map((ing, idx) => (
                          <li key={idx} className="detail-item">
                            <span className="ingredient-name">{ing.name}</span>
                            <span className="ingredient-quantity">({ing.quantity})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No ingredients listed</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Write a Review</h4>
                    <div className="review-form">
                      <textarea
                        rows={3}
                        placeholder="Write your review..."
                        value={reviewInputs[prod._id]?.text || ''}
                        onChange={e => handleReviewInputChange(prod._id, 'text', e.target.value)}
                        className="review-textarea"
                      />
                      <div className="rating-input">
                        <span>Rating: </span>
                        <StarRating
                          value={reviewInputs[prod._id]?.rating || 0}
                          onChange={val => handleReviewInputChange(prod._id, 'rating', val)}
                        />
                      </div>
                      <div className="image-upload">
                        <label className="file-upload-label">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={e => handleReviewImageChange(prod._id, e.target.files)}
                          />
                          Upload Images
                        </label>
                      </div>
                      <button 
                        onClick={() => handleReviewSubmit(prod._id)}
                        className="btn-secondary"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="product-actions">
              <button
                className={`wishlist-btn ${wishlist.includes(prod._id) ? 'in-wishlist' : ''}`}
                onClick={() => handleWishlistToggle(prod._id)}
                title={wishlist.includes(prod._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlist.includes(prod._id) ? '♥' : '♡'}
              </button>
              
              <button
                className="btn-danger"
                onClick={() => handleRemoveProduct(prod._id)}
              >
                Remove
              </button>
              
              <button
                className="btn-primary"
                onClick={() => navigate(`/edit-product/${prod.productId}`)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayProducts;