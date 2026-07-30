import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// Configure Axios Base URL for Production Vercel & Development
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://panchayat-connect-74r2.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
