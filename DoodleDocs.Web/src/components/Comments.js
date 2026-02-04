import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { API_URL } from '../config';
import './Comments.css';

function Comments({ documentId, userName, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (documentId && isOpen) {
      fetchComments();
      // Refresh comments every 2 seconds to catch updates from other users
      const interval = setInterval(fetchComments, 2000);
      return () => clearInterval(interval);
    }
  }, [documentId, isOpen]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/document/${documentId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/document/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          author: userName
        })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/api/document/${documentId}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="comments-panel">
      <div className="comments-header">
        <h3>💬 Comments</h3>
        <button className="comments-close-btn" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      <form className="comment-form" onSubmit={handleAddComment}>
        <textarea
          className="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="comment-submit-btn"
          disabled={isLoading || !newComment.trim()}
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">{formatTime(comment.timestamp)}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
              {comment.author === userName && (
                <button
                  className="comment-delete-btn"
                  onClick={() => handleDeleteComment(comment.id)}
                  title="Delete comment"
                >
                  🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

Comments.propTypes = {
  documentId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Comments;
