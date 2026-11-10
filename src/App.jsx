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
  const currentHostname = window.location.hostname;
  const isUrlChefDeCentre = 
    currentHostname.includes('chef-de-centre') || 
    import.meta.env.VITE_APP_MODE === 'CHEF_TERRAIN';

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
        
        <Route path="/login" element={<Login />} />  
        <Route path="/register-chef" element={<AuthChefCentre />} /> 
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/chef-de-centre" element={<EspaceChefCentre />} />
        <Route path="/demande-diplome" element={<DemandeClient />} />
        <Route path="/fiche-pv-examen" element={<SaisieCentreTerrain />} />
        <Route path="/saisie-notes" element={<SaisieNotes />} />

        <Route path="*" element={<Navigate to={isUrlChefDeCentre ? "/register-chef" : "/"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
