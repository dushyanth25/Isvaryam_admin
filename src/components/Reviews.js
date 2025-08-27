import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import './Reviews.css'; // We'll create this CSS file

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'replied', 'unreplied'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'

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
    if (!replyInputs[reviewId] || replyInputs[reviewId].trim() === '') {
      alert('Please enter a reply');
      return;
    }

    try {
      await axios.put(`/api/reviews/reply/${reviewId}`, {
        text: replyInputs[reviewId]
      });
      alert('Reply added successfully!');
      setReplyInputs({ ...replyInputs, [reviewId]: '' });
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StarRating = ({ rating }) => (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
        >★</span>
      ))}
    </span>
  );

  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => {
    if (filter === 'replied') return review.replies && review.replies.length > 0;
    if (filter === 'unreplied') return !review.replies || review.replies.length === 0;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  return (
    <div className="admin-reviews-container">
      <div className="admin-header">
        <h2>Customer Reviews</h2>
        <div className="review-controls">
          <div className="filter-control">
            <label>Filter:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Reviews</option>
              <option value="replied">Replied</option>
              <option value="unreplied">Unreplied</option>
            </select>
          </div>
          <div className="sort-control">
            <label>Sort by:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : sortedReviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {sortedReviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.CustomerId?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="reviewer-details">
                    <h4>{review.CustomerId?.name || 'Customer'}</h4>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="review-rating">
                  <StarRating rating={review.rating} />
                  <span className="rating-value">({review.rating})</span>
                </div>
              </div>

              <div className="review-product">
                Product: <strong>{review.productId?.name || 'Unknown Product'}</strong>
              </div>

              <div className="review-content">
                <p>{review.review}</p>
              </div>

              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="review-image"
                    />
                  ))}
                </div>
              )}

              <div className="review-replies">
                <h5>Replies ({review.replies ? review.replies.length : 0})</h5>
                {review.replies && review.replies.length > 0 ? (
                  <div className="replies-list">
                    {review.replies.map(reply => (
                      <div key={reply._id} className="reply-item">
                        <div className="reply-header">
                          <span className="reply-author">Admin</span>
                          <span className="reply-date">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="reply-text">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-replies">No replies yet.</p>
                )}
              </div>

              <div className="reply-section">
                <h5>Add a Reply</h5>
                <textarea
                  placeholder="Type your reply here..."
                  value={replyInputs[review._id] || ''}
                  onChange={e => handleReplyChange(review._id, e.target.value)}
                  className="reply-textarea"
                  rows="3"
                />
                <div className="reply-actions">
                  <button
                    onClick={() => handleReplySubmit(review._id)}
                    className="btn-primary"
                    disabled={!replyInputs[review._id] || replyInputs[review._id].trim() === ''}
                  >
                    Submit Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;