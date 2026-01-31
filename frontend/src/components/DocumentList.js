import React from 'react';
import './DocumentList.css';

function DocumentList({ documents, selectedDocId, onSelectDoc, onDeleteDoc, onDuplicateDoc }) {
  return (
    <div className="document-list">
      {documents.length === 0 ? (
        <p className="empty-state">No documents yet</p>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className={`doc-item ${selectedDocId === doc.id ? 'active' : ''}`}
          >
            <div className="doc-info" onClick={() => onSelectDoc(doc.id)}>
              <h3>{doc.title}</h3>
              <p>{new Date(doc.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="doc-actions">
              <button
                className="action-btn duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateDoc(doc);
                }}
                title="Duplicate"
              >
                📋
              </button>
              <button
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this document?')) {
                    onDeleteDoc(doc.id);
                  }
                }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DocumentList;
