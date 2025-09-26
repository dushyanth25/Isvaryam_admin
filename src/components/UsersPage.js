import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import "./UsersPage.css";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token"); // Admin JWT token

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersArray = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(usersArray);
      setFilteredUsers(usersArray);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) return setFilteredUsers(users);

    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term)
      )
    );
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredUsers(users);
  };

  const toggleBlock = async (id, isBlocked) => {
    try {
      await axios.patch(
        `/api/users/${id}/block`,
        { block: !isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: !isBlocked } : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: !isBlocked } : u))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update user status");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setFilteredUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Edit user (you can redirect to edit page or open modal)
  const handleEdit = (id) => {
    // Example: navigate to edit page
    window.location.href = `/users/edit/${id}`;
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="users-dashboard">
      <h2>Users Management</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 Search</button>
        <button onClick={handleClearSearch}>❌ Clear</button>
        <div>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Admin</th>
            <th>Blocked</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id} className={user.isBlocked ? "blocked" : ""}>
                <td>{user.name || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{user.isAdmin ? "Yes" : "No"}</td>
                <td>{user.isBlocked ? "Yes" : "No"}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td className="actions-cell">
                 
                  <button className="edit-btn" onClick={() => handleEdit(user._id)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="no-records">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
