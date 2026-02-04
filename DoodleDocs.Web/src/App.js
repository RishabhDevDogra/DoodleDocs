import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_URL, HUB_URL, SIGNALR_RECONNECT_DELAYS, SIGNALR_STARTUP_DELAY_MS } from './config';
import './App.css';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import VersionHistory from './components/VersionHistory';
import TopNavbar from './components/TopNavbar';
import ShareModal from './components/ShareModal';
import { getOrCreateUserId } from './utils/userSession';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Initialize user session on mount
  useEffect(() => {
    const { userName: uname } = getOrCreateUserId();
    setUserName(uname);
  }, []);

  // Set up SignalR connection for real-time updates
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect(SIGNALR_RECONNECT_DELAYS)
      .build();

    // Add a delay before connecting to allow backend to fully initialize
    const connectionTimer = setTimeout(() => {
      connection.start()
        .then(() => console.log('SignalR Connected'))
        .catch(err => {
          // Suppress initial negotiation errors - they're normal during startup
          if (!err.message?.includes('negotiation')) {
            console.error('SignalR Connection Error:', err);
          }
        });
    }, SIGNALR_STARTUP_DELAY_MS);

    // Listen for document created
    connection.on('DocumentCreated', (documentId, title) => {
      console.log('Document created:', documentId, title);
      fetchDocuments(); // Refresh document list
    });

    // Listen for document updated
    connection.on('DocumentUpdated', (documentId) => {
      console.log('Document updated:', documentId);
      fetchDocuments(); // Refresh document list
      if (selectedDocId === documentId) {
        fetchDocument(documentId); // Refresh selected document
      }
    });

    // Listen for document deleted
    connection.on('DocumentDeleted', (documentId) => {
      console.log('Document deleted:', documentId);
      fetchDocuments(); // Refresh document list
      if (selectedDocId === documentId) {
        setSelectedDocId(null);
        setSelectedDoc(null);
      }
    });

    return () => {
      clearTimeout(connectionTimer);
      connection.stop();
    };
  }, [selectedDocId]);

  // Fetch all documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-create first document if none exist and select it
  useEffect(() => {
    if (documents.length === 0 && !selectedDocId) {
      createNewDocument();
    } else if (documents.length > 0 && !selectedDocId) {
      // If we have documents but none selected, select the first one
      setSelectedDocId(documents[0].id);
    }
  }, [documents, selectedDocId]);

  // Fetch document details when selected
  useEffect(() => {
    if (selectedDocId) {
      fetchDocument(selectedDocId);
    }
  }, [selectedDocId]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/document`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchDocument = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/document/${id}`);
      const data = await res.json();
      setSelectedDoc(data);
    } catch (err) {
      console.error('Error fetching document:', err);
    }
  };

  const createNewDocument = async () => {
    try {
      const res = await fetch(`${API_URL}/api/document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Doodle' })
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
      const res = await fetch(`${API_URL}/api/document/${id}`, {
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

  const handleTitleChange = (newTitle) => {
    if (selectedDoc) {
      setSelectedDoc({ ...selectedDoc, title: newTitle });
      // Debounce the actual save
      const timer = setTimeout(() => {
        updateDocument(selectedDoc.id, newTitle, selectedDoc.content);
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await fetch(`${API_URL}/api/document/${id}`, { method: 'DELETE' });
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
      const res = await fetch(`${API_URL}/api/document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${docToDupe.title} (Copy)` })
      });
      const newDoc = await res.json();
      // Copy content from original
      await fetch(`${API_URL}/api/document/${newDoc.id}`, {
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
    <div className="app-wrapper">
      <TopNavbar 
        userName={userName} 
        documentTitle={selectedDoc?.title || 'Untitled Masterpiece'}
        onTitleChange={handleTitleChange}
        onShare={() => setIsShareModalOpen(true)}
        onNewDoodle={createNewDocument}
      />
      <div className="app">
        <div className="editor-area">
          {selectedDoc ? (
            <DocumentEditor
              document={selectedDoc}
              onUpdate={updateDocument}
              onToggleHistory={() => setShowVersionHistory(!showVersionHistory)}
              showHistory={showVersionHistory}
            />
          ) : (
            <div className="no-doc">
              <p>Loading your masterpiece...</p>
            </div>
          )}
        </div>
        {selectedDoc && showVersionHistory && (
          <div className="version-history-panel">
            <VersionHistory documentId={selectedDoc.id} userName={userName} onClose={() => setShowVersionHistory(false)} />
          </div>
        )}
      </div>
      {selectedDoc && (
        <ShareModal 
          documentId={selectedDoc.id}
          documentTitle={selectedDoc.title}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
