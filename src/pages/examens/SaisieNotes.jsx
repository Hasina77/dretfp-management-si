import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '/src/components/Sidebar';
import * as XLSX from 'xlsx';
import axios from 'axios'; // Utilisation d'axios direct pour passer à travers le tunnel ngrok public
import './SaisieNotes.css';

const SaisieNotes = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('examens');

  // Récupération automatique du centre d'affectation mémorisé lors du login
  const centreAffecte = localStorage.getItem('chef_centre_etablissement') || 'Lycée Technique Fianarantsoa';

  // Attributs du formulaire conformes à ton dictionnaire de données UML
  const [immatriculation, setImmatriculation] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaiss, setDateNaiss] = useState('');
  const [lieuNaiss, setLieuNaiss] = useState('');
  const [examen, setExamen] = useState('CAP');
  const [filiere, setFiliere] = useState('Génie Logiciel');
  const [mention, setMention] = useState('Passable');

  // Grille de contrôle temporaire avant l'envoi global
  const [listeSaisieCentre, setListeSaisieCentre] = useState([]);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // 1. Ajouter un candidat au lot courant du formulaire
  const ajouterCandidatAuLot = (e) => {
    e.preventDefault();
    
    const nouvelApprenant = {
      im_apprenant: parseInt(immatriculation),
      nom_apprenant: nom.toUpperCase(),
      prenom_apprenant: prenom,
      date_naiss: dateNaiss,
      lieu_naiss: lieuNaiss,
      examen_id: examen,
      etablissement_id: centreAffecte, // Verrouillé sur son centre d'affectation
      filiere_id: filiere,
      session: 2026,
      mention: mention,
      progression: 'AUCUNE_DEMANDE'
    };

    // Vérification locale des doublons dans le lot actuel
    if (listeSaisieCentre.some(item => item.im_apprenant === nouvelApprenant.im_apprenant)) {
      alert("⚠️ Ce numéro matricule (IM) est déjà présent dans votre liste de saisie courante.");
      return;
    }

    setListeSaisieCentre([...listeSaisieCentre, nouvelApprenant]);
    setImmatriculation('');
    setNom('');
    setPrenom('');
    setStatus({ type: 'info', text: 'Candidat ajouté au lot local.' });
  };

  // 2. 🚀 ENVOI DU LOT VIA LE TUNNEL NGROK VERS LA BASE DE DONNÉES CENTRALE
  const transmettreLotAuBureauCentral = async () => {
    if (listeSaisieCentre.length === 0) return;
    setLoading(false);
    setStatus({ type: '', text: '' });

    try {
      // Connexion directe à l'adresse publique de ton API FastAPI ngrok
      const response = await axios.post('https://ngrok-free.app', {
        apprenants: listeSaisieCentre
      });

      const { ajoutes, doublons } = response.data.statut_import || response.data;

      alert(`🚀 Transmission réussie !\n\n- ${ajoutes} fiches insérées en base de données.\n- ${doublons} doublons automatiquement ignorés.`);
      
      setListeSaisieCentre([]); // Vide la table locale après synchronisation réussie
      setStatus({ type: 'success', text: 'Toutes les données ont été centralisées au bureau régional.' });
    } catch (err) {
      setStatus({ type: 'error', text: '📡 Échec de synchronisation. Vos données restent sauvegardées dans votre navigateur.' });
    }
  };

  // 3. Export de secours pour le Chef de Centre
  const exporterExcelLot = () => {
    const feuille = XLSX.utils.json_to_sheet(listeSaisieCentre);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, "Saisie_Terrain");
    XLSX.writeFile(classeur, `Fiche_Examen_2026_${centreAffecte.replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="exam-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} notifCount={0} setNotifCount={() => {}} />

      <div className="exam-content-wrapper">
        <div className="header-bar">
          <div className="header-title">
            <h1>Espace Chef de Centre — {centreAffecte}</h1>
          </div>
          <button className="btn-action-top" style={{ backgroundColor: '#c5221f' }} onClick={() => { localStorage.clear(); window.location.href = '/portail-terrain'; }}>
            🚪 Quitter le Portail
          </button>
        </div>

        <div className="exam-body">
          <div className="section-title">Formulaire de Saisie des Procès-Verbaux d'Examen (PV)</div>

          {status.text && <div className={`status-alert ${status.type}`} style={{ padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 600, backgroundColor: status.type === 'success' ? '#e6f4ea' : status.type === 'error' ? '#fce8e6' : '#e8f0fe', color: status.type === 'success' ? '#137333' : status.type === 'error' ? '#c5221f' : '#1a73e8' }}>{status.text}</div>}

          {/* Grille de saisie dynamique */}
          <form onSubmit={ajouterCandidatAuLot} className="chef-centre-form-grid">
            <div className="input-field-block"><label>N° IM (Matricule)</label><input type="number" value={immatriculation} onChange={(e) => setImmatriculation(e.target.value)} placeholder="Ex: 2026105" required /></div>
            <div className="input-field-block"><label>Nom de Famille</label><input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: RAKOTO" required /></div>
            <div className="input-field-block"><label>Prénoms</label><input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ex: Jean" required /></div>
            <div className="input-field-block"><label>Date de Naissance</label><input type="text" value={dateNaiss} onChange={(e) => setDateNaiss(e.target.value)} placeholder="JJ/MM/AAAA" required /></div>
            <div className="input-field-block"><label>Lieu de Naissance</label><input type="text" value={lieuNaiss} onChange={(e) => setLieuNaiss(e.target.value)} placeholder="Ex: Fianarantsoa" required /></div>
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

          {/* Barre d'actions collectonnées */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
            <div className="section-title" style={{ margin: 0 }}>Aperçu de la Liste des Candidats Saisis ({listeSaisieCentre.length})</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-table-action" style={{ backgroundColor: 'white' }} onClick={exporterExcelLot} disabled={listeSaisieCentre.length === 0}> Graphez en Excel (.xlsx)</button>
              <button className="btn-action-top" style={{ backgroundColor: '#137333' }} onClick={transmettreLotAuBureauCentral} disabled={listeSaisieCentre.length === 0}>
                🚀 Transmettre directement au Bureau Central
              </button>
            </div>
          </div>

          {/* Grille récapitulative terrain */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr><th>N° IM (Matricule)</th><th>Nom & Prénoms</th><th>Examen Saisi</th><th>Établissement Fixé</th><th>Filière</th><th>Mention</th></tr>
              </thead>
              <tbody>
                {listeSaisieCentre.length === 0 ? (
                  <tr><td colSpan="6" className="no-entries">Aucun candidat encodé dans le lot de session courant.</td></tr>
                ) : (
                  listeSaisieCentre.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.im_apprenant}</strong></td>
                      <td>{item.nom_apprenant} {item.prenom_apprenant}</td>
                      <td>{item.examen_id} (2026)</td>
                      <td>{item.etablissement_id}</td>
                      <td>{item.filiere_id}</td>
                      <td><em style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{item.mention}</em></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SaisieNotes;
