import React, { useState, useEffect } from 'react';
import './App.css';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import VersionHistory from './components/VersionHistory';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch document details when selected
  useEffect(() => {
    if (selectedDocId) {
      fetchDocument(selectedDocId);
    }
  }, [selectedDocId]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5116/api/document');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchDocument = async (id) => {
    try {
      const res = await fetch(`http://localhost:5116/api/document/${id}`);
      const data = await res.json();
      setSelectedDoc(data);
    } catch (err) {
      console.error('Error fetching document:', err);
    }
  };

  const createNewDocument = async () => {
    try {
      const res = await fetch('http://localhost:5116/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Document' })
      });
      const newDoc = await res.json();
      setDocuments([newDoc, ...documents]);
      setSelectedDocId(newDoc.id);
    } catch (err) {
      console.error('Error creating document:', err);
    }
  };

  const updateDocument = async (id, title, content) => {
    try {
      const res = await fetch(`http://localhost:5116/api/document/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const updated = await res.json();
      setSelectedDoc(updated);
      setDocuments(documents.map(d => d.id === id ? updated : d));
    } catch (err) {
      console.error('Error updating document:', err);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await fetch(`http://localhost:5116/api/document/${id}`, { method: 'DELETE' });
      setDocuments(documents.filter(d => d.id !== id));
      if (selectedDocId === id) {
        setSelectedDocId(null);
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const duplicateDocument = async (docToDupe) => {
    try {
      const res = await fetch('http://localhost:5116/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${docToDupe.title} (Copy)` })
      });
      const newDoc = await res.json();
      // Copy content from original
      await fetch(`http://localhost:5116/api/document/${newDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${docToDupe.title} (Copy)`, content: docToDupe.content })
      });
      setDocuments([newDoc, ...documents]);
      setSelectedDocId(newDoc.id);
    } catch (err) {
      console.error('Error duplicating document:', err);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button className="new-doc-btn" onClick={createNewDocument}>+ New Document</button>
        <input
          type="text"
          className="search-box"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DocumentList
          documents={documents.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))}
          selectedDocId={selectedDocId}
          onSelectDoc={setSelectedDocId}
          onDeleteDoc={deleteDocument}
          onDuplicateDoc={duplicateDocument}
        />
      </div>
      <div className="editor-area">
        {selectedDoc ? (
          <DocumentEditor
            document={selectedDoc}
            onUpdate={updateDocument}
          />
        ) : (
          <div className="no-doc">
            <p>Select or create a document to start editing</p>
          </div>
        )}
      </div>
      <div className="version-history-panel">
        {selectedDoc && <VersionHistory documentId={selectedDoc.id} />}
      </div>
    </div>
  );
}

export default App;
