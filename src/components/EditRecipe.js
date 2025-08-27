import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import './EditRecipe.css'; // We'll create this CSS file

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
  const [uploading, setUploading] = useState(false);
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
    setUploading(true);
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
    setUploading(false);
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
      let tags = form.tags;
      if (tagInput && !tags.includes(tagInput)) {
        tags = [...tags, tagInput];
      }
      const payload = {
        ...form,
        tags,
        cookingTime: form.cookingTime ? Number(form.cookingTime) : undefined,
        prepTime: form.prepTime ? Number(form.prepTime) : undefined,
      };
      await axios.put(`/api/recipes/${id}`, payload);
      alert('Recipe updated successfully!');
      navigate('/admin/recipes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recipe');
    }
  };

  if (loading) return <div className="loading">Loading recipe...</div>;

  return (
    <div className="edit-recipe-container">
      <div className="edit-recipe-header">
        <h2>Edit Recipe</h2>
        <button className="back-button" onClick={() => navigate('/admin/recipes')}>
          ← Back to Recipes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
              placeholder="Enter recipe title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Describe your recipe"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Ingredients</h3>
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="ingredient-row">
              <input
                type="text"
                placeholder="Ingredient name"
                value={ing.name}
                onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                required
                className="ingredient-input"
              />
              <input
                type="text"
                placeholder="Quantity"
                value={ing.quantity}
                onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                required
                className="quantity-input"
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="remove-button"
                  title="Remove ingredient"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="add-button">
            + Add Ingredient
          </button>
        </div>

        <div className="form-section">
          <h3>Instructions</h3>
          {form.instructions.map((inst, idx) => (
            <div key={idx} className="instruction-row">
              <div className="step-number">Step {idx + 1}</div>
              <textarea
                value={inst}
                onChange={e => handleInstructionChange(idx, e.target.value)}
                required
                placeholder={`Describe step ${idx + 1}`}
                rows="2"
              />
              {form.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(idx)}
                  className="remove-button"
                  title="Remove step"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="add-button">
            + Add Step
          </button>
        </div>

        <div className="form-section">
          <h3>Media</h3>
          <div className="form-group">
            <label>Upload Images</label>
            <div className="file-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                id="image-upload"
                className="file-input"
              />
              <label htmlFor="image-upload" className="file-upload-label">
                {uploading ? 'Uploading...' : 'Choose Images'}
              </label>
            </div>
            {uploading && <div className="upload-progress">Uploading images...</div>}
          </div>

          <div className="image-preview-grid">
            {form.images.map((img, idx) => (
              img && (
                <div key={idx} className="image-preview">
                  <img src={img} alt={`Preview ${idx}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="remove-image-button"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              )
            ))}
          </div>

          <div className="form-group">
            <label>Video URL</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={e => handleChange('videoUrl', e.target.value)}
              placeholder="https://example.com/video"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Details</h3>
          <div className="details-grid">
            <div className="form-group">
              <label>Preparation Time (minutes)</label>
              <input
                type="number"
                value={form.prepTime}
                onChange={e => handleChange('prepTime', e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Cooking Time (minutes)</label>
              <input
                type="number"
                value={form.cookingTime}
                onChange={e => handleChange('cookingTime', e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Difficulty Level</label>
              <select
                value={form.difficulty}
                onChange={e => handleChange('difficulty', e.target.value)}
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Tags</h3>
          <div className="tags-input-group">
            <input
              type="text"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), handleTagAdd()) : null}
              className="tag-input"
            />
            <button type="button" onClick={handleTagAdd} className="add-tag-button">
              Add Tag
            </button>
          </div>
          
          <div className="tags-container">
            {form.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="remove-tag-button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/recipes')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Update Recipe
          </button>
        </div>
      </form>
    </div>
  );
}