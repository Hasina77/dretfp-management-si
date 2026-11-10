import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import DemandeClient from './pages/demandes/DemandeClient'; 
import DashboardAdmin from './pages/demandes/DashboardAdmin';
import SaisieNotes from './pages/examens/SaisieNotes';
import SaisieCentreTerrain from './pages/examens/SaisieCentreTerrain';
import AuthChefCentre from './pages/examens/AuthChefCentre';
import PortailPublic from './pages/demandes/PortailPublic';
import EspaceChefCentre from './pages/demandes/EspaceChefCentre';

function App() {
  const currentUrl = window.location.href;
  const isUrlChefDeCentre = currentUrl.includes('chef-de-centre.onrender.com');

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isUrlChefDeCentre ? (
              <Navigate to="/register-chef" replace />
            ) : (
              <PortailPublic />
            )
          } 
        />

        <Route 
          path="/login" 
          element={
            isUrlChefDeCentre ? <Navigate to="/register-chef" replace /> : <Login />
          } 
        />
        
        <Route 
          path="/register-chef" 
          element={
            !isUrlChefDeCentre ? <Navigate to="/login" replace /> : <AuthChefCentre />
          } 
        />

        <Route path="/chef-de-centre" element={<EspaceChefCentre />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/demande-diplome" element={<DemandeClient />} />
        <Route path="/fiche-pv-examen" element={<SaisieCentreTerrain />} />
        <Route path="/saisie-notes" element={<SaisieNotes />} />

        <Route 
          path="*" 
          element={<Navigate to={isUrlChefDeCentre ? "/register-chef" : "/"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
