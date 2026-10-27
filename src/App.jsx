import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import DemandeClient from './pages/demandes/DemandeClient'; 
import DashboardAdmin from './pages/demandes/DashboardAdmin';
import SaisieNotes from './pages/examens/SaisieNotes';
import SaisieCentreTerrain from './pages/examens/SaisieCentreTerrain';
import AuthChefCentre from './pages/examens/AuthChefCentre';
import PortailPublic from './pages/demandes/PortailPublic';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortailPublic />} />

        <Route path="/connexion-admin" element={<Login />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/demande-diplome" element={<DemandeClient />} />

        <Route path="/fiche-pv-examen" element={<SaisieCentreTerrain />} />
        <Route path="/saisie-notes" element={<SaisieNotes />} />
        <Route path="/portail-terrain" element={<AuthChefCentre />} />

        <Route path="/login" element={<Navigate to="/" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
