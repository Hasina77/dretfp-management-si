import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import DemandeClient from './pages/demandes/DemandeClient'; // 📜 Importation du vrai module officiel
import DashboardAdmin from './pages/demandes/DashboardAdmin';
import SaisieNotes from './pages/examens/SaisieNotes';
import SaisieCentrePublic from './pages/examens/SaisieCentrePublic';
import AuthChefCentre from './pages/examens/AuthChefCentre';




// Importation des futurs modules (composant temporaire pour éviter les erreurs)


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/saisie-centre-public" element={<SaisieCentrePublic />} />

        <Route path="/dashboard" element={<DashboardAdmin />} />

        <Route path="/saisie-notes" element={<SaisieNotes />} />

        <Route path="/demande-diplome" element={<DemandeClient />} />

        <Route path="/portail-terrain" element={<AuthChefCentre />} />


        {/*  Route de secours : si l'utilisateur tape une adresse inconnue */}
        <Route path="*" element={<div style={{ padding: '2rem', fontFamily: 'sans-serif', textTransform: 'uppercase', color: 'red' }}>Page introuvable</div>} />
      </Routes>
    </Router>
  );
}

export default App;
