import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import './AddProducts.css'; // We'll create this CSS file

function AddProducts() {
  const [form, setForm] = useState({
    productId: '',
    name: '',
    description: '',
    images: [],
    category: '',
    specifications: [{ name: '', value: '' }],
    quantities: [{ size: '', price: '' }],
    ingredients: [{ name: '', quantity: '' }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    if (specs.length > 1) {
      specs.splice(idx, 1);
      setForm({ ...form, specifications: specs });
    }
  };

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
    if (quantities.length > 1) {
      quantities.splice(idx, 1);
      setForm({ ...form, quantities });
    }
  };

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
    if (ingredients.length > 1) {
      ingredients.splice(idx, 1);
      setForm({ ...form, ingredients });
    }
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + form.images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    try {
      setIsLoading(true);
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm({ ...form, images: [...form.images, ...urls] });
    } catch {
      alert('Image upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (idx) => {
    const images = [...form.images];
    images.splice(idx, 1);
    setForm({ ...form, images });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post('/api/foods', form);
      alert('Product added successfully!');
      navigate('/display-products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
      console.error(err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <div className="add-product-header">
          <h2>Add New Product</h2>
          <p>Fill in the details below to create a new product</p>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="input-group">
              <label htmlFor="productId">Product ID *</label>
              <input 
                name="productId" 
                id="productId"
                placeholder="Enter product ID" 
                value={form.productId} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="name">Product Name *</label>
              <input 
                name="name" 
                id="name"
                placeholder="Enter product name" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="category">Category *</label>
              <input 
                name="category" 
                id="category"
                placeholder="Enter product category" 
                value={form.category} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="description">Description *</label>
              <textarea
                name="description"
                id="description"
                placeholder="Enter product description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-section">
            <h3>Product Images</h3>
            <div className="input-group">
              <label htmlFor="images">Upload Images (Max 5)</label>
              <input
                name="images"
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                disabled={isLoading || form.images.length >= 5}
              />
              {isLoading && <div className="loading-text">Uploading images...</div>}
            </div>

            {form.images.length > 0 && (
              <div className="image-previews">
                <p>Selected Images:</p>
                <div className="preview-container">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="image-preview">
                      <img src={img} alt="preview" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h3>Specifications</h3>
            {form.specifications.map((spec, idx) => (
              <div key={idx} className="dynamic-input-group">
                <input
                  name="name"
                  placeholder="Specification name"
                  value={spec.name}
                  onChange={(e) => handleSpecChange(idx, e)}
                  required
                />
                <input
                  name="value"
                  placeholder="Specification value"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(idx, e)}
                  required
                />
                {form.specifications.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeSpec(idx)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSpec} className="add-more-btn">
              + Add Specification
            </button>
          </div>

          {/* Quantities & Pricing */}
          <div className="form-section">
            <h3>Quantities & Pricing</h3>
            {form.quantities.map((q, idx) => (
              <div key={idx} className="dynamic-input-group">
                <input
                  name="size"
                  placeholder="Size (e.g., 500ml, 1kg)"
                  value={q.size}
                  onChange={(e) => handleQuantityChange(idx, e)}
                  required
                />
                <input
                  name="price"
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={q.price}
                  onChange={(e) => handleQuantityChange(idx, e)}
                  required
                />
                {form.quantities.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeQuantity(idx)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addQuantity} className="add-more-btn">
              + Add Quantity Option
            </button>
          </div>

          {/* Ingredients */}
          <div className="form-section">
            <h3>Ingredients</h3>
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="dynamic-input-group">
                <input
                  name="name"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={e => handleIngredientChange(idx, e)}
                  required
                />
                <input
                  name="quantity"
                  placeholder="Quantity"
                  value={ing.quantity}
                  onChange={e => handleIngredientChange(idx, e)}
                  required
                />
                {form.ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredient(idx)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="add-more-btn">
              + Add Ingredient
            </button>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProducts;