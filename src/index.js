import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Aqui você pode criar estilos globais se quiser

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
