import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './DisplayRecipe.css';

export default function DisplayRecipe() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchTerm, filterTag, filterDifficulty]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/recipes');
      setRecipes(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let result = recipes;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.author?.name && recipe.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by tag
    if (filterTag) {
      result = result.filter(recipe => 
        recipe.tags && recipe.tags.includes(filterTag)
      );
    }

    // Filter by difficulty
    if (filterDifficulty) {
      result = result.filter(recipe => 
        recipe.difficulty === filterDifficulty
      );
    }

    setFilteredRecipes(result);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes(recipes.filter(r => r._id !== id));
      setSuccess('Recipe deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete recipe');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/edit-recipe/${id}`);
  };

  const handleView = (id) => {
    navigate(`/recipe/${id}`);
  };

  // Extract all unique tags for filter dropdown
  const allTags = [...new Set(recipes.flatMap(recipe => recipe.tags || []))];

  if (loading) {
    return (
      <div className="recipe-dashboard">
        <div className="loading-spinner">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="recipe-dashboard">
      <div className="dashboard-header">
        <h2>Recipe Management</h2>
        <button 
          className="btn-primary"
          onClick={() => navigate('/add-recipe')}
        >
          Add New Recipe
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search recipes by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">All Difficulty Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </div>
      </div>

      <div className="table-container">
        <table className="recipes-table">
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
            {filteredRecipes.map(recipe => (
              <tr key={recipe._id}>
                <td className="title-cell">
                  <div 
                    className="recipe-title"
                    onClick={() => handleView(recipe._id)}
                  >
                    {recipe.title}
                  </div>
                </td>
                <td>{recipe.author?.name || 'N/A'}</td>
                <td>
                  <div className="image-gallery">
                    {recipe.images && recipe.images.length > 0 ? (
                      recipe.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="recipe"
                          className="recipe-thumbnail"
                        />
                      ))
                    ) : (
                      <span className="no-image">No images</span>
                    )}
                    {recipe.images && recipe.images.length > 3 && (
                      <span className="more-images">+{recipe.images.length - 3} more</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="tags-container">
                    {recipe.tags && recipe.tags.length > 0 ? (
                      recipe.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))
                    ) : (
                      'No tags'
                    )}
                    {recipe.tags && recipe.tags.length > 3 && (
                      <span className="more-tags">+{recipe.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`difficulty-badge difficulty-${recipe.difficulty?.toLowerCase() || 'unknown'}`}>
                    {recipe.difficulty || 'N/A'}
                  </span>
                </td>
                <td>{recipe.cookingTime ? `${recipe.cookingTime} min` : '-'}</td>
                <td>{recipe.prepTime ? `${recipe.prepTime} min` : '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleView(recipe._id)}
                      title="View Recipe"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-update"
                      onClick={() => handleUpdate(recipe._id)}
                      title="Edit Recipe"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(recipe._id)}
                      title="Delete Recipe"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRecipes.length === 0 && (
              <tr>
                <td colSpan={8} className="no-records">
                  No recipes found. {recipes.length === 0 ? 'Try adding some recipes!' : 'Try changing your filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}