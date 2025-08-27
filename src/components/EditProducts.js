import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import './EditProducts.css'; // We'll create this CSS file

async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'isvaryam');
  const res = await fetch('https://api.cloudinary.com/v1_1/ddv0mpecp/image/upload', {
    method: 'POST',
    body: data,
  });
  const json = await res.json();
  return json.secure_url;
}

function EditProducts() {
  const { productId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/foods/${productId}`);
        setForm(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product data...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're trying to edit doesn't exist.</p>
        <button onClick={() => navigate('/display-products')} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Specifications handlers ---
  const handleSpecChange = (idx, e) => {
    const specs = [...form.specifications];
    specs[idx][e.target.name] = e.target.value;
    setForm({ ...form, specifications: specs });
  };
  const addSpec = () => {
    setForm({ ...form, specifications: [...form.specifications, { name: '', value: '' }] });
  };
  const removeSpec = (idx) => {
    const specs = [...form.specifications];
    specs.splice(idx, 1);
    setForm({ ...form, specifications: specs });
  };

  // --- Quantities handlers ---
  const handleQuantityChange = (idx, e) => {
    const quantities = [...form.quantities];
    quantities[idx][e.target.name] = e.target.value;
    setForm({ ...form, quantities });
  };
  const addQuantity = () => {
    setForm({ ...form, quantities: [...form.quantities, { size: '', price: '' }] });
  };
  const removeQuantity = (idx) => {
    const quantities = [...form.quantities];
    quantities.splice(idx, 1);
    setForm({ ...form, quantities });
  };

  // --- Ingredients handlers ---
  const handleIngredientChange = (idx, e) => {
    const ingredients = [...form.ingredients];
    ingredients[idx][e.target.name] = e.target.value;
    setForm({ ...form, ingredients });
  };
  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, { name: '', quantity: '' }] });
  };
  const removeIngredient = (idx) => {
    const ingredients = [...form.ingredients];
    ingredients.splice(idx, 1);
    setForm({ ...form, ingredients });
  };

  // --- Images handlers ---
  const handleRemoveImage = (idx) => {
    const newImages = [...form.images];
    newImages.splice(idx, 1);
    setForm({ ...form, images: newImages });
  };
  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm({ ...form, images: [...form.images, ...urls] });
    } catch {
      alert('Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put('/api/foods', { ...form, id: form._id });
      alert('Product updated successfully!');
      navigate('/display-products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-product-dashboard">
      <header className="dashboard-header">
        <h1>Edit Product</h1>
        <p>Update product details and inventory information</p>
      </header>

      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productId">Product ID *</label>
                <input
                  id="productId"
                  name="productId"
                  placeholder="PROD-001"
                  value={form.productId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <input
                  id="category"
                  name="category"
                  placeholder="Beverages, Snacks, etc."
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Product description"
                value={form.description}
                onChange={handleChange}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                name="discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.discount ?? 0}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Product Images</h3>
              <div className="file-input-wrapper">
                <input
                  id="add-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  disabled={uploading}
                />
                <label htmlFor="add-images" className="file-input-label">
                  {uploading ? 'Uploading...' : 'Add Images'}
                </label>
              </div>
            </div>
            
            <div className="images-grid">
              {form.images.map((img, idx) => (
                <div key={idx} className="image-preview">
                  <img src={img} alt="product" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length === 0 && (
                <div className="empty-state">
                  <p>No images added yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Pricing & Sizes</h3>
              <button type="button" onClick={addQuantity} className="add-item-btn">
                + Add Size
              </button>
            </div>
            
            {form.quantities.map((q, idx) => (
              <div key={idx} className="dynamic-field-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Size</label>
                    <input
                      name="size"
                      placeholder="500ml, 1kg, etc."
                      value={q.size}
                      onChange={e => handleQuantityChange(idx, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={q.price}
                      onChange={e => handleQuantityChange(idx, e)}
                      required
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeQuantity(idx)} 
                  className="remove-item-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Specifications</h3>
              <button type="button" onClick={addSpec} className="add-item-btn">
                + Add Specification
              </button>
            </div>
            
            {form.specifications.map((spec, idx) => (
              <div key={idx} className="dynamic-field-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      name="name"
                      placeholder="Weight, Color, etc."
                      value={spec.name}
                      onChange={e => handleSpecChange(idx, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Value</label>
                    <input
                      name="value"
                      placeholder="500g, Red, etc."
                      value={spec.value}
                      onChange={e => handleSpecChange(idx, e)}
                      required
                    />
                  </div>
                </div>
                {form.specifications.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeSpec(idx)} 
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Ingredients</h3>
              <button type="button" onClick={addIngredient} className="add-item-btn">
                + Add Ingredient
              </button>
            </div>
            
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="dynamic-field-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      name="name"
                      placeholder="Sugar, Flour, etc."
                      value={ing.name}
                      onChange={e => handleIngredientChange(idx, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      name="quantity"
                      placeholder="100g, 1 cup, etc."
                      value={ing.quantity}
                      onChange={e => handleIngredientChange(idx, e)}
                      required
                    />
                  </div>
                </div>
                {form.ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredient(idx)} 
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/display-products')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProducts;