import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

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

    ctx.drawImage(
      img,
      (img.width - size) / 2,
      (img.height - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  };
};

arrondirFavicon('/logo-dretfp.png');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('PWA DRETFP : Service Worker enregistré avec succès ! Scope : ', reg.scope))
      .catch(err => console.log('PWA DRETFP : Échec de l\'enregistrement du Service Worker :', err));
  });
}
