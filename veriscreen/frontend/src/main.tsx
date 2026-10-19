import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bootstrap CSS + Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Bootstrap JS (for dropdowns, modals)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Custom styles
import './styles/globals.css';
import { applyTheme, readTheme } from './theme';

applyTheme(readTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
