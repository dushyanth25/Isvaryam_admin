import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import './CouponPage.css'; // We'll create this CSS file

function CouponPage() {
  const [form, setForm] = useState({
    couponCode: '',
    description: '',
    offerPercentage: '',
    category: 'common',
    minPurchaseAmount: '',
    minPurchaseCount: '',
    expiryDate: ''
  });
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/coupons');
      setCoupons(data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      alert('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update coupon
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        offerPercentage: Number(form.offerPercentage),
        minPurchaseAmount: form.minPurchaseAmount ? Number(form.minPurchaseAmount) : undefined,
        minPurchaseCount: form.minPurchaseCount ? Number(form.minPurchaseCount) : undefined,
      };
      
      if (editingId) {
        await axios.put(`/api/coupons/${editingId}`, payload);
      } else {
        await axios.post('/api/coupons', payload);
      }
      
      setForm({
        couponCode: '',
        description: '',
        offerPercentage: '',
        category: 'common',
        minPurchaseAmount: '',
        minPurchaseCount: '',
        expiryDate: ''
      });
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving coupon');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete coupon
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await axios.delete(`/api/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  // Edit coupon
  const handleEdit = coupon => {
    setForm({
      couponCode: coupon.couponCode,
      description: coupon.description,
      offerPercentage: coupon.offerPercentage,
      category: coupon.category,
      minPurchaseAmount: coupon.minPurchaseAmount || '',
      minPurchaseCount: coupon.minPurchaseCount || '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : ''
    });
    setEditingId(coupon._id);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setForm({
      couponCode: '',
      description: '',
      offerPercentage: '',
      category: 'common',
      minPurchaseAmount: '',
      minPurchaseCount: '',
      expiryDate: ''
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if coupon is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="coupon-dashboard">
      <header className="dashboard-header">
        <h1>Coupon Management</h1>
        <p>Create and manage discount coupons for your store</p>
      </header>

      <div className="dashboard-content">
        <div className="coupon-form-container">
          <div className="form-header">
            <h2>{editingId ? 'Update Coupon' : 'Create New Coupon'}</h2>
            {editingId && (
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="coupon-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="couponCode">Coupon Code *</label>
                <input
                  id="couponCode"
                  name="couponCode"
                  placeholder="SUMMER25"
                  value={form.couponCode}
                  onChange={handleChange}
                  required
                  disabled={!!editingId}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="offerPercentage">Discount Percentage *</label>
                <input
                  id="offerPercentage"
                  name="offerPercentage"
                  placeholder="15"
                  type="number"
                  min="1"
                  max="100"
                  value={form.offerPercentage}
                  onChange={handleChange}
                  required
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <input
                id="description"
                name="description"
                placeholder="Summer sale discount"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select 
                  id="category" 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                >
                  <option value="common">Common</option>
                  <option value="group">Group</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minPurchaseAmount">Minimum Purchase Amount ($)</label>
                <input
                  id="minPurchaseAmount"
                  name="minPurchaseAmount"
                  placeholder="50"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minPurchaseAmount}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="minPurchaseCount">Minimum Purchase Count</label>
                <input
                  id="minPurchaseCount"
                  name="minPurchaseCount"
                  placeholder="3"
                  type="number"
                  min="0"
                  value={form.minPurchaseCount}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : (editingId ? 'Update Coupon' : 'Create Coupon')}
            </button>
          </form>
        </div>

        <div className="coupons-table-container">
          <div className="table-header">
            <h2>All Coupons</h2>
            <button onClick={fetchCoupons} className="refresh-btn">
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="empty-state">
              <h3>No coupons found</h3>
              <p>Create your first coupon to get started</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="coupons-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Category</th>
                    <th>Min Amount</th>
                    <th>Min Count</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => (
                    <tr key={coupon._id} className={isExpired(coupon.expiryDate) ? 'expired' : ''}>
                      <td className="coupon-code">{coupon.couponCode}</td>
                      <td className="description">{coupon.description}</td>
                      <td className="percentage">{coupon.offerPercentage}%</td>
                      <td>
                        <span className={`category-badge ${coupon.category}`}>
                          {coupon.category}
                        </span>
                      </td>
                      <td className="amount">{coupon.minPurchaseAmount ? `$${coupon.minPurchaseAmount}` : '-'}</td>
                      <td className="count">{coupon.minPurchaseCount || '-'}</td>
                      <td className="expiry">{formatDate(coupon.expiryDate)}</td>
                      <td>
                        {isExpired(coupon.expiryDate) ? (
                          <span className="status-badge expired">Expired</span>
                        ) : (
                          <span className="status-badge active">Active</span>
                        )}
                      </td>
                      <td className="actions">
                        <button 
                          onClick={() => handleEdit(coupon)} 
                          className="action-btn edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon._id)} 
                          className="action-btn delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CouponPage;