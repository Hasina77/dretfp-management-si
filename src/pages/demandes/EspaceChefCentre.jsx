import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import * as XLSX from 'xlsx';
import logoDretfp from '/src/assets/images/logo.jpeg';

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

  const [fichierDocument, setFichierDocument] = useState(null);
  const [envoiDocLoading, setEnvoiDocLoading] = useState(false);
  const [mesDocumentsEnvoyes, setMesDocumentsEnvoyes] = useState([]);

  const idEtabConnecte = localStorage.getItem('centre_affectation') || localStorage.getItem('id_etablissement') || '';
  const usernameChefConnecte = localStorage.getItem('user_username') || localStorage.getItem('username') || 'chef_terrain';

  const chargerMesDocuments = async () => {
    if (!idEtabConnecte) return;
    try {
      const res = await API.get(`/chefs-centre/documents/${idEtabConnecte}`);
      setMesDocumentsEnvoyes(res.data || []);
    } catch (err) {
      console.error("Erreur chargement de mes documents :", err);
    }
  };

    useEffect(() => {
      chargerMesDocuments();
    }, [idEtabConnecte]);

  const handleEnvoyerDocumentOfficiel = async (e) => {
    e.preventDefault();
    if (!fichierDocument) {
      alert("⚠️ Veuillez sélectionner un fichier (Excel, Word ou PDF) avant d'envoyer.");
      return;
    }

    const idEtabNum = parseInt(idEtabConnecte, 10);
    if (isNaN(idEtabNum) || idEtabNum <= 0) {
      alert("❌ Identifiant d'établissement introuvable ou invalide. Veuillez vous déconnecter et vous reconnecter.");
      return;
    }

    setEnvoiDocLoading(true);
    const formData = new FormData();
    formData.append('id_etablissement', idEtabNum.toString());
    formData.append('chef_username', usernameChefConnecte || 'chef_terrain');
    formData.append('fichier', fichierDocument);

    try {
      await API.post('/chefs-centre/envoyer-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(`✅ Le document "${fichierDocument.name}" a été transmis avec succès à la DRETFP !`);
      setFichierDocument(null);
      e.target.reset();
      chargerMesDocuments();
    } catch (err) {
      console.error("Erreur détaillée lors de l'envoi :", err.response?.data || err);
      
      const detailErreur = err.response?.data?.detail;
      let messageAffiche = "❌ Échec de l'envoi du document.";

      if (typeof detailErreur === 'string') {
        messageAffiche = detailErreur;
      } else if (Array.isArray(detailErreur)) {
        messageAffiche = detailErreur.map((d) => `${d.loc?.join('.')} : ${d.msg}`).join('\n');
      }

      alert(messageAffiche);
    } finally {
      setEnvoiDocLoading(false);
    }
  };


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

  const handleDeconnexionChef = async () => {
  const usernameActuel = localStorage.getItem('user_username') || localStorage.getItem('username');
  
  if (!window.confirm("Voulez-vous vraiment vous déconnecter du portail Chef de Centre ?")) {
    return;
  }

  try {
    if (usernameActuel) {
      await API.post('/chefs-centre/deconnexion', { username: usernameActuel });
    }
  } catch (err) {
    console.error("Erreur lors de la notification de déconnexion :", err);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user_username');
    localStorage.removeItem('username');
    localStorage.removeItem('centre_affectation');
    window.location.href = '/chef.html'; 
  }
};


  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ backgroundColor: '#99da99', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <img src={logoDretfp} alt="Logo" style={{ width: '35px', height: '34px', borderRadius: '4px' }} />
        <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.15rem', whiteSpace: 'nowrap' }}>CHEF DE CENTRE CAS DE LA DRETFP AMORON'I MANIA</span>
        <p>Session d'Examen — Transmission sécurisée des fiches candidats vers la DRETFP centrale</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <button
          type="button"
          onClick={handleDeconnexionChef}
          style={{
            backgroundColor: '#fce8e6',
            color: '#c5221f',
            border: '1.5px solid #fad2cf',
            borderRadius: '8px',
            padding: '10px 28px',
            fontSize: '0.92rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 5px rgba(197, 34, 31, 0.1)',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c5221f';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fce8e6';
            e.currentTarget.style.color = '#c5221f';
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>


      {modeSaisie === '' && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            type="button"
            onClick={() => setModeSaisie('manuel')}
            style={{ padding: '25px', width: '250px', backgroundColor: '#ffffff', border: '2px solid #1a73e8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#1a73e8', fontSize: '1rem' }}
          >
             Saisie manuelle des apprenants
          </button>
          
          <button 
            type="button"
            onClick={() => setModeSaisie('excel')}
            style={{ padding: '25px', width: '250px', backgroundColor: '#ffffff', border: '2px solid #34a853', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#34a853', fontSize: '1rem' }}
          >
             Importer un fichier Excel complet
          </button>
        </div>
      )}

      {modeSaisie === 'excel' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0', padding: '20px', marginTop: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
  
          <div style={{ borderBottom: '1px solid #f1f3f4', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#002f6c', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📤</span> Transmettre un Document Officiel à la DRETFP
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#5f6368' }}>
              Formats acceptés : <strong>Excel</strong> (.xlsx, .xls), <strong>Word</strong> (.doc, .docx) et <strong>PDF</strong> (.pdf) — Listes de candidats, Procès-Verbaux ou Rapports de fin de session.
            </p>
          </div>

          <form onSubmit={handleEnvoyerDocumentOfficiel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              border: '2px dashed #9ab9e8',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f8faff'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📄📕</div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#002f6c', marginBottom: '8px', cursor: 'pointer' }}>
                Choisir un fichier depuis votre appareil :
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.doc,.docx,.pdf"
                onChange={(e) => setFichierDocument(e.target.files ? e.target.files[0] : null)}
                style={{
                  fontSize: '0.85rem',
                  color: '#333',
                  maxWidth: '100%'
                }}
              />
              {fichierDocument && (
                <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#137333', fontWeight: 'bold' }}>
                  📎 Fichier prêt : {fichierDocument.name} ({(fichierDocument.size / 1024).toFixed(1)} Ko)
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={envoiDocLoading || !fichierDocument}
              style={{
                backgroundColor: (!fichierDocument || envoiDocLoading) ? '#9aa0a6' : '#002f6c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '0.92rem',
                cursor: (!fichierDocument || envoiDocLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              {envoiDocLoading ? '⏳ Transmission en cours...' : '🚀 Envoyer le document au Bureau Central'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#333' }}>
              📋 Mes documents déjà transmis ({mesDocumentsEnvoyes.length})
            </h4>

            {mesDocumentsEnvoyes.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#777', fontStyle: 'italic', margin: 0 }}>
                Aucun document envoyé pour le moment.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mesDocumentsEnvoyes.map((doc) => (
                  <div
                    key={doc.id_document}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e8eaed',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 'bold', color: '#1a73e8' }}>[{doc.type_fichier}]</span>
                      <span style={{ fontWeight: '600', color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.nom_fichier}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 'bold', flexShrink: 0, marginLeft: '8px' }}>
                      ✅ Reçu le {new Date(doc.date_envoi).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  {loading ? "Envoi distant..." : " Transmettre la liste à l'Admin"}
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
