import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function DisplayRecipe() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data } = await axios.get('/api/recipes');
      setRecipes(data);
    } catch (err) {
      setError('Failed to fetch recipes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes(recipes.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete recipe');
    }
  };

  const handleUpdate = (id) => {
    navigate(`/edit-recipe/${id}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2>All Recipes</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <table border="1" cellPadding={8} cellSpacing={0} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Images</th>
            <th>Tags</th>
            <th>Difficulty</th>
            <th>Cooking Time</th>
            <th>Prep Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map(recipe => (
            <tr key={recipe._id}>
              <td>{recipe.title}</td>
              <td>{recipe.author?.name || 'N/A'}</td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  {recipe.images && recipe.images.length > 0
                    ? recipe.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="recipe"
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                      ))
                    : <span>No images</span>
                  }
                </div>
              </td>
              <td>
                {recipe.tags && recipe.tags.length > 0
                  ? recipe.tags.join(', ')
                  : 'No tags'}
              </td>
              <td>{recipe.difficulty || 'N/A'}</td>
              <td>{recipe.cookingTime ? `${recipe.cookingTime} min` : '-'}</td>
              <td>{recipe.prepTime ? `${recipe.prepTime} min` : '-'}</td>
              <td>
                <button
                  style={{ marginRight: 8, background: '#2980b9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                  onClick={() => handleUpdate(recipe._id)}
                >
                  Update
                </button>
                <button
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                  onClick={() => handleDelete(recipe._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {recipes.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>No recipes found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}