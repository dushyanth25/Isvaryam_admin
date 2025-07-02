import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const difficultyLevels = ['Easy', 'Medium', 'Hard'];

export default function AddRecipe() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: '' }],
    instructions: [''],
    images: [],
    tags: [],
    cookingTime: '',
    prepTime: '',
    difficulty: 'Easy',
    videoUrl: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64Images = await Promise.all(
      files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
    setForm(prev => ({ ...prev, images: base64Images }));
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
    // Only send required and filled fields
    const payload = {
      title: form.title,
      ingredients: form.ingredients.filter(i => i.name && i.quantity),
      instructions: form.instructions.filter(i => i && i.trim()),
    };
    if (form.description) payload.description = form.description;
    if (form.images.some(img => img && img.trim())) payload.images = form.images.filter(img => img && img.trim());
    if (form.tags.length > 0) payload.tags = form.tags;
    if (form.cookingTime) payload.cookingTime = Number(form.cookingTime);
    if (form.prepTime) payload.prepTime = Number(form.prepTime);
    if (form.difficulty) payload.difficulty = form.difficulty;
    if (form.videoUrl) payload.videoUrl = form.videoUrl;

    try {
      await axios.post('/api/recipes', payload);
      alert('Recipe added!');
      navigate('/'); // or to recipes list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add recipe');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>Add Recipe</h2>
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
        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
}