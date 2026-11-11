import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthChefCentre from './pages/examens/AuthChefCentre';
import EspaceChefCentre from './pages/demandes/EspaceChefCentre';
import SaisieNotes from './pages/examens/SaisieNotes';
import './index.css';

const AppChef = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthChefCentre />} />
        
        <Route path="/register-chef" element={<AuthChefCentre />} />
        <Route path="/chef-de-centre" element={<EspaceChefCentre />} />
        <Route path="/saisie-notes" element={<SaisieNotes />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const arrondirFavicon = (imageUrl) => {
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const size = Math.min(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  };
};

arrondirFavicon('/logo-dretfp.png');

ReactDOM.createRoot(document.getElementById('chef-root')).render(
  <React.StrictMode>
    <AppChef />
  </React.StrictMode>
);
