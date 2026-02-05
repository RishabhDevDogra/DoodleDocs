import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { API_URL, HUB_URL, SIGNALR_RECONNECT_DELAYS, SIGNALR_STARTUP_DELAY_MS } from '../config';
import DocumentEditor from '../components/DocumentEditor';
import TopNavbar from '../components/TopNavbar';
import Comments from '../components/Comments';
import VersionHistory from '../components/VersionHistory';
import ErrorBoundary from '../components/ErrorBoundary';
import './ShareView.css';
import { getOrCreateUserId } from '../utils/userSession';

function ShareView() {
  const { documentId } = useParams();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [userName, setUserName] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isEditingRef = useRef(false);
  const titleSaveTimerRef = useRef(null);

  useEffect(() => {
    const { userName: uname } = getOrCreateUserId();
    setUserName(uname);
  }, []);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect(SIGNALR_RECONNECT_DELAYS)
      .build();

    const connectionTimer = setTimeout(() => {
      connection.start()
        .then(() => console.log('ShareView SignalR Connected'))
        .catch(err => console.error('SignalR error:', err));
    }, SIGNALR_STARTUP_DELAY_MS);

    connection.on('DocumentUpdated', (updatedDocId) => {
      if (updatedDocId === documentId && !isEditingRef.current) {
        fetchDocument(documentId);
      }
    });

    return () => {
      clearTimeout(connectionTimer);
      connection.stop();
    };
  }, [documentId]);

  useEffect(() => {
    fetchDocument(documentId);
  }, [documentId]);

  const fetchDocument = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/document/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDoc(data);
      } else {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setSelectedDoc(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async (id, title, content) => {
    try {
      const { userId, userName: uname } = getOrCreateUserId();
      const res = await fetch(`${API_URL}/api/document/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, userId, userName: uname })
      });
      if (res.ok) {
        const updated = await res.json();
        // Only update state if we're not actively editing
        if (!isEditingRef.current) {
          setSelectedDoc(updated);
        }
      }
    } catch (err) {
      console.error('Error updating document:', err);
    }
  };

  const handleTitleChange = (newTitle) => {
    if (selectedDoc) {
      isEditingRef.current = true;
      setSelectedDoc({ ...selectedDoc, title: newTitle });
      
      // Clear previous timer
      if (titleSaveTimerRef.current) {
        clearTimeout(titleSaveTimerRef.current);
      }
      
      // Debounce the actual save
      titleSaveTimerRef.current = setTimeout(async () => {
        await updateDocument(selectedDoc.id, newTitle, selectedDoc.content);
        isEditingRef.current = false;
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="share-loading">
        <p>Loading shared document...</p>
      </div>
    );
  }

  if (!selectedDoc) {
    return (
      <div className="share-error">
        <h2>Document not found</h2>
        <p>This shared document is no longer available.</p>
        <a href="/">← Back to DoodleDocs</a>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="share-wrapper">
        <TopNavbar 
          userName={userName} 
          documentTitle={selectedDoc.title ?? ''}
          onTitleChange={handleTitleChange}
          onShare={() => {}}
          onNewDoodle={() => window.location.href = '/'}
        />
        <div className="share-container">
          <div className="share-editor">
            {selectedDoc ? (
              <DocumentEditor
                document={selectedDoc}
                onUpdate={updateDocument}
                onToggleHistory={() => setShowVersionHistory(!showVersionHistory)}
                showHistory={showVersionHistory}
                onToggleComments={() => setShowComments(!showComments)}
                showComments={showComments}
              />
            ) : (
              <div className="no-doc">Loading...</div>
            )}
          </div>
          {selectedDoc && showVersionHistory && (
            <div className="version-history-panel">
              <VersionHistory documentId={selectedDoc.id} userName={userName} onClose={() => setShowVersionHistory(false)} />
            </div>
          )}
          {selectedDoc && showComments && (
            <div className="comments-panel-wrapper">
              <Comments documentId={selectedDoc.id} userName={userName} isOpen={showComments} onClose={() => setShowComments(false)} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ShareView;
