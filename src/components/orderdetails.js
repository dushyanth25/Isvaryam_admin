import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './DisplayOrders.css';

export default function DisplayOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Admin JWT token

  useEffect(() => {
    fetchOrdersWithUsers();
  }, []);

  const fetchOrdersWithUsers = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch all orders
      const { data: ordersData } = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2️⃣ Extract unique user IDs
      const userIds = [...new Set(
        ordersData
          .filter(order => order.user && typeof order.user === 'string')
          .map(order => order.user)
      )];

      // 3️⃣ Fetch all users if any
      let usersMap = {};
      if (userIds.length > 0) {
        const usersRes = await axios.get(`/api/users?id=${userIds.join(',')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure we have an array
        const usersArray = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || [usersRes.data];

        // Convert array to map for quick lookup
        usersMap = usersArray.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});
      }

      // 4️⃣ Replace user IDs with full user objects
      const ordersWithUsers = ordersData.map(order => {
        if (order.user && typeof order.user === 'string') {
          order.user = usersMap[order.user] || null;
        }
        return order;
      });

      setOrders(ordersWithUsers);
      setFilteredOrders(ordersWithUsers);
      setError('');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized. Please login as admin.'
          : 'Failed to fetch orders'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search & filter
  const handleSearch = () => {
    if (!searchTerm) return setFilteredOrders(orders);

    const term = searchTerm.toLowerCase();
    setFilteredOrders(
      orders.filter(order =>
        order._id.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term) ||
        (order.address &&
          (`${order.address.doorNumber || ''} ${order.address.street || ''} ${order.address.area || ''} ${order.address.district || ''} ${order.address.state || ''} ${order.address.pincode || ''}`
            .toLowerCase()
            .includes(term)
          )
        ) ||
        order.items?.some(item =>
          (item.product?.name || '').toLowerCase().includes(term)
        )
      )
    );
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredOrders(orders);
  };

  // 🗑️ Delete order
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o._id !== id));
      setFilteredOrders(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete order');
      setTimeout(() => setError(''), 3000);
    }
  };

  // 👁️ View order details
  const handleView = (id) => navigate(`/order/${id}`);

  // 🔄 Update order status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/orders/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.map(order => order._id === id ? { ...order, status: newStatus } : order));
      setFilteredOrders(prev => prev.map(order => order._id === id ? { ...order, status: newStatus } : order));
    } catch (err) {
      console.error(err);
      setError('Failed to update order status');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div className="loading-spinner">Loading orders...</div>;

  return (
    <div className="orders-dashboard">
      <div className="dashboard-header"><h2>Orders Management</h2></div>
      {error && <div className="alert error">{error}</div>}

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by order ID, user name, status, address, or product"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 Search</button>
        <button onClick={handleClearSearch}>❌ Clear</button>
        <div>Showing {filteredOrders.length} of {orders.length} orders</div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Name</th>
              <th>Total Price</th>
              <th>Delivery Charge</th>
              <th>Status</th>
              <th>Items</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user?.name || order.name || 'N/A'}</td>
                <td>₹{order.totalPrice}</td>
                <td>₹{order.deliveryCharge}</td>
                <td>
                  <select value={order.status} 
    className={`status-select ${order.status.toLowerCase()}`} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                    <option value="NEW">NEW</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAYED">PAYED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </td>
                <td>
                  {order.items?.map((item, idx) => (
                    <div key={idx}>{item.product?.name || 'Unknown Product'} - Qty: {item.quantity} - ₹{item.price}</div>
                  )) || 'No items'}
                </td>
                <td>
                  {order.address
                    ? `${order.address.doorNumber || ''}, ${order.address.street || ''}, ${order.address.area || ''}, ${order.address.district || ''}, ${order.address.state || ''} - ${order.address.pincode || ''}`
                    : 'No address'}
                </td>
                <td>
                  <button className="btn-view" onClick={() => handleView(order._id)}>👁️ View</button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan={9} className="no-records">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
