import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ShareView from './pages/ShareView';
import { ToastProvider } from './components/Toast';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/share/:documentId" element={<ShareView />} />
        </Routes>
      </Router>
    </ToastProvider>
  </React.StrictMode>
);

reportWebVitals();
