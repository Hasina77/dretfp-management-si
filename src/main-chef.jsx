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

ReactDOM.createRoot(document.getElementById('chef-root')).render(
  <React.StrictMode>
    <AppChef />
  </React.StrictMode>
);
