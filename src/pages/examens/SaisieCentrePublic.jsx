import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './SaisieNotes.css'; // Réutilise les mêmes styles propres

const SaisieCentrePublic = () => {
  // Données du formulaire du Chef de Centre
  const [immatriculation, setImmatriculation] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaiss, setDateNaiss] = useState('');
  const [lieuNaiss, setLieuNaiss] = useState('');
  const [examen, setExamen] = useState('CAP');
  const [etablissement, setEtablissement] = useState('Lycée Technique Fianarantsoa');
  const [filiere, setFiliere] = useState('Génie Logiciel');
  const [metier, setMetier] = useState('Développeur');
  const [session, setSession] = useState(2026);
  const [mention, setMention] = useState('Passable');

  const [listeSaisieCentre, setListeSaisieCentre] = useState([]);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const ajouterApprenantLocal = (e) => {
    e.preventDefault();
    const nouvelApprenant = {
      id_apprenant: Date.now(),
      im_apprenant: parseInt(immatriculation),
      nom_apprenant: nom.toUpperCase(),
      prenom_apprenant: prenom,
      date_naiss: dateNaiss,
      lieu_naiss: lieuNaiss,
      examen_id: examen,
      etablissement_id: etablissement,
      secteur_id: 'Industriel',
      filiere_id: filiere,
      metier_id: metier,
      session: parseInt(session),
      mention: mention,
      progression: 'AUCUNE_DEMANDE'
    };
    setListeSaisieCentre([...listeSaisieCentre, nouvelApprenant]);
    setImmatriculation(''); setNom(''); setPrenom('');
  };
  
  const navigate = useNavigate();
  
  // 🔒 VÉRIFICATION DE SÉCURITÉ DE NIVEAU MASTER 2
  const token = localStorage.getItem('dretfp_token');
  const centreAffecte = localStorage.getItem('chef_centre_etablissement') || 'Lycée Technique Fianarantsoa';

  if (!token) {
    // Si le chef de centre n'est pas connecté, on le renvoie immédiatement au Login public
    window.location.href = '/portail-terrain';
    return null;
  }

  const envoyerAuBureauCentral = async () => {
    if (listeSaisieCentre.length === 0) return;
    setStatus({ type: 'info', msg: 'Transmission en cours...' });

    try {
      // Appel direct de l'URL du serveur central (sans intercepteur JWT car la page est publique)
      await axios.post('http://localhost:8000/api/apprenants/import-bulk', { apprenants: listeSaisieCentre });
      setStatus({ type: 'success', msg: `🚀 Données transmises ! ${listeSaisieCentre.length} fiches envoyées avec succès au bureau central de la DRETFP.` });
      setListeSaisieCentre([]);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Échec de transmission. Le serveur du bureau est injoignable.' });
    }
  };

  return (
    <div className="exam-container" style={{ justifyContent: 'center', padding: '2rem' }}>
      <div className="main-content" style={{ maxWidth: '1000px', background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #002f6c', paddingBottom: '1rem' }}>
          <h1 style={{ color: '#002f6c', margin: 0 }}>DRETFP — Formulaire Terrain Chef de Centre</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Saisie décentralisée et transmission directe des candidats</p>
        </div>

        {status.msg && (
          <div className={`status-alert ${status.type}`} style={{ padding: '1rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: '600', backgroundColor: status.type === 'success' ? '#e6f4ea' : '#fce8e6', color: status.type === 'success' ? '#137333' : '#c5221f' }}>
            {status.msg}
          </div>
        )}

        {/* Formulaire de saisie */}
        <form onSubmit={ajouterApprenantLocal} className="chef-centre-form-grid">
          <div className="input-field-block"><label>N° IM (Matricule)</label><input type="number" value={immatriculation} onChange={(e) => setImmatriculation(e.target.value)} required /></div>
          <div className="input-field-block"><label>Nom</label><input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required /></div>
          <div className="input-field-block"><label>Prénoms</label><input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required /></div>
          <div className="input-field-block"><label>Date de Naissance</label><input type="text" value={dateNaiss} onChange={(e) => setDateNaiss(e.target.value)} placeholder="JJ/MM/AAAA" required /></div>
          <div className="input-field-block"><label>Lieu de Naissance</label><input type="text" value={lieuNaiss} onChange={(e) => setLieuNaiss(e.target.value)} required /></div>
          <div className="input-field-block">
            <label>Centre / Établissement</label>
            <select value={etablissement} onChange={(e) => setEtablissement(e.target.value)}>
              <option value="Lycée Technique Fianarantsoa">Lycée Technique Fianarantsoa</option>
              <option value="CFP Ambalavao">CFP Ambalavao</option>
            </select>
          </div>
          <div className="input-field-block">
            <label>Examen</label>
            <select value={examen} onChange={(e) => setExamen(e.target.value)}><option value="CAP">CAP</option><option value="BEP">BEP</option><option value="BT">BT</option></select>
          </div>
          <div className="input-field-block">
            <label>Filière</label>
            <select value={filiere} onChange={(e) => setFiliere(e.target.value)}><option value="Génie Logiciel">Génie Logiciel</option><option value="Ouvrage Bois">Ouvrage Bois</option><option value="Électricité">Électricité</option></select>
          </div>
          <div className="input-field-block">
            <label>Mention</label>
            <select value={mention} onChange={(e) => setMention(e.target.value)}><option value="Passable">Passable</option><option value="Assez Bien">Assez Bien</option><option value="Bien">Bien</option><option value="Très Bien">Très Bien</option></select>
          </div>
          <div className="input-field-block" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-action-top" style={{ width: '100%', height: '42px' }}>+ Ajouter l'apprenant</button>
          </div>
        </form>

        {/* Boutons d'envoi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
          <h3>Liste des apprenants saisis ({listeSaisieCentre.length})</h3>
          <button className="btn-action-top" style={{ backgroundColor: '#137333' }} onClick={envoyerAuBureauCentral} disabled={listeSaisieCentre.length === 0}>
            🚀 Transmettre le lot au Bureau Central
          </button>
        </div>

        {/* Tableau récapitulatif */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr><th>N° IM</th><th>Nom & Prénoms</th><th>Examen</th><th>Établissement & Filière</th><th>Mention</th></tr>
            </thead>
            <tbody>
              {listeSaisieCentre.length === 0 ? (
                <tr><td colSpan="5" className="no-entries">Aucun candidat dans le lot actuel.</td></tr>
              ) : (
                listeSaisieCentre.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.im_apprenant}</strong></td>
                    <td>{item.nom_apprenant} {item.prenom_apprenant}</td>
                    <td>{item.examen_id} ({item.session})</td>
                    <td>{item.etablissement_id} <br/><small style={{ color: '#666' }}>{item.filiere_id}</small></td>
                    <td><em>{item.mention}</em></td>
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

export default SaisieCentrePublic;
