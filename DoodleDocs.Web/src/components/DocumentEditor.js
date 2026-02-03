import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { API_URL, TITLE_SAVE_DELAY_MS, CANVAS_SAVE_DELAY_MS } from '../config';
import './DocumentEditor.css';
import ShareModal from './ShareModal';

function DocumentEditor({ document: doc, onUpdate }) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [maxVersion, setMaxVersion] = useState(0);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    setTitle(doc.title);
    setContent(doc.content);
    
    // Fetch event history to determine current version
    const fetchVersion = async () => {
      try {
        const res = await fetch(`${API_URL}/api/document/${doc.id}/history`);
        if (res.ok) {
          const events = await res.json();
          const latestVersion = events.length > 0 ? events[events.length - 1].version : 0;
          setCurrentVersion(latestVersion);
          setMaxVersion(latestVersion);
        }
      } catch (err) {
        console.error('Error fetching version:', err);
      }
    };
    fetchVersion();
  }, [doc]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = brushSize;
      context.strokeStyle = brushColor;
      contextRef.current = context;

      // Load existing drawing from content if it exists
      if (content && content.includes('data:image')) {
        const match = content.match(/src="(data:image[^"]*)/);
        if (match && match[1]) {
          const img = new Image();
          img.onload = () => {
            context.drawImage(img, 0, 0);
          };
          img.src = match[1];
        }
      }
    }
  }, [content, brushColor, brushSize]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    // Always save canvas as image since this is doodle-only
    if (canvasRef.current) {
      const canvasImage = canvasRef.current.toDataURL('image/png');
      const htmlContent = `<img src="${canvasImage}" style="max-width: 100%; border: 1px solid #ddd; margin: 20px 0;" />`;
      try {
        await onUpdate(doc.id, title, htmlContent);
        setContent(htmlContent);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Error saving:', err);
      }
    }
    setIsSaving(false);
  }, [doc.id, title, onUpdate]);

  // Auto-save on title change only (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== doc.title) {
        handleSave();
      }
    }, TITLE_SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [title, doc.title, handleSave]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    if (isDrawing) {
      // Save after drawing stops
      setTimeout(() => handleSave(), CANVAS_SAVE_DELAY_MS);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setContent('');
      handleSave();
    }
  };

  const exportDrawingImage = () => {
    let dataUrl = null;
    if (canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      const match = content.match(/src="(data:image[^"]*)"/);
      if (match && match[1]) {
        dataUrl = match[1];
      }
    }

    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${title || 'drawing'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleUndo = async () => {
    if (currentVersion <= 1) return; // Can't undo past version 1
    
    const targetVersion = currentVersion - 1;
    try {
      const res = await fetch(`${API_URL}/api/document/${doc.id}/version/${targetVersion}`);
      if (res.ok) {
        const versionDoc = await res.json();
        setTitle(versionDoc.title);
        setContent(versionDoc.content);
        setCurrentVersion(targetVersion);
        
        // Reload canvas with restored content
        if (canvasRef.current && contextRef.current) {
          const canvas = canvasRef.current;
          const context = contextRef.current;
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          if (versionDoc.content && versionDoc.content.includes('data:image')) {
            const match = versionDoc.content.match(/src="(data:image[^"]*)"/);  
            if (match && match[1]) {
              const img = new Image();
              img.onload = () => {
                context.drawImage(img, 0, 0);
              };
              img.src = match[1];
            }
          }
        }
      }
    } catch (err) {
      console.error('Error during undo:', err);
    }
  };

  const handleRedo = async () => {
    if (currentVersion >= maxVersion) return; // Can't redo past max version
    
    const targetVersion = currentVersion + 1;
    try {
      const res = await fetch(`${API_URL}/api/document/${doc.id}/version/${targetVersion}`);
      if (res.ok) {
        const versionDoc = await res.json();
        setTitle(versionDoc.title);
        setContent(versionDoc.content);
        setCurrentVersion(targetVersion);
        
        // Reload canvas with restored content
        if (canvasRef.current && contextRef.current) {
          const canvas = canvasRef.current;
          const context = contextRef.current;
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          if (versionDoc.content && versionDoc.content.includes('data:image')) {
            const match = versionDoc.content.match(/src="(data:image[^"]*)"/);  
            if (match && match[1]) {
              const img = new Image();
              img.onload = () => {
                context.drawImage(img, 0, 0);
              };
              img.src = match[1];
            }
          }
        }
      }
    } catch (err) {
      console.error('Error during redo:', err);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="title-section">
          <label className="title-label">📄 TITLE:</label>
          <input
            type="text"
            className="doc-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Click here to name your document..."
          />
        </div>
        <div className="save-status">
          {isSaving && <span className="saving">Saving...</span>}
          {!isSaving && lastSaved && (
            <span className="saved">✓ Saved</span>
          )}
        </div>
        <button 
          className="share-btn"
          onClick={() => setIsShareModalOpen(true)}
          title="Share this doodle with friends"
        >
          🔗 Share
        </button>
      </div>
      <div className="editor-toolbar">
        <button 
          className="toolbar-btn"
          onClick={handleUndo}
          disabled={currentVersion <= 1}
          title="Undo (Ctrl+Z)"
        >
          ↩️ Undo
        </button>
        <button 
          className="toolbar-btn"
          onClick={handleRedo}
          disabled={currentVersion >= maxVersion}
          title="Redo (Ctrl+Y)"
        >
          ↪️ Redo
        </button>
        <div className="toolbar-divider"></div>
        <div className="toolbar-group">
          <label className="toolbar-label">Color:</label>
          <input 
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="color-picker"
            title="Brush Color"
          />
        </div>
        <div className="toolbar-group">
          <label className="toolbar-label">Size:</label>
          <select 
            className="toolbar-select"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            title="Brush Size"
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={3}>3px</option>
            <option value={5}>5px</option>
            <option value={8}>8px</option>
            <option value={12}>12px</option>
            <option value={16}>16px</option>
            <option value={20}>20px</option>
          </select>
        </div>
        <button 
          className="toolbar-btn"
          title="Eraser"
          onClick={() => setBrushColor('#FFFFFF')}
        >
          🧻
        </button>
        <button 
          className="toolbar-btn clear-btn"
          title="Clear Drawing"
          onClick={clearCanvas}
        >
          Clear
        </button>
        <button 
          className="toolbar-btn"
          title="Download Drawing (.png)"
          onClick={exportDrawingImage}
        >
          Save
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <ShareModal 
        documentId={doc.id}
        documentTitle={title || 'Untitled'}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}

DocumentEditor.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default DocumentEditor;
