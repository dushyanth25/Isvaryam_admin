import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

const difficultyLevels = ['Easy', 'Medium', 'Hard'];

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

export default function EditRecipe() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: '' }],
    instructions: [''],
    images: [''],
    tags: [],
    cookingTime: '',
    prepTime: '',
    difficulty: 'Easy',
    videoUrl: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const { data } = await axios.get(`/api/recipes/${id}`);
        setForm({
          title: data.title || '',
          description: data.description || '',
          ingredients: data.ingredients && data.ingredients.length > 0 ? data.ingredients : [{ name: '', quantity: '' }],
          instructions: data.instructions && data.instructions.length > 0 ? data.instructions : [''],
          images: data.images && data.images.length > 0 ? data.images : [''],
          tags: data.tags || [],
          cookingTime: data.cookingTime || '',
          prepTime: data.prepTime || '',
          difficulty: data.difficulty || 'Easy',
          videoUrl: data.videoUrl || '',
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load recipe');
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (idx, field, value) => {
    const ingredients = [...form.ingredients];
    ingredients[idx][field] = value;
    setForm(prev => ({ ...prev, ingredients }));
  };

  const addIngredient = () => {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '' }] }));
  };

  const removeIngredient = idx => {
    const ingredients = [...form.ingredients];
    ingredients.splice(idx, 1);
    setForm(prev => ({ ...prev, ingredients }));
  };

  const handleInstructionChange = (idx, value) => {
    const instructions = [...form.instructions];
    instructions[idx] = value;
    setForm(prev => ({ ...prev, instructions }));
  };

  const addInstruction = () => {
    setForm(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
  };

  const removeInstruction = idx => {
    const instructions = [...form.instructions];
    instructions.splice(idx, 1);
    setForm(prev => ({ ...prev, instructions }));
  };

  const handleImageChange = (idx, value) => {
    const images = [...form.images];
    images[idx] = value;
    setForm(prev => ({ ...prev, images }));
  };

  const addImage = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch {
      setError('Image upload failed');
    }
  };

  const removeImage = idx => {
    const images = [...form.images];
    images.splice(idx, 1);
    setForm(prev => ({ ...prev, images }));
  };

  const handleTagAdd = () => {
    if (tagInput && !form.tags.includes(tagInput)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = tag => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Add the tagInput to tags if it's not empty and not already present
      let tags = form.tags;
      if (tagInput && !tags.includes(tagInput)) {
        tags = [...tags, tagInput];
      }
      const payload = {
        ...form,
        tags, // use the updated tags array
        cookingTime: form.cookingTime ? Number(form.cookingTime) : undefined,
        prepTime: form.prepTime ? Number(form.prepTime) : undefined,
      };
      await axios.put(`/api/recipes/${id}`, payload);
      alert('Recipe updated!');
      navigate('/'); // or to recipes list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recipe');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: <input value={form.title} onChange={e => handleChange('title', e.target.value)} required /></label>
        </div>
        <div>
          <label>Description: <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} /></label>
        </div>
        <div>
          <label>Ingredients:</label>
          {form.ingredients.map((ing, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <input
                placeholder="Name"
                value={ing.name}
                onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                required
              />
              <input
                placeholder="Quantity"
                value={ing.quantity}
                onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                required
              />
              {form.ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(idx)}>-</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient}>Add Ingredient</button>
        </div>
        <div>
          <label>Instructions:</label>
          {form.instructions.map((inst, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <textarea
                placeholder={`Step ${idx + 1}`}
                value={inst}
                onChange={e => handleInstructionChange(idx, e.target.value)}
                required
              />
              {form.instructions.length > 1 && (
                <button type="button" onClick={() => removeInstruction(idx)}>-</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruction}>Add Step</button>
        </div>
        <div>
          <label>Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {form.images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img} alt={`Recipe ${idx}`} style={{ width: 80, height: 80, objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  style={{
                    position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer'
                  }}
                  title="Remove"
                >×</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label>Tags:</label>
          <input
            placeholder="Add tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), handleTagAdd()) : null}
          />
          <button type="button" onClick={handleTagAdd}>Add Tag</button>
          <div>
            {form.tags.map(tag => (
              <span key={tag} style={{ marginRight: 8 }}>
                {tag} <button type="button" onClick={() => removeTag(tag)}>x</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label>Cooking Time (min): <input type="number" value={form.cookingTime} onChange={e => handleChange('cookingTime', e.target.value)} /></label>
        </div>
        <div>
          <label>Prep Time (min): <input type="number" value={form.prepTime} onChange={e => handleChange('prepTime', e.target.value)} /></label>
        </div>
        <div>
          <label>Difficulty:
            <select value={form.difficulty} onChange={e => handleChange('difficulty', e.target.value)}>
              {difficultyLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label>Video URL: <input value={form.videoUrl} onChange={e => handleChange('videoUrl', e.target.value)} /></label>
        </div>
        {error && <div style={{ color: 'red', margin: '8px 0' }}>{error}</div>}
        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
}