import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

function CouponPage() {
  const [form, setForm] = useState({
    couponCode: '',
    description: '',
    offerPercentage: '',
    category: 'common',
    minPurchaseAmount: '',
    minPurchaseCount: '', // <-- new field
    expiryDate: ''
  });
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch all coupons
  const fetchCoupons = async () => {
    const { data } = await axios.get('/api/coupons');
    setCoupons(data);
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
    }
  };

  // Delete coupon
  const handleDelete = async id => {
    if (!window.confirm('Delete this coupon?')) return;
    await axios.delete(`/api/coupons/${id}`);
    fetchCoupons();
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

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>{editingId ? 'Update Coupon' : 'Add Coupon'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <input
          name="couponCode"
          placeholder="Coupon Code"
          value={form.couponCode}
          onChange={handleChange}
          required
          disabled={!!editingId}
          style={{ marginRight: 10 }}
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          style={{ marginRight: 10 }}
        />
        <input
          name="offerPercentage"
          placeholder="Offer %"
          type="number"
          value={form.offerPercentage}
          onChange={handleChange}
          required
          style={{ width: 80, marginRight: 10 }}
        />
        <select name="category" value={form.category} onChange={handleChange} style={{ marginRight: 10 }}>
          <option value="common">Common</option>
          <option value="group">Group</option>
          <option value="individual">Individual</option>
        </select>
        <input
          name="minPurchaseAmount"
          placeholder="Min Purchase"
          type="number"
          value={form.minPurchaseAmount}
          onChange={handleChange}
          style={{ width: 110, marginRight: 10 }}
        />
        <input
          name="minPurchaseCount"
          placeholder="Min Purchases"
          type="number"
          value={form.minPurchaseCount}
          onChange={handleChange}
          style={{ width: 110, marginRight: 10 }}
        />
        <input
          name="expiryDate"
          type="date"
          value={form.expiryDate}
          onChange={handleChange}
          style={{ marginRight: 10 }}
        />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ couponCode: '', description: '', offerPercentage: '', category: 'common', minPurchaseAmount: '', minPurchaseCount: '', expiryDate: '' }); }} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        )}
      </form>

      <h3>All Coupons</h3>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Offer %</th>
            <th>Category</th>
            <th>Min Purchase</th>
            <th>Min Purchases</th>
            <th>Expiry</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map(coupon => (
            <tr key={coupon._id}>
              <td>{coupon.couponCode}</td>
              <td>{coupon.description}</td>
              <td>{coupon.offerPercentage}</td>
              <td>{coupon.category}</td>
              <td>{coupon.minPurchaseAmount || '-'}</td>
              <td>{coupon.minPurchaseCount || '-'}</td>
              <td>{coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '-'}</td>
              <td>
                <button onClick={() => handleEdit(coupon)}>Update</button>
                <button onClick={() => handleDelete(coupon._id)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CouponPage;