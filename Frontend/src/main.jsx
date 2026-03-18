import './index.css'
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. Import the provider

//Google api
const GOOGLE_CLIENT_ID = "377201100840-af4vtcleeq2ddv6rh38jrml26krl3rm4.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);