import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const SaisieNotes = () => {
  const navigate = useNavigate();
  const [apprenantsFiltres, setApprenantsFiltres] = useState([]);
  const [listeExamens, setListeExamens] = useState([]);
  const [examenSelectionne, setExamenSelectionne] = useState('');
  const [sessionAnnee, setSessionAnnee] = useState('2026');
  const [notesState, setNotesState] = useState({}); // Stocke les notes dynamiquement { id_apprenant: { theo: 0, prat: 0 } }
  const [loading, setLoading] = useState(false);

  const idEtablissementChef = localStorage.getItem('centre_affectation');
  const userRole = localStorage.getItem('user_role');
  const token = localStorage.getItem('dretfp_token');

  // Barrière de restriction de sécurité
  useEffect(() => {
    if (!token || (userRole !== 'AGENT_CENTRE' && userRole !== 'ADMIN_DRETFP')) {
      alert("🔒 Accès refusé : Espace réservé aux gestionnaires authentifiés.");
      navigate('/login');
    }
  }, [token, userRole, navigate]);

  // Chargement initial des examens et des apprenants du centre
  useEffect(() => {
    const chargerDonneesInitiales = async () => {
      try {
        const [resExamens, resApprenants] = await Promise.all([
          API.get('/examens/liste'),
          API.get('/apprenants/liste')
        ]);
        setListeExamens(resExamens.data || []);
        
        // Filtrer les apprenants pour n'afficher que ceux de l'établissement du chef connecté
        const duCentre = (resApprenants.data || []).filter(
          app => (app.etablissement_id ?? app.centre_id)?.toString() === idEtablissementChef?.toString()
        );
        setApprenantsFiltres(duCentre);

        // Initialiser l'état des notes pour chaque élève
        const initialNotes = {};
        duCentre.forEach(app => {
          initialNotes[app.id_apprenant] = { theo: '', prat: '', stage: '' };
        });
        setNotesState(initialNotes);

      } catch (err) {
        console.error("❌ Erreur lors du chargement des fiches d'examen :", err);
      }
    };
    chargerDonneesInitiales();
  }, [idEtablissementChef]);

  // Calcul automatique de la moyenne pondérée (Théorie coef 1, Pratique coef 2)
  const calculerMoyenneLocal = (theo, prat) => {
    const t = parseFloat(theo) || 0;
    const p = parseFloat(prat) || 0;
    return ((t + (p * 2)) / 3).toFixed(2);
  };

  const handleInputChange = (apprenantId, champ, valeur) => {
    const val = valeur === '' ? '' : Math.min(20, Math.max(0, parseFloat(valeur) || 0));
    setNotesState(prev => ({
      ...prev,
      [apprenantId]: { ...prev[apprenantId], [champ]: val }
    }));
  };

  const handleEnregistrerNotes = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Formater le payload pour l'envoi groupé
    const payloadNotes = Object.keys(notesState).map(id => {
      const n = notesState[id];
      const moyenne = calculerMoyenneLocal(n.theo, n.prat);
      return {
        apprenant_id: parseInt(id, 10),
        note_theorique: parseFloat(n.theo) || 0,
        note_pratique: parseFloat(n.prat) || 0,
        moyenne_generale: parseFloat(moyenne),
        statut_deliberation: parseFloat(moyenne) >= 10 ? "ADMIS" : "AJOURNE"
      };
    });

    try {
      await API.post('/examens/enregistrer-notes-bulk', { notes: payloadNotes });
      alert("🎉 Procès-Verbal des notes enregistré et transmis avec succès sur le serveur central !");
      navigate('/chef-de-centre');
    } catch (err) {
      alert("❌ Erreur lors de la synchronisation des notes.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage à l'écran selon les choix de l'utilisateur
  const apprenantsVisibles = apprenantsFiltres.filter(app => {
    const matchExam = examenSelectionne === '' || app.examen_id?.toString() === examenSelectionne.toString();
    const matchSession = sessionAnnee === '' || app.session?.toString() === sessionAnnee.toString();
    return matchExam && matchSession;
  });

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ backgroundColor: '#002f6c', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>✍️ Grille de Saisie des Notes d'Examen</h2>
          <p>Saisie décentralisée — Génération des Procès-Verbaux (PV) de délibération</p>
        </div>
        <button onClick={() => navigate('/chef-de-centre')} style={{ background: '#f1f3f4', color: '#002f6c', border: 'none', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Retour Portail</button>
      </div>

      {/* Barre de filtrage dynamique */}
      <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #dadce0', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '600' }}>Filtrer par Examen :</label>
          <select value={examenSelectionne} onChange={(e) => setExamenSelectionne(e.target.value)} style={{ width: '100%', height: '36px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
            <option value="">-- Tous les examens du centre --</option>
            {listeExamens.map(ex => (
              <option key={ex.id_examen ?? ex.id} value={ex.id_examen ?? ex.id}>{ex.nom_exam || ex.nom_examen}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '200px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '600' }}>Session :</label>
          <input type="number" value={sessionAnnee} onChange={(e) => setSessionAnnee(e.target.value)} style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Tableau interactif de saisie de notes */}
      <form onSubmit={handleEnregistrerNotes} style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
          <thead>
            <tr>
              <th>N° IM (Matricule)</th>
              <th>Nom & Prénoms</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Note Théorie (/20) *</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Note Pratique (/20) *</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Moyenne / 20</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {apprenantsVisibles.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#5f6368', fontStyle: 'italic' }}>
                  📭 Aucun apprenant ne correspond aux critères de recherche pour cette session.
                </td>
              </tr>
            ) : (
              apprenantsVisibles.map((app) => {
                const id = app.id_apprenant;
                const note = notesState[id] || { theo: '', prat: '' };
                const moy = calculerMoyenneLocal(note.theo, note.prat);

                return (
                  <tr key={id}>
                    <td><strong>{app.im_apprenant}</strong></td>
                    <td>{app.nom_apprenant} {app.prenom_apprenant || ""}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="number" step="0.25" min="0" max="20" required value={note.theo} onChange={(e) => handleInputChange(id, 'theo', e.target.value)} placeholder="0.00" style={{ width: '80px', height: '32px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="number" step="0.25" min="0" max="20" required value={note.prat} onChange={(e) => handleInputChange(id, 'prat', e.target.value)} placeholder="0.00" style={{ width: '80px', height: '32px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: parseFloat(moy) >= 10 ? '#137333' : '#c5221f' }}>
                      {moy}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-badge" style={{ 
                        backgroundColor: parseFloat(moy) >= 10 ? '#e6f4ea' : '#fce8e6',
                        color: parseFloat(moy) >= 10 ? '#137333' : '#c5221f',
                        fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem'
                      }}>
                        {parseFloat(moy) >= 10 ? 'Admis' : 'Ajourné'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {apprenantsVisibles.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button type="submit" disabled={loading} style={{ padding: '12px 30px', background: '#002f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,47,108,0.2)' }}>
              {loading ? "Transmission du PV..." : "💾 Valider et Transmettre le PV de Notes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SaisieNotes;
