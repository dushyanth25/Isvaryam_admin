import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'isvaryam'); // <-- set your preset
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
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/foods/${productId}`).then(res => setForm(res.data));
  }, [productId]);

  if (!form) return <div>Loading...</div>;

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
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm({ ...form, images: [...form.images, ...urls] });
    } catch {
      alert('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put('/api/foods', { ...form, id: form._id });
    navigate('/display-products');
  };

  return (
    <div>
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <input name="productId" placeholder="Product ID" value={form.productId} onChange={handleChange} required />
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="discount" type="number" placeholder="Discount (%)" value={form.discount ?? 0} onChange={handleChange} />

        <h4>Images</h4>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {form.images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
              <img src={img} alt="product" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  cursor: 'pointer'
                }}
                title="Remove"
              >×</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            id="add-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImages}
          />
        </div>

        <h4>Quantities & Prices</h4>
        {form.quantities.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <input
              name="size"
              placeholder="Size (e.g., 500ml, 1kg)"
              value={q.size}
              onChange={e => handleQuantityChange(idx, e)}
              required
              style={{ marginRight: 8 }}
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={q.price}
              onChange={e => handleQuantityChange(idx, e)}
              required
              style={{ marginRight: 8 }}
            />
            <button type="button" onClick={() => removeQuantity(idx)} style={{ color: 'red' }}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addQuantity}>Add Quantity</button>

        <h4>Specifications</h4>
        {form.specifications.map((spec, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <input
              name="name"
              placeholder="Spec Name"
              value={spec.name}
              onChange={e => handleSpecChange(idx, e)}
              required
            />
            <input
              name="value"
              placeholder="Spec Value"
              value={spec.value}
              onChange={e => handleSpecChange(idx, e)}
              required
            />
            {form.specifications.length > 1 && (
              <button type="button" onClick={() => removeSpec(idx)}>-</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSpec}>Add Specification</button>

        <h4>Ingredients</h4>
        {form.ingredients.map((ing, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <input
              name="name"
              placeholder="Ingredient Name"
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
              <button type="button" onClick={() => removeIngredient(idx)}>-</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addIngredient}>Add Ingredient</button>

        <br />
        <button type="submit">Update Product</button>
      </form>
    </div>
  );
}

export default EditProducts;