import React, { useState, useEffect, useCallback, useRef } from 'react';
import './DocumentEditor.css';

function DocumentEditor({ document: doc, onUpdate }) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    setTitle(doc.title);
    setContent(doc.content);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, handleSave]);

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

  return (
    <div className="editor-container">
      <div className="editor-header">
        <input
          type="text"
          className="doc-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Drawing title"
        />
        <div className="save-status">
          {isSaving && <span className="saving">Saving...</span>}
          {!isSaving && lastSaved && (
            <span className="saved">✓ Saved</span>
          )}
        </div>
      </div>
      <div className="editor-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: 'var(--text-light)', fontSize: '12px', fontWeight: '600' }}>Color:</label>
          <input 
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ cursor: 'pointer', width: '40px', height: '36px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
            title="Brush Color"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: 'var(--text-light)', fontSize: '12px', fontWeight: '600' }}>Size:</label>
          <select 
            className="toolbar-select"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            title="Brush Size"
            style={{ minWidth: '70px' }}
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
          🧹
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
    </div>
  );
}

export default DocumentEditor;
