import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Remove CSS import to avoid PostCSS issues
// import './styles/globals/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);