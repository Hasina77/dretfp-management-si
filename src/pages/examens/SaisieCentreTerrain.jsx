import React, { useState } from 'react';
import axios from 'axios';
import './SaisieNotes.css';

const SaisieCentreTerrain = () => {
  const centreAffecte = localStorage.getItem('chef_centre_etablissement') || 'Lycée Technique Fianarantsoa';
  
  // États du formulaire conformes à la table apprenants du bureau central
  const [immatriculation, setImmatriculation] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaiss, setDateNaiss] = useState('');
  const [lieuNaiss, setLieuNaiss] = useState('');
  const [examen, setExamen] = useState('CAP');
  const [filiere, setFiliere] = useState('Génie Logiciel');
  const [mention, setMention] = useState('Passable');

  const [listeSaisieCentre, setListeSaisieCentre] = useState([]);
  const [status, setStatus] = useState({ type: '', text: '' });

  const ajouterAuLotLocal = (e) => {
    e.preventDefault();
    const nouvelApprenant = {
      im_apprenant: parseInt(immatriculation),
      nom_apprenant: nom.toUpperCase(),
      prenom_apprenant: prenom,
      date_naiss: dateNaiss,
      lieu_naiss: lieuNaiss,
      examen_id: examen,
      etablissement_id: centreAffecte,
      filiere_id: filiere,
      session: 2026,
      mention: mention,
      progression: 'AUCUNE_DEMANDE'
    };

    if (listeSaisieCentre.some(item => item.im_apprenant === nouvelApprenant.im_apprenant)) {
      alert("⚠️ Matricule déjà encodé dans votre session de saisie courante.");
      return;
    }

    setListeSaisieCentre([...listeSaisieCentre, nouvelApprenant]);
    setImmatriculation(''); setNom(''); setPrenom('');
    setStatus({ type: 'info', text: 'Candidat ajouté au panier terrain.' });
  };

  const transmettreAuBureauCentral = async () => {
    if (listeSaisieCentre.length === 0) return;
    setStatus({ type: 'info', text: 'Transmission chiffrée vers la DRETFP en cours...' });

    try {
      // 🚀 Requête directe traversant le serveur Localtunnel avec le Header anti-reminder page
      await axios.post('https://loca.lt', 
        { apprenants: listeSaisieCentre },
        { headers: { 'Bypass-Tunnel-Reminder': 'true' } }
      );

      alert(`✅ Synchronisation réussie ! ${listeSaisieCentre.length} fiches enregistrées en BDD.`);
      setListeSaisieCentre([]);
      setStatus({ type: 'success', text: 'Traitement validé par le Responsable des Données.' });
    } catch (err) {
      setStatus({ type: 'error', text: '📡 Erreur réseau : Les fiches restent conservées localement dans votre navigateur.' });
    }
  };

  return (
    <div className="exam-container" style={{ padding: '1.5rem', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1100px', background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* En-tête sans Sidebar administrative */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #002f6c', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#002f6c', margin: 0, fontSize: '1.6rem' }}>Portail Terrain — {centreAffecte}</h1>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>Saisie sécurisée des Procès-Verbaux d'Examen (PV)</p>
          </div>
          <button className="btn-action-top" style={{ backgroundColor: '#c5221f' }} onClick={() => { localStorage.clear(); window.location.href = '/portail-terrain'; }}>
            🚪 Quitter la session
          </button>
        </div>

        {status.text && <div className={`status-alert ${status.type}`} style={{ padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 600, backgroundColor: status.type === 'success' ? '#e6f4ea' : '#fce8e6', color: status.type === 'success' ? '#137333' : '#c5221f' }}>{status.text}</div>}

        <form onSubmit={ajouterAuLotLocal} className="chef-centre-form-grid" style={{ background: '#f8f9fa', border: 'none' }}>
          <div className="input-field-block"><label>N° IM (Matricule)</label><input type="number" value={immatriculation} onChange={(e) => setImmatriculation(e.target.value)} required /></div>
          <div className="input-field-block"><label>Nom de Famille</label><input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required /></div>
          <div className="input-field-block"><label>Prénoms</label><input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required /></div>
          <div className="input-field-block"><label>Date de Naissance</label><input type="text" value={dateNaiss} onChange={(e) => setDateNaiss(e.target.value)} placeholder="JJ/MM/AAAA" required /></div>
          <div className="input-field-block"><label>Lieu de Naissance</label><input type="text" value={lieuNaiss} onChange={(e) => setLieuNaiss(e.target.value)} required /></div>
          <div className="input-field-block">
            <label>Examen National</label>
            <select value={examen} onChange={(e) => setExamen(e.target.value)}><option value="CAP">CAP</option><option value="BEP">BEP</option><option value="BT">BT</option></select>
          </div>
          <div className="input-field-block">
            <label>Filière Technique</label>
            <select value={filiere} onChange={(e) => setFiliere(e.target.value)}><option value="Génie Logiciel">Génie Logiciel</option><option value="Ouvrage Bois">Ouvrage Bois</option><option value="Électricité">Électricité</option></select>
          </div>
          <div className="input-field-block">
            <label>Mention Attribuée</label>
            <select value={mention} onChange={(e) => setMention(e.target.value)}><option value="Passable">Passable</option><option value="Assez Bien">Assez Bien</option><option value="Bien">Bien</option><option value="Très Bien">Très Bien</option></select>
          </div>
          <div className="input-field-block" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-action-top" style={{ width: '100%', height: '40px' }}>+ Ajouter au lot</button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2.5rem 0 1rem 0' }}>
          <h3 style={{ margin: 0 }}>Aperçu du lot courant de session ({listeSaisieCentre.length})</h3>
          <button className="btn-action-top" style={{ backgroundColor: '#137333' }} onClick={transmettreAuBureauCentral} disabled={listeSaisieCentre.length === 0}>
            🚀 Transmettre directement au Bureau Central
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr><th>N° IM</th><th>Nom & Prénoms</th><th>Examen Saisi</th><th>Établissement Fixé</th><th>Filière</th><th>Mention</th></tr>
            </thead>
            <tbody>
              {listeSaisieCentre.length === 0 ? (
                <tr><td colSpan="6" className="no-entries">Aucun candidat encodé dans le lot courant.</td></tr>
              ) : (
                listeSaisieCentre.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.im_apprenant}</strong></td>
                    <td>{item.nom_apprenant} {item.prenom_apprenant}</td>
                    <td>{item.examen_id} (2026)</td>
                    <td>{item.etablissement_id}</td>
                    <td>{item.filiere_id}</td>
                    <td><em style={{ fontWeight: 500, color: '#002f6c' }}>{item.mention}</em></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default SaisieCentreTerrain;
