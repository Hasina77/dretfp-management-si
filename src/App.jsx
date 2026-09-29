import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import DemandeClient from './pages/demandes/DemandeClient'; 
import DashboardAdmin from './pages/demandes/DashboardAdmin';
import SaisieNotes from './pages/examens/SaisieNotes';
import SaisieCentreTerrain from './pages/examens/SaisieCentreTerrain';
import AuthChefCentre from './pages/examens/AuthChefCentre';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/fiche-pv-examen" element={<SaisieCentreTerrain />} />

        <Route path="/dashboard" element={<DashboardAdmin />} />

        <Route path="/saisie-notes" element={<SaisieNotes />} />

        <Route path="/demande-diplome" element={<DemandeClient />} />

        <Route path="/portail-terrain" element={<AuthChefCentre />} />


        <Route path="*" element={<div style={{ padding: '2rem', fontFamily: 'sans-serif', textTransform: 'uppercase', color: 'red' }}>Page introuvable</div>} />
      </Routes>
    </Router>
  );
}

export default App;
