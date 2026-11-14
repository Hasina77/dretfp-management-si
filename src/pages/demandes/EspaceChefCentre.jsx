import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const EspaceChefCentre = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [modeSaisie, setModeSaisie] = useState(''); 
  const [listeApprenants, setListeApprenants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [listeEtablissements, setListeEtablissements] = useState([]);
  const [listeSecteurs, setListeSecteurs] = useState([]);
  const [listeFilieres, setListeFilieres] = useState([]);
  const [listeMetiers, setListeMetiers] = useState([]);
  const [listeExamens, setListeExamens] = useState([]);

  const idEtablissementChef = localStorage.getItem('centre_affectation'); 
  const userRole = localStorage.getItem('user_role');
  const token = localStorage.getItem('dretfp_token');

  useEffect(() => {
    if (!token) {
      alert("🔒 Accès refusé : Veuillez vous connecter pour accéder à l'espace Chef de Centre.");
      navigate('/login');
      return;
    }
    if (userRole !== 'AGENT_CENTRE' && userRole !== 'ADMIN_DRETFP') {
      alert("⚠️ Droits insuffisants : Cet espace est strictement réservé aux Chefs de Centre officiels.");
      navigate('/login');
      return;
    }
    setIsAuthorized(true);
  }, [token, userRole, navigate]);

  const chargerNomenclatures = async () => {
    try {
      const [resEtab, resSecteurs, resFilieres, resMetiers, resExamens] = await Promise.all([
        API.get('/etablissements/liste'),
        API.get('/secteurs/liste'),
        API.get('/filieres/liste'),
        API.get('/metiers/liste'),
        API.get('/examens/liste')
      ]);
      setListeEtablissements(resEtab.data || []);
      setListeSecteurs(resSecteurs.data || []);
      setListeFilieres(resFilieres.data || []);
      setListeMetiers(resMetiers.data || []);
      setListeExamens(resExamens.data || []);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des nomenclatures depuis MySQL :", err);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      chargerNomenclatures();
    }
  }, [isAuthorized]);

  const handleLectureExcel = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const feuille = workbook.Sheets[workbook.SheetNames[0]];
      const lignes = XLSX.utils.sheet_to_json(feuille);
      
      const lignesFormatees = lignes.map(row => ({
        ...row,
        etablissement_id: parseInt(idEtablissementChef, 10),
        progression: "EN_ATTENTE_VALIDATION" 
      }));
      setListeApprenants(lignesFormatees);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTransmettreADistance = async () => {
    if (listeApprenants.length === 0) {
      alert("⚠️ Votre liste est vide. Veuillez saisir des données avant d'envoyer.");
      return;
    }
    setLoading(true);
    try {
      await API.post('/apprenants/import-bulk', { apprenants: listeApprenants });
      alert("🚀 Succès ! Les fiches candidats ont été transmises à distance. En attente de validation par l'administration.");
      setListeApprenants([]);
      setModeSaisie('');
    } catch (err) {
      alert("❌ Échec de transmission. Vérifiez la connexion avec la DRETFP.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: "'Poppins', sans-serif", backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', color: '#002f6c' }}>
          <h3>🔒 Vérification des privilèges de sécurité en cours...</h3>
        </div>
      </div>
    );
  }


  // --- GESTIONNAIRE DE SYNCHRONISATION HORS-LIGNE ---
  const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [fileAttente, setFileAttente] = useState(() => {
      const saved = localStorage.getItem('dretfp_offline_queue');
      return saved ? JSON.parse(saved) : [];
    });
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    const sauvegarderHorsLigne = (endpoint, payload, description) => {
      const nouvelItem = {
        id: Date.now(),
        date: new Date().toLocaleString('fr-FR'),
        endpoint,
        payload,
        description
      };
      const nouvelleFile = [...fileAttente, nouvelItem];
      setFileAttente(nouvelleFile);
      localStorage.setItem('dretfp_offline_queue', JSON.stringify(nouvelleFile));
    };

    const synchroniserMaintenant = async () => {
      if (!navigator.onLine) {
        alert("📡 Toujours hors-ligne. Connectez-vous à internet pour synchroniser.");
        return;
      }
      if (fileAttente.length === 0) return;

      setIsSyncing(true);
      const restants = [];

      for (const item of fileAttente) {
        try {
          await API.post(item.endpoint, item.payload);
        } catch (err) {
          console.error("Échec sync item :", item.id, err);
          restants.push(item);
        }
      }

      setFileAttente(restants);
      localStorage.setItem('dretfp_offline_queue', JSON.stringify(restants));
      setIsSyncing(false);

      if (restants.length === 0) {
        alert("✅ Toutes les données saisies hors-ligne ont été transmises à la DRETFP !");
      } else {
        alert(`⚠️ ${restants.length} lot(s) n'ont pas pu être envoyés. Réessayez plus tard.`);
      }
    };

    return { isOnline, fileAttente, isSyncing, sauvegarderHorsLigne, synchroniserMaintenant };
  };


  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ backgroundColor: '#002f6c', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <h2>🏛️ Portail de Saisie Décentralisé — Chef de Centre</h2>
        <p>Session d'Examen — Transmission sécurisée des fiches candidats vers la DRETFP centrale</p>
      </div>


      {/* DANS LE RENDU DE EspaceChefCentre.jsx */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', borderRadius: '6px', marginBottom: '15px',
        backgroundColor: isOnline ? '#e6f4ea' : '#fef7e0',
        border: `1px solid ${isOnline ? '#ceead6' : '#fde293'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: '600', color: isOnline ? '#137333' : '#b06000' }}>
          <span>{isOnline ? '🟢 Connecté au serveur DRETFP' : '🟠 Mode Hors-Ligne actif (Saisie locale sécurisée)'}</span>
          {fileAttente.length > 0 && (
            <span style={{ backgroundColor: '#c5221f', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
              {fileAttente.length} envoi(s) en attente
            </span>
          )}
        </div>

        {fileAttente.length > 0 && (
          <button
            type="button"
            onClick={synchroniserMaintenant}
            disabled={!isOnline || isSyncing}
            style={{
              backgroundColor: isOnline ? '#1a73e8' : '#9aa0a6',
              color: '#fff', border: 'none', borderRadius: '4px',
              padding: '6px 14px', fontWeight: 'bold', cursor: isOnline ? 'pointer' : 'not-allowed'
            }}
          >
            {isSyncing ? 'Synchronisation...' : '🔄 Synchroniser maintenant'}
          </button>
        )}
      </div>


      {modeSaisie === '' && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            type="button"
            onClick={() => setModeSaisie('manuel')}
            style={{ padding: '25px', width: '250px', backgroundColor: '#ffffff', border: '2px solid #1a73e8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#1a73e8', fontSize: '1rem' }}
          >
            ✍️ Saisie manuelle des apprenants
          </button>
          
          <button 
            type="button"
            onClick={() => setModeSaisie('excel')}
            style={{ padding: '25px', width: '250px', backgroundColor: '#ffffff', border: '2px solid #34a853', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#34a853', fontSize: '1rem' }}
          >
            📊 Importer un fichier Excel complet
          </button>
        </div>
      )}

      {modeSaisie === 'excel' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0' }}>
          <h3>📥 Chargement du fichier du centre</h3>
          <input type="file" accept=".xlsx, .xls" onChange={handleLectureExcel} style={{ marginBottom: '20px' }} />
          
          {listeApprenants.length > 0 && (
            <div>
              <p style={{ color: '#137333', fontWeight: '600' }}>✅ {listeApprenants.length} ligne(s) détectée(s) prête(s) à l'envoi.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => { setModeSaisie(''); setListeApprenants([]); }} style={{ padding: '10px 15px', background: '#f1f3f4', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button type="button" onClick={handleTransmettreADistance} disabled={loading} style={{ padding: '10px 20px', background: '#002f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? "Envoi distant..." : "📤 Valider l'envoi vers l'Admin"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {modeSaisie === 'manuel' && (
        <div style={{ animation: 'scaleUpModal 0.2s ease-out' }}>
          
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#002f6c', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              ✍️ Ajouter un candidat manuellement
            </h3>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const imSaisi = form.matricule.value.trim().toUpperCase();

                let structureValide = true;
                if (imSaisi.length !== 12) {
                  structureValide = false;
                } else if (imSaisi.charAt(3) !== '-' || imSaisi.charAt(8) !== '-') {
                  structureValide = false;
                } else {
                  const milieu = imSaisi.substring(4, 8);
                  if (isNaN(milieu) || milieu.includes(' ')) structureValide = false;
                }

                if (!structureValide) {
                  alert(`🚨 Format non conforme :\nLe numéro matricule "${imSaisi}" est invalide.\nStructure obligatoire : XXX-0000-XXX (Ex: 1CF-0002-BEP).`);
                  return;
                }

                const doublonLocal = listeApprenants.some(app => app.im_apprenant === imSaisi);
                if (doublonLocal) {
                  alert("⚠️ Ce numéro matricule est déjà présent dans votre liste temporaire.");
                  return;
                }

                const nouvelApprenant = {
                  im_apprenant: imSaisi,
                  nom_apprenant: form.nom.value.trim().toUpperCase(),
                  prenom_apprenant: form.prenom.value.trim(),
                  date_naiss: form.date_naiss.value,
                  lieu_naiss: form.lieu_naiss.value.trim().toUpperCase(),
                  examen_id: parseInt(form.examen.value, 10),
                  session: parseInt(form.session.value, 10) || 2026,
                  etablissement_id: parseInt(form.etablissement.value, 10),
                  secteur_id: parseInt(form.secteur.value, 10),
                  filiere_id: parseInt(form.filiere.value, 10),
                  metier_id: parseInt(form.metier.value, 10),
                  mention: form.mention.value,
                  progression: "EN_ATTENTE_VALIDATION"
                };

                setListeApprenants([...listeApprenants, nouvelApprenant]);
                form.reset();
                form.session.value = "2026";
                if(idEtablissementChef) form.etablissement.value = idEtablissementChef;
              }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>N° IM (Matricule) * :</label>
                <input name="matricule" type="text" required placeholder="Ex: 1CF-0002-BEP" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Nom * :</label>
                <input name="nom" type="text" required placeholder="Ex: RAKOTO" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Prénoms :</label>
                <input name="prenom" type="text" placeholder="Ex: Jean Michel" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Date de naissance * :</label>
                <input name="date_naiss" type="date" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Lieu de naissance * :</label>
                <input name="lieu_naiss" type="text" required placeholder="Ex: AMBOSITRA" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Examen * :</label>
                <select name="examen" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', backgroundColor: '#fff' }}>
                  <option value="">-- Sélectionner Examen --</option>
                  {listeExamens.map(ex => (
                    <option key={ex.id_examen ?? ex.id} value={ex.id_examen ?? ex.id}>{ex.nom_exam || ex.nom_examen}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Session (Année) * :</label>
                <input name="session" type="number" defaultValue="2026" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Établissement de rattachement * :</label>
                <select name="etablissement" defaultValue={idEtablissementChef || ""} required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', backgroundColor: '#fff', fontWeight: '600' }}>
                  <option value="">-- Sélectionner l'Établissement --</option>
                  {listeEtablissements.map(e => (
                    <option key={e.id_centre ?? e.id_etablissement ?? e.id} value={e.id_centre ?? e.id_etablissement ?? e.id}>
                      {e.nom_etablissement}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Secteur d'activité * :</label>
                <select name="secteur" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', backgroundColor: '#fff' }}>
                  <option value="">-- Sélectionner Secteur --</option>
                  {listeSecteurs.map(s => (
                    <option key={s.id_secteur ?? s.id} value={s.id_secteur ?? s.id}>{s.nom_secteur}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Filière d'enseignement * :</label>
                <select name="filiere" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', backgroundColor: '#fff' }}>
                  <option value="">-- Sélectionner Filière --</option>
                  {listeFilieres.map(f => (
                    <option key={f.id_filiere ?? f.id} value={f.id_filiere ?? f.id}>{f.nom_filiere}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Métier / Spécialité * :</label>
                <select name="metier" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', backgroundColor: '#fff' }}>
                  <option value="">-- Sélectionner Métier --</option>
                  {listeMetiers.map(m => (
                    <option key={m.id_metier ?? m.id} value={m.id_metier ?? m.id}>{m.nom_metier}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>Mention obtenue * :</label>
                <select name="mention" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', backgroundColor: '#fff' }}>
                  <option value="Passable">Passable</option>
                  <option value="Assez Bien">Assez Bien</option>
                  <option value="Bien">Bien</option>
                  <option value="Très Bien">Très Bien</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  style={{ height: '42px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '0.92rem', boxShadow: '0 2px 4px rgba(26,115,232,0.15)' }}
                >
                  ➕ Insérer l'apprenant dans la liste temporaire
                </button>
              </div>
            </form>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>
                📋 Tableau récapitulatif avant transmission ({listeApprenants ? listeApprenants.length : 0} apprenant(s))
              </h4>
              <button 
                type="button" 
                onClick={() => { setListeApprenants([]); setModeSaisie(''); }}
                style={{ background: '#f1f3f4', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                Fermer ×
              </button>
            </div>

            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Matricule (IM)</th>
                  <th>Nom & Prénoms</th>
                  <th>Date & Lieu Naissance</th>
                  <th>Examen & Session</th>
                  <th>Mention</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
                            <tbody>
                {!listeApprenants || listeApprenants.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#70757a', fontStyle: 'italic' }}>
                      📭 Aucun candidat saisi pour le moment. Remplissez le formulaire ci-dessus.
                    </td>
                  </tr>
                ) : (
                  listeApprenants.map((app, index) => (
                    <tr key={index}>
                      <td><strong>{app.im_apprenant}</strong></td>
                      <td>{app.nom_apprenant} {app.prenom_apprenant || ""}</td>
                      <td>{app.date_naiss} à {app.lieu_naiss}</td>
                      <td>
                        {(() => {
                          const exObj = listeExamens.find(e => (e.id_examen ?? e.id)?.toString() === app.examen_id?.toString());
                          return exObj ? (exObj.nom_exam || exObj.nom_examen) : "CAP";
                        })()} ({app.session})
                      </td>
                      <td><em style={{ color: '#1a73e8', fontWeight: '600' }}>{app.mention}</em></td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setListeApprenants(listeApprenants.filter((_, i) => i !== index))}
                          style={{ background: 'none', border: 'none', color: '#d93025', cursor: 'pointer', fontSize: '1.1rem' }}
                          title="Retirer cet élève"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {listeApprenants && listeApprenants.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <button 
                  type="button" 
                  onClick={() => { if (window.confirm("⚠️ Voulez-vous vider toute la liste saisie ?")) setListeApprenants([]); }}
                  style={{ padding: '10px 15px', background: '#f1f3f4', color: '#3c4043', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Vider la liste
                </button>
                <button 
                  type="button" 
                  onClick={handleTransmettreADistance}
                  disabled={loading}
                  style={{ padding: '10px 25px', background: '#002f6c', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,47,108,0.2)' }}
                >
                  {loading ? "Envoi distant..." : "📤 Transmettre la liste à l'Admin"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EspaceChefCentre;
