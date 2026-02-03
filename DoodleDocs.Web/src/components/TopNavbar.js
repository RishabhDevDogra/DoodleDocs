import React from 'react';
import PropTypes from 'prop-types';
import './TopNavbar.css';

function TopNavbar({ userName, onNewDocument, documentCount }) {
  return (
    <nav className="top-navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🎨</span>
        <h1 className="navbar-title">DoodleDocs</h1>
      </div>

      <div className="navbar-center">
        <span className="user-greeting">Hey, <span className="user-name">{userName}</span>!</span>
      </div>

      <div className="navbar-actions">
        <button 
          className="navbar-create-btn"
          onClick={onNewDocument}
          title="Create a new doodle"
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">New Doodle</span>
        </button>
        <span className="doc-count">{documentCount} doodles</span>
      </div>
    </nav>
  );
}

TopNavbar.propTypes = {
  userName: PropTypes.string.isRequired,
  onNewDocument: PropTypes.func.isRequired,
  documentCount: PropTypes.number.isRequired
};

export default TopNavbar;
