import React, { useState, useEffect, useCallback, useRef } from 'react';
import './DocumentEditor.css';

function DocumentEditor({ document: doc, onUpdate }) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const contentRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    setTitle(doc.title);
    setContent(doc.content);
    if (contentRef.current) {
      contentRef.current.innerHTML = doc.content;
      updateCounts();
    }
  }, [doc]);

  const updateCounts = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      const chars = text.length;
      setWordCount(words);
      setCharCount(chars);
    }
  };

  useEffect(() => {
    if (drawingMode && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 2;
      context.strokeStyle = '#000';
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
  }, [drawingMode, content]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    let htmlContent = content;
    
    // If in drawing mode, save canvas as image
    if (drawingMode && canvasRef.current) {
      const canvasImage = canvasRef.current.toDataURL('image/png');
      htmlContent = `<img src="${canvasImage}" style="max-width: 100%; border: 1px solid #ddd; margin: 20px 0;" />`;
    } else if (!drawingMode) {
      // In text mode, get content from the contentRef
      htmlContent = contentRef.current ? contentRef.current.innerHTML : content;
    }
    
    try {
      await onUpdate(doc.id, title, htmlContent);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving:', err);
    }
    setIsSaving(false);
  }, [doc.id, title, content, drawingMode, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-save if in text mode
      if (!drawingMode) {
        const currentContent = contentRef.current ? contentRef.current.innerHTML : content;
        if (title !== doc.title || currentContent !== doc.content) {
          handleSave();
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content, doc.title, doc.content, handleSave, drawingMode]);

  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
      updateCounts();
    }
  };

  const applyFormat = (command, value = null) => {
    // Make sure the content div is focused
    if (contentRef.current) {
      contentRef.current.focus();
      document.execCommand(command, false, value);
      handleContentChange();
    }
  };

  const applyFontSize = (size) => {
    setFontSize(size);
    if (contentRef.current) {
      contentRef.current.style.fontSize = size + 'px';
    }
  };

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

  const toggleDrawingMode = () => {
    if (drawingMode) {
      // Switching from drawing to text mode - save the drawing immediately
      if (canvasRef.current) {
        const canvasImage = canvasRef.current.toDataURL('image/png');
        const imgHtml = `<img src="${canvasImage}" style="max-width: 100%; border: 1px solid #ddd; margin: 20px 0;" />`;
        
        // Update state
        setContent(imgHtml);
        
        // Save directly without waiting for state
        onUpdate(doc.id, title, imgHtml).then(() => {
          setLastSaved(new Date());
        }).catch(err => console.error('Error saving:', err));
      }
    }
    setDrawingMode(!drawingMode);
  };

  const exportAsText = () => {
    const text = contentRef.current?.innerText || '';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `${title}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <input
          type="text"
          className="doc-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          disabled={drawingMode}
        />
        <div className="save-status">
          {isSaving && <span className="saving">Saving...</span>}
          {!isSaving && lastSaved && (
            <span className="saved">✓ Saved</span>
          )}
        </div>
      </div>
      <div className="editor-toolbar">
        {!drawingMode ? (
          <>
            <button 
              className="toolbar-btn"
              title="Bold (select text first)"
              onClick={() => applyFormat('bold')}
            >
              <strong>B</strong>
            </button>
            <button 
              className="toolbar-btn"
              title="Italic (select text first)"
              onClick={() => applyFormat('italic')}
            >
              <em>I</em>
            </button>
            <button 
              className="toolbar-btn"
              title="Underline (select text first)"
              onClick={() => applyFormat('underline')}
            >
              <u>U</u>
            </button>
            <button 
              className="toolbar-btn"
              title="Strikethrough (select text first)"
              onClick={() => applyFormat('strikethrough')}
            >
              <s>S</s>
            </button>
            <select 
              className="toolbar-select"
              value={fontSize}
              onChange={(e) => applyFontSize(parseInt(e.target.value))}
              title="Font Size"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
              <option value={24}>24px</option>
              <option value={28}>28px</option>
              <option value={32}>32px</option>
            </select>
            <button 
              className="toolbar-btn"
              title="Export as Text"
              onClick={exportAsText}
            >
              ⬇️
            </button>
          </>
        ) : (
          <>
            <button 
              className="toolbar-btn clear-btn"
              title="Clear Drawing"
              onClick={clearCanvas}
            >
              Clear
            </button>
          </>
        )}
        <button 
          className={`toolbar-btn doodle-btn ${drawingMode ? 'active' : ''}`}
          title={drawingMode ? "Exit Doodle Mode" : "Enter Doodle Mode"}
          onClick={toggleDrawingMode}
        >
          🎨
        </button>
      </div>
      {!drawingMode ? (
        <>
          <div
            ref={contentRef}
            className="editor-content"
            contentEditable={true}
            onInput={handleContentChange}
            onBlur={handleSave}
            suppressContentEditableWarning={true}
            style={{ fontSize: fontSize + 'px' }}
          />
          <div className="editor-footer">
            <span className="word-count">Words: {wordCount} | Characters: {charCount}</span>
          </div>
        </>
      ) : (
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      )}
    </div>
  );
}

export default DocumentEditor;
