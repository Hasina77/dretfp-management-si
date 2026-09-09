import React, { useState } from 'react';
import axios from 'axios';
import './DemandeClient.css';
import { useNavigate } from 'react-router-dom';

const DemandeClient = () => {
  const navigate = useNavigate();
  const [typeDocument, setTypeDocument] = useState('ATTESTATION');
  const [matricule, setMatricule] = useState('');
  const [anneeSession, setAnneeSession] = useState('');
  const [fichierJustificatif, setFichierJustificatif] = useState(null);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Simulation de la table des demandes pour cet apprenant connecté
  const [mesDemandes, setMesDemandes] = useState([
    { id: 101, type: 'ATTESTATION', session: '2025', date: '15/08/2026', statut: 'VALIDE' },
    { id: 102, type: 'DIPLOME', session: '2025', date: '03/09/2026', statut: 'EN_ATTENTE' }
  ]);

  const handleFileChange = (e) => {
    setFichierJustificatif(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('dretfp_token');
    const formData = new FormData();
    formData.append('type_document', typeDocument);
    formData.append('numero_matricule', matricule);
    formData.append('annee_session', anneeSession);
    if (fichierJustificatif) formData.append('file', fichierJustificatif);

    try {
      // Bloc d'envoi vers FastAPI (Sera actif avec ton backend Python)
      /* 
      const response = await axios.post('http://localhost:8000/api/demandes/creer', formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      */

      // Simulation d'ajout en local immédiat pour le rendu visuel
      const nouvelleDemande = {
        id: Date.now(),
        type: typeDocument,
        session: anneeSession,
        date: new Date().toLocaleDateString(),
        statut: 'EN_ATTENTE'
      };

      setMesDemandes([nouvelleDemande, ...mesDemandes]);
      setMessage({ type: 'success', text: `Votre demande d'${typeDocument.toLowerCase()} a été soumise avec succès.` });
      setMatricule('');
      setAnneeSession('');
    } catch (err) {
      setMessage({ type: 'error', text: "Une erreur est survenue lors de l'envoi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demande-container">
      {/* BARRE SUPÉRIEURE */}
      <div className="demande-top-bar">
        <h1>DRETFP - Espace Éléve & Apprenant</h1>
        <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', marginRight: '-60%', marginTop: '1rem', cursor: 'pointer', background: 'none', border: '1px solid #ccc', padding: '4px 15px', borderRadius: '4px' }}>← Retour</button>

        <button className="btn-table-action" onClick={() => window.location.href = '/login'}>Déconnexion</button>
      </div>

      {/* CONTENU EN PLEIN ÉCRAN */}
      <div className="demande-content">
        
        {/* COLONNE GAUCHE : FORMULAIRE OMNICANAL */}
        <div className="demande-form-section">
          <h2 className="form-title">Créer une nouvelle demande</h2>
          
          {message.text && <div className={`status-alert ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit} className="demande-form">
            <div className="form-group">
              <label>Document souhaité</label>
              <select value={typeDocument} onChange={(e) => setTypeDocument(e.target.value)}>
                <option value="ATTESTATION">📜 Attestation de Réussite </option>
                <option value="DIPLOME">🎓 Diplôme</option>
              </select>
            </div>

            <div className="form-group">
              <label>Numéro de Matricule d'Examen</label>
              <input 
                type="text" 
                value={matricule} 
                onChange={(e) => setMatricule(e.target.value)} 
                placeholder="Ex: MAT-2025-089" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Année de Session</label>
              <input 
                type="number" 
                value={anneeSession} 
                onChange={(e) => setAnneeSession(e.target.value)} 
                placeholder="Ex: 2025" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Pièce justificative (Fiche de table ou d'identité)</label>
              <input type="file" onChange={handleFileChange} required />
            </div>

            <button type="submit" className="btn-submit-demande" disabled={loading}>
              {loading ? 'Envoi...' : 'Soumettre ma demande en ligne'}
            </button>
          </form>
        </div>

        {/* COLONNE DROITE : SUIVI DES STATUTS */}
        <div className="demande-history-section">
          <h2 className="form-title">Suivi de mes demandes de titres</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Session</th>
                <th>Date de dépôt</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {mesDemandes.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.session}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`status-badge ${item.statut.toLowerCase()}`}>
                      {item.statut === 'EN_ATTENTE' ? 'En attente' : 'Prêt / Validé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DemandeClient;
