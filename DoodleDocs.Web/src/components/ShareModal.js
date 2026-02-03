import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ShareModal.css';

function ShareModal({ documentId, documentTitle, onClose, isOpen }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${documentId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share "{documentTitle}"</h2>
          <button className="share-modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="share-modal-content">
          <p className="share-description">Share this link with friends to collaborate:</p>
          
          <div className="share-link-container">
            <input
              type="text"
              className="share-link-input"
              value={shareUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button
              className={`share-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="share-methods">
            <h3>Share via:</h3>
            <div className="share-buttons">
              <a
                href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20doodle!%20${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-social-btn twitter"
                title="Share on Twitter"
              >
                𝕏
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-social-btn facebook"
                title="Share on Facebook"
              >
                f
              </a>
              <a
                href={`mailto:?subject=Check out my doodle!&body=${encodeURIComponent(shareUrl)}`}
                className="share-social-btn email"
                title="Share via Email"
              >
                ✉️
              </a>
            </div>
          </div>

          <div className="share-info">
            <p>💡 Anyone with this link can view and interact with your doodle!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

ShareModal.propTypes = {
  documentId: PropTypes.string.isRequired,
  documentTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default ShareModal;
