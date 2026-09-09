import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Code d'activation de la PWA pour le mode hors-ligne
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('PWA DRETFP : Service Worker enregistré avec succès ! Scope : ', reg.scope))
      .catch(err => console.log('PWA DRETFP : Échec de l\'enregistrement du Service Worker :', err));
  });
}
