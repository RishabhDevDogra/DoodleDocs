import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API_URL } from '../config';
import './VersionHistory.css';

function VersionHistory({ documentId, onRevert, userName }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEventHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/document/${documentId}/history`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching event history:', err);
    }
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchEventHistory();
    }
  }, [documentId, fetchEventHistory]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'DocumentCreated':
        return '📄';
      case 'ContentUpdated':
        return '✏️';
      case 'TitleUpdated':
        return '📝';
      case 'DocumentDeleted':
        return '🗑️';
      default:
        return '⚡';
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="version-history">
      <div className="history-header">
        <h3>Version History</h3>
        <button 
          className="history-refresh-btn"
          onClick={fetchEventHistory}
          disabled={loading}
          title="Refresh history"
        >
          🔄
        </button>
      </div>
      
      {loading && <div className="history-loading">Loading events...</div>}
      
      <div className="history-timeline">
        {events.length === 0 ? (
          <div className="history-empty">No events yet</div>
        ) : (
          events.map((event, idx) => (
            <div key={idx} className="history-event">
              <div className="event-marker">
                <span className="event-icon">{getEventIcon(event.eventType)}</span>
              </div>
              <div className="event-content">
                <div className="event-description">{event.description}</div>
                <div className="event-meta">
                  <span className="event-user">{userName}</span>
                  <span className="event-time">{formatTime(event.occurredAt)}</span>
                </div>
              </div>
              <div className="event-version">v{event.version}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

VersionHistory.propTypes = {
  documentId: PropTypes.string,
  onRevert: PropTypes.func,
  userName: PropTypes.string
};

export default VersionHistory;
