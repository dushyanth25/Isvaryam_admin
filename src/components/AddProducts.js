import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../utils/cloudinaryUpload'; // Add this import

function AddProducts() {
  const [form, setForm] = useState({
    productId: '',
    name: '',
    description: '',
    images: [],
    category: '',
    specifications: [{ name: '', value: '' }],
    quantities: [{ size: '', price: '' }]
  });
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

  // Quantities handlers
  const handleQuantityChange = (idx, e) => {
    const quantities = [...form.quantities];
    quantities[idx][e.target.name] = e.target.value;
    setForm({ ...form, quantities });
  };

  const addQuantity = () => {
    setForm({ ...form, quantities: [...form.quantities, { size: '', price: '' }] });
  };

  // Handle multiple image uploads and convert to base64
  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm({ ...form, images: urls });
    } catch {
      alert('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/foods', form);
      navigate('/display-products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
      console.error(err.response || err);
    }
  };

  return (
    <div>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input name="productId" placeholder="Product ID" value={form.productId} onChange={handleChange} required />
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        {/* Large textarea for description */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          style={{ width: '100%' }}
          required
        />
        {/* Multiple image upload */}
        <input
          name="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImagesChange}
        />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <h4>Specifications</h4>
        {form.specifications.map((spec, idx) => (
          <div key={idx}>
            <input
              name="name"
              placeholder="Spec Name"
              value={spec.name}
              onChange={(e) => handleSpecChange(idx, e)}
              required
            />
            <input
              name="value"
              placeholder="Spec Value"
              value={spec.value}
              onChange={(e) => handleSpecChange(idx, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addSpec}>Add Specification</button>
        <h4>Quantities</h4>
        {form.quantities.map((q, idx) => (
          <div key={idx}>
            <input
              name="size"
              placeholder="Size (e.g. 500ml, 1kg)"
              value={q.size}
              onChange={(e) => handleQuantityChange(idx, e)}
              required
            />
            <input
              name="price"
              placeholder="Price for this size"
              type="number"
              value={q.price}
              onChange={(e) => handleQuantityChange(idx, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addQuantity}>Add Quantity</button>
        <br />
        <button type="submit">Add Product</button>
      </form>
      {/* Preview selected images */}
      <div style={{ marginTop: 10 }}>
        {form.images.map((img, idx) => (
          <img key={idx} src={img} alt="preview" style={{ width: 80, marginRight: 8 }} />
        ))}
      </div>
    </div>
  );
}

export default AddProducts;