import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import AddProducts from './components/AddProducts';
import CouponPage from './components/CouponPage';

import DisplayProducts from './components/DisplayProducts';
import EditProducts from './components/EditProducts';
import Reviews from './components/Reviews';
import WhishList from './components/WhishList';
import AddRecipe from './components/AddRecipe';
import DisplayRecipe from './components/DisplayRecipe';
import EditRecipe from './components/EditRecipe';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-product" element={<AddProducts />} />
        <Route path="/display-products" element={<DisplayProducts />} />
        <Route path="/edit-product/:productId" element={<EditProducts />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/wishlist" element={<WhishList />} />
        <Route path="/coupons" element={<CouponPage />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/display-recipes" element={<DisplayRecipe />} />
        <Route path="/edit-recipe/:id" element={<EditRecipe />} />
      </Routes>
    </Router>
  );
}

export default App;
