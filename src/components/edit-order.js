import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productId: '',
    name: '',
    description: '',
    images: [],
    category: '',
    specifications: [{ name: '', value: '' }],
    quantities: [{ size: '', price: '' }],
    ingredients: [{ name: '', quantity: '' }],
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/foods/${id}`); // Make sure backend allows this GET for non-admin
        setForm({
          productId: data.productId || '',
          name: data.name || '',
          description: data.description || '',
          images: data.images || [],
          category: data.category || '',
          specifications: data.specifications.length ? data.specifications : [{ name: '', value: '' }],
          quantities: data.quantities.length ? data.quantities : [{ size: '', price: '' }],
          ingredients: data.ingredients.length ? data.ingredients : [{ name: '', quantity: '' }],
        });
      } catch (err) {
        console.error(err);
        alert('Product Not Found');
        navigate('/display-products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // Generic input handler
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Dynamic fields handlers
  const handleArrayChange = (field, idx, e) => {
    const arr = [...form[field]];
    arr[idx][e.target.name] = e.target.value;
    setForm({ ...form, [field]: arr });
  };

  const addArrayItem = field => setForm({ ...form, [field]: [...form[field], { name: '', value: '' }] });
  const removeArrayItem = (field, idx) => {
    const arr = [...form[field]];
    if (arr.length > 1) {
      arr.splice(idx, 1);
      setForm({ ...form, [field]: arr });
    }
  };

  // Handle images upload
  const handleImagesChange = async e => {
    const files = Array.from(e.target.files);
    try {
      setIsSubmitting(true);
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm({ ...form, images: [...form.images, ...urls] });
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = idx => {
    const imgs = [...form.images];
    imgs.splice(idx, 1);
    setForm({ ...form, images: imgs });
  };

  // Submit updated product
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axios.put(`/api/foods/${id}`, form); // PUT requires admin
      alert('Product updated successfully');
      navigate('/display-products');
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading product...</div>;

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit} className="add-product-form">
          {/* Basic Info */}
          <div className="form-section">
            <label>Product ID</label>
            <input name="productId" value={form.productId} onChange={handleChange} required />
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} required />
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} required />
          </div>

          {/* Images */}
          <div className="form-section">
            <label>Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImagesChange} disabled={isSubmitting} />
            <div className="image-previews">
              {form.images.map((img, idx) => (
                <div key={idx} className="image-preview">
                  <img src={img} alt="preview" />
                  <button type="button" onClick={() => removeImage(idx)}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h4>Specifications</h4>
            {form.specifications.map((spec, idx) => (
              <div key={idx} className="dynamic-input-group">
                <input name="name" placeholder="Name" value={spec.name} onChange={e => handleArrayChange('specifications', idx, e)} required />
                <input name="value" placeholder="Value" value={spec.value} onChange={e => handleArrayChange('specifications', idx, e)} required />
                {form.specifications.length > 1 && <button type="button" onClick={() => removeArrayItem('specifications', idx)}>Remove</button>}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('specifications')}>+ Add Specification</button>
          </div>

          {/* Quantities */}
          <div className="form-section">
            <h4>Quantities & Price</h4>
            {form.quantities.map((q, idx) => (
              <div key={idx} className="dynamic-input-group">
                <input name="size" placeholder="Size" value={q.size} onChange={e => handleArrayChange('quantities', idx, e)} required />
                <input name="price" placeholder="Price" type="number" step="0.01" value={q.price} onChange={e => handleArrayChange('quantities', idx, e)} required />
                {form.quantities.length > 1 && <button type="button" onClick={() => removeArrayItem('quantities', idx)}>Remove</button>}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('quantities')}>+ Add Quantity</button>
          </div>

          {/* Ingredients */}
          <div className="form-section">
            <h4>Ingredients</h4>
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="dynamic-input-group">
                <input name="name" placeholder="Name" value={ing.name} onChange={e => handleArrayChange('ingredients', idx, e)} required />
                <input name="quantity" placeholder="Quantity" value={ing.quantity} onChange={e => handleArrayChange('ingredients', idx, e)} required />
                {form.ingredients.length > 1 && <button type="button" onClick={() => removeArrayItem('ingredients', idx)}>Remove</button>}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('ingredients')}>+ Add Ingredient</button>
          </div>

          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Product'}</button>
        </form>
      </div>
    </div>
  );
}
