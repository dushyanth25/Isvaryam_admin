import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './AddRecipe.css';

const difficultyLevels = ['Easy', 'Medium', 'Hard'];

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
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
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
    if (form.ingredients.length <= 1) return;
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
    if (form.instructions.length <= 1) return;
    const instructions = [...form.instructions];
    instructions.splice(idx, 1);
    setForm(prev => ({ ...prev, instructions }));
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      setError('');
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = idx => {
    const images = [...form.images];
    images.splice(idx, 1);
    setForm(prev => ({ ...prev, images }));
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const removeTag = tag => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!form.title.trim()) {
      setError('Recipe title is required');
      return;
    }
    
    if (form.ingredients.some(i => !i.name.trim() || !i.quantity.trim())) {
      setError('All ingredients must have both name and quantity');
      return;
    }
    
    if (form.instructions.some(i => !i.trim())) {
      setError('All instructions must be filled out');
      return;
    }

    // Prepare payload
    const payload = {
      title: form.title.trim(),
      ingredients: form.ingredients.filter(i => i.name && i.quantity),
      instructions: form.instructions.filter(i => i && i.trim()),
    };
    
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.images.length > 0) payload.images = form.images;
    if (form.tags.length > 0) payload.tags = form.tags;
    if (form.cookingTime) payload.cookingTime = Number(form.cookingTime);
    if (form.prepTime) payload.prepTime = Number(form.prepTime);
    if (form.difficulty) payload.difficulty = form.difficulty;
    if (form.videoUrl.trim()) payload.videoUrl = form.videoUrl.trim();

    try {
      await axios.post('/api/recipes', payload);
      setSuccess('Recipe added successfully!');
      setTimeout(() => navigate('/recipes'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add recipe');
    }
  };

  return (
    <div className="recipe-form-container">
      <div className="recipe-form-card">
        <h2>Add New Recipe</h2>
        <p className="form-subtitle">Fill in the details to create a new recipe</p>
        
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="title">Recipe Title *</label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="Enter recipe title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Describe your recipe"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Ingredients *</h3>
            <p className="section-help">Add all ingredients with their quantities</p>
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Quantity (e.g., 1 cup, 200g)"
                  value={ing.quantity}
                  onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeIngredient(idx)}
                  disabled={form.ingredients.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addIngredient}>
              + Add Another Ingredient
            </button>
          </div>
          
          <div className="form-section">
            <h3>Instructions *</h3>
            <p className="section-help">List the steps to prepare your recipe</p>
            {form.instructions.map((inst, idx) => (
              <div key={idx} className="instruction-row">
                <div className="step-number">Step {idx + 1}</div>
                <textarea
                  placeholder={`Describe step ${idx + 1}`}
                  value={inst}
                  onChange={e => handleInstructionChange(idx, e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeInstruction(idx)}
                  disabled={form.instructions.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addInstruction}>
              + Add Another Step
            </button>
          </div>
          
          <div className="form-section">
            <h3>Media</h3>
            <div className="form-group">
              <label htmlFor="images">Recipe Images</label>
              <div className="file-upload">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  disabled={uploading}
                />
                <label htmlFor="images" className="file-upload-label">
                  {uploading ? 'Uploading...' : 'Choose Images'}
                </label>
              </div>
              
              {form.images.length > 0 && (
                <div className="image-preview-container">
                  <p className="image-count">{form.images.length} image(s) selected</p>
                  <div className="image-previews">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="image-preview">
                        <img src={img} alt={`Preview ${idx + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="videoUrl">Video URL (optional)</label>
              <input
                id="videoUrl"
                type="url"
                value={form.videoUrl}
                onChange={e => handleChange('videoUrl', e.target.value)}
                placeholder="https://youtube.com/example"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Additional Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prepTime">Preparation Time (minutes)</label>
                <input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={form.prepTime}
                  onChange={e => handleChange('prepTime', e.target.value)}
                  placeholder="e.g., 15"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cookingTime">Cooking Time (minutes)</label>
                <input
                  id="cookingTime"
                  type="number"
                  min="0"
                  value={form.cookingTime}
                  onChange={e => handleChange('cookingTime', e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                value={form.difficulty}
                onChange={e => handleChange('difficulty', e.target.value)}
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="tagInput">Tags</label>
              <div className="tag-input-container">
                <input
                  id="tagInput"
                  type="text"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <button type="button" className="add-tag-btn" onClick={handleTagAdd}>
                  Add
                </button>
              </div>
              
              {form.tags.length > 0 && (
                <div className="tags-container">
                  {form.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/recipes')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}