import React from 'react';
import PropTypes from 'prop-types';
import './TopNavbar.css';

function TopNavbar({ userName, documentTitle, onTitleChange, onShare, onNewDoodle }) {
  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <span className="navbar-logo">🎨</span>
          <span className="navbar-title">DoodleDocs</span>
        </div>
        
        <input
          type="text"
          className="navbar-doc-title"
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Docs"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="navbar-right">
        <span className="user-greeting">Hey, <span className="user-name">{userName}</span>!</span>
        <button 
          className="navbar-new-btn"
          onClick={onNewDoodle}
          title="Create new doodle"
          aria-label="Create new doodle"
        >
          <span className="btn-icon" aria-hidden="true">✨</span>
          <span className="btn-text">New Doodle</span>
        </button>
        <button 
          className="navbar-share-btn"
          onClick={onShare}
          title="Share this doodle"
          aria-label="Share this doodle"
        >
          <span className="btn-icon" aria-hidden="true">🔗</span>
          <span className="btn-text">Share</span>
        </button>
      </div>
    </nav>
  );
}

TopNavbar.propTypes = {
  userName: PropTypes.string.isRequired,
  documentTitle: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onNewDoodle: PropTypes.func.isRequired
};

export default TopNavbar;
