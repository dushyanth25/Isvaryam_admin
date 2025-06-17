import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [replyInputs, setReplyInputs] = useState({}); // { reviewId: replyText }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reviews');
      setReviews(res.data);
    } catch (err) {
      alert('Failed to fetch reviews');
    }
    setLoading(false);
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyInputs({ ...replyInputs, [reviewId]: value });
  };

  const handleReplySubmit = async (reviewId) => {
    try {
      await axios.put(`/api/reviews/reply/${reviewId}`, {
        text: replyInputs[reviewId]
      });
      alert('Reply added!');
      setReplyInputs({ ...replyInputs, [reviewId]: '' });
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add reply');
    }
  };

  return (
    <div>
      <h2>All Reviews</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding={8}>
          <thead>
            <tr>
              <th>User</th>
              <th>Product</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Replies</th>
              <th>Add Reply</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>{r.CustomerId?.name || 'User'}</td>
                <td>{r.productId?.name || 'Product'}</td>
                <td>{r.review}</td>
                <td>{r.rating}</td>
                <td>
                  {r.replies && r.replies.length > 0 ? (
                    <ul>
                      {r.replies.map(rep => (
                        <li key={rep._id}>
                          {rep.text} <small>({new Date(rep.createdAt).toLocaleString()})</small>
                        </li>
                      ))}
                    </ul>
                  ) : <i>No replies</i>}
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Add reply"
                    value={replyInputs[r._id] || ''}
                    onChange={e => handleReplyChange(r._id, e.target.value)}
                  />
                  <button onClick={() => handleReplySubmit(r._id)}>
                    Add Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Reviews;