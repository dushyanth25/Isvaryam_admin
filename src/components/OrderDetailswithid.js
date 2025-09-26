import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosInstance"; 
import './AdminOrderDetails.css';

export default function AdminOrderDetails() {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Fetch order from admin route
        const response = await axios.get(`api/orders/admin/order/${id}`);
        const fetchedOrder = response.data;

        // Optional: If your backend returns user ID only, fetch user info
        if (fetchedOrder.user && typeof fetchedOrder.user === "string") {
          const userRes = await axios.get(`/users/${fetchedOrder.user}`);
          fetchedOrder.user = userRes.data;
        }

        setOrder(fetchedOrder);
      } catch (err) {
        console.error("❌ Error fetching order:", err);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!order) return <p>No order found</p>;

  return (
    <div className="order-details">
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status || "N/A"}</p>
      <p><strong>Total Price:</strong> ₹{order.totalPrice || 0}</p>
      <p><strong>Delivery Charge:</strong> ₹{order.deliveryCharge || 0}</p>
      <p><strong>Discount:</strong> ₹{order.discount || 0}</p>
      {order.couponCode && <p><strong>Coupon Code:</strong> {order.couponCode}</p>}

      <h3>Items</h3>
      <ul>
        {order.items && order.items.length > 0 ? (
          order.items.map((item, idx) => (
            <li key={idx}>
              <p><strong>{item.product?.name || item.name || "Unknown Product"}</strong></p>
              <p>Quantity: {item.quantity || 0}</p>
              <p>Price: ₹{item.price || 0}</p>
            </li>
          ))
        ) : (
          <p>No items in this order.</p>
        )}
      </ul>

      <h3>Address</h3>
      {order.address ? (
        <div className="address-box">
          <p>{order.address.street || "N/A"}, {order.address.city || "N/A"}</p>
          <p>{order.address.state || "N/A"}, {order.address.pincode || "N/A"}</p>
        </div>
      ) : (
        <p>No address available</p>
      )}

      <p><strong>Created At:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
      <p><strong>Updated At:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "N/A"}</p>

      {order.user && (
        <div className="user-details">
          <h3>User Details</h3>
          <p><strong>User ID:</strong> {order.user._id || "N/A"}</p>
          <p><strong>Full Name:</strong> {order.user.name || "N/A"}</p>
          <p><strong>Email:</strong> {order.user.email || "N/A"}</p>
          <p><strong>Phone:</strong> {order.userPhone || order.user.phone || 'N/A'}</p>

        </div>
      )}
    </div>
  );
}
