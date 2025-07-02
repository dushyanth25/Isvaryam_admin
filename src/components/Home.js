import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Welcome to Home Page</h2>
      <button onClick={() => navigate('/add-product')}>Add Product</button>
      <button onClick={() => navigate('/display-products')}>Display Products</button>
      <button onClick={() => navigate('/reviews')}>Reviews</button>
      <button onClick={() => navigate('/wishlist')}>Wishlist</button> {/* Added Wishlist button */}
      <button onClick={() => navigate('/coupons')}>Coupons</button> {/* Add this line */}
      <button onClick={() => navigate('/display-recipes')}>Display Recipes</button> {/* Added Edit Recipe button */}
     {/* Fastbot Integration */}
<button onClick={() => navigate('/add-recipe')}>Add Recipe</button> {/* Add this line */}
      <div style={{ marginTop: 20 }}>
        <iframe
          style={{ width: 400, height: 600, border: 'none' }}
          src="https://app.fastbots.ai/embed/cmazgeraw003hoelu7up9cu08"
          title="Fastbot"
        ></iframe>
      </div>
    </div>
  );
}

export default Home;
