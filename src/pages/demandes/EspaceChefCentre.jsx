import React, { useState } from 'react';
import API from '../../services/api';
import * as XLSX from 'xlsx';

const EspaceChefCentre = () => {
  const [modeSaisie, setModeSaisie] = useState(''); // 'manuel' ou 'excel'
  const [listeApprenants, setListeApprenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // ID de l'établissement récupéré du token utilisateur lors du login
  const idEtablissementChef = localStorage.getItem('centre_affectation'); 

  // Option 1 : Lecture et analyse du fichier Excel importé par le chef de centre
  const handleLectureExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const feuille = workbook.Sheets[workbook.SheetNames[0]];
      const lignes = XLSX.utils.sheet_to_json(feuille);
      
      // Injection automatique de l'ID d'établissement du chef connecté pour verrouiller la provenance
      const lignesFormatees = lignes.map(row => ({
        ...row,
        etablissement_id: parseInt(idEtablissementChef, 10),
        progression: "EN_ATTENTE_VALIDATION" // Statut masqué de la liste globale jusqu'à validation admin
      }));
      setListeApprenants(lignesFormatees);
    };
    reader.readAsArrayBuffer(file);
  };

  // Option 2 : Envoi final à distance vers le serveur central MySQL de la DRETFP
  const handleTransmettreADistance = async () => {
    if (listeApprenants.length === 0) {
      alert("⚠️ Votre liste est vide. Veuillez saisir des données avant d'envoyer.");
      return;
    }

    setLoading(true);
    try {
      // Transmission groupée au endpoint bulk existant du backend
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

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ backgroundColor: '#002f6c', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <h2>🏛️ Portail de Saisie Décentralisé — Chef de Centre</h2>
        <p>Session d'Examen — Transmission sécurisée des fiches candidats vers la DRETFP centrale</p>
      </div>

      {modeSaisie === '' && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            onClick={() => setModeSaisie('manuel')}
            style={{ padding: '25px', width: '250px', backgroundColor: '#ffffff', border: '2px solid #1a73e8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#1a73e8', fontSize: '1rem' }}
          >
            ✍️ Saisie manuelle des apprenants
          </button>
          
          <button 
            onClick={() => setModeSaisie('excel')}
            style={{ padding: '25px', width: '250px', backgroundColor: '#ffffff', border: '2px solid #34a853', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#34a853', fontSize: '1rem' }}
          >
            📊 Importer un fichier Excel complet
          </button>
        </div>
      )}

      {/* Rendu de l'option Import Excel */}
      {modeSaisie === 'excel' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0' }}>
          <h3>📥 Chargement du fichier du centre</h3>
          <input type="file" accept=".xlsx, .xls" onChange={handleLectureExcel} style={{ marginBottom: '20px' }} />
          
          {listeApprenants.length > 0 && (
            <div>
              <p style={{ color: '#137333', fontWeight: '600' }}>✅ {listeApprenants.length} ligne(s) détectée(s) prête(s) à l'envoi.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => setModeSaisie('')} style={{ padding: '10px 15px', background: '#f1f3f4', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleTransmettreADistance} disabled={loading} style={{ padding: '10px 20px', background: '#002f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? "Envoi distant..." : "📤 Valider l'envoi vers l'Admin"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {modeSaisie === 'manuel' && (
        <div style={{ animation: 'scaleUpModal 0.2s ease-out' }}>
          
          {/* Formulaire de saisie unitaire */}
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#002f6c', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              ✍️ Ajouter un candidat manuellement
            </h3>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const imSaisi = form.matricule.value.trim().toUpperCase();

                // 1. Validation réglementaire du format de matricule DRETFP (XXX-0000-XXX)
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
                  alert(`🚨 Format non conforme :\nLe numéro matricule "${imSaisi}" est invalide.\nStructure obligatoire : XXX-0000-XXX (Ex: 1CF-0002-BEP).\nLes 4 caractères centraux doivent être des chiffres.`);
                  return;
                }

                // 2. Vérification anti-doublon dans la liste temporaire locale
                const doublonLocal = listeApprenants.some(app => app.im_apprenant === imSaisi);
                if (doublonLocal) {
                  alert("⚠️ Ce numéro matricule est déjà présent dans votre liste temporaire ci-dessous.");
                  return;
                }

                // 3. Construction de l'objet apprenant
                const nouvelApprenant = {
                  im_apprenant: imSaisi,
                  nom_apprenant: form.nom.value.trim().toUpperCase(),
                  prenom_apprenant: form.prenom.value.trim(),
                  date_naiss: form.date_naiss.value,
                  lieu_naiss: form.lieu_naiss.value.trim().toUpperCase(),
                  examen_id: form.examen.value,
                  session: parseInt(form.session.value, 10) || 2026,
                  mention: form.mention.value,
                  etablissement_id: parseInt(idEtablissementChef, 10),
                  secteur_id: 1,  // Valeurs par défaut à affiner selon votre catalogue
                  filiere_id: 1,
                  metier_id: 1,
                  progression: "EN_ATTENTE"
                };

                // 4. Ajout dynamique et réinitialisation du formulaire
                setListeApprenants([...listeApprenants, nouvelApprenant]);
                form.reset();
                form.session.value = "2026"; // Restaure la session par défaut
              }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>N° IM (Matricule) * :</label>
                <input name="matricule" type="text" required placeholder="Ex: 1CF-0002-BEP" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Nom de l'apprenant * :</label>
                <input name="nom" type="text" required placeholder="Ex: RAKOTO" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Prénoms :</label>
                <input name="prenom" type="text" placeholder="Ex: Jean Michel" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Date de naissance * :</label>
                <input name="date_naiss" type="date" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Lieu de naissance * :</label>
                <input name="lieu_naiss" type="text" required placeholder="Ex: AMBOSITRA" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Examen * :</label>
                <select name="examen" required style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  <option value="1">CAP</option>
                  <option value="2">BEP</option>
                  <option value="3">BT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Session :</label>
                <input name="session" type="number" defaultValue="2026" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Mention obtenue :</label>
                <select name="mention" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  <option value="Passable">Passable</option>
                  <option value="Assez Bien">Assez Bien</option>
                  <option value="Bien">Bien</option>
                  <option value="Très Bien">Très Bien</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: '100%' }}>
                <button 
                  type="submit" 
                  style={{ height: '38px', padding: '0 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                >
                  ➕ Ajouter à la liste locale
                </button>
              </div>
            </form>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>
                📋 Tableau récapitulatif avant transmission ({listeApprenants.length} apprenant(s))
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
                {listeApprenants.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#70757a', fontStyle: 'italic' }}>
                      📭 Aucun candidat saisi pour le moment. Remplissez le formulaire ci-dessus.
                    </td>
                  </tr>
                ) : (
                  listeApprenants.map((app, index) => (
                    <tr key={index}>
                      <td><strong>{app.im_apprenant}</strong></td>
                      <td>{app.nom_apprenant} {app.prenom_apprenant}</td>
                      <td>{app.date_naiss} à {app.lieu_naiss}</td>
                      <td>{app.examen_id === "1" ? "CAP" : app.examen_id === "2" ? "BEP" : "BT"} ({app.session})</td>
                      <td><em style={{ color: '#1a73e8', fontWeight: '600' }}>{app.mention}</em></td>
                                            <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            // Suppression réactive locale du candidat
                            setListeApprenants(listeApprenants.filter((_, i) => i !== index));
                          }}
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

                {listeApprenants.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                    <button
                    type="button"
                    onClick={() => { if(window.confirm("⚠️ Voulez-vous vider toute la liste saisie ?")) setListeApprenants([]); }}
                    style={{ padding: '10px 15px', background: '#f1f3f4', color: '#3c4043', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                    >
                    🧹 Tout effacer
                    </button>
                    <button
                    type="button"
                    onClick={handleTransmettreADistance}
                    disabled={loading}
                    style={{ padding: '10px 25px', background: '#002f6c', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,47,108,0.2)' }}
                    >
                    {loading ? "Envoi distant en cours..." : "📤 Transmettre la liste à l'Admin"}
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
