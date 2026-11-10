import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const SaisieCentreTerrain = () => {
  const navigate = useNavigate();
  const [listeEtablissements, setListeEtablissements] = useState([]);
  const [bilanNotes, setBilanNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterExam, setFilterExam] = useState('Tous');

  const userRole = localStorage.getItem('user_role');
  const token = localStorage.getItem('dretfp_token');

  // 1. Contrôle d'accès et barrière de sécurité administrative
  useEffect(() => {
    if (!token || userRole !== 'ADMIN_DRETFP') {
      alert("🔒 Accès restreint : Cet écran de supervision est réservé à la Direction Régionale.");
      navigate('/login');
    }
  }, [token, userRole, navigate]);

  // 2. Chargement des données de synthèse de la région Amoron'i Mania
  const chargerSyntheseTerrain = async () => {
    setLoading(true);
    try {
      const [resEtab, resApprenants] = await Promise.all([
        API.get('/etablissements/liste'),
        API.get('/apprenants/liste')
      ]);

      setListeEtablissements(resEtab.data || []);

      // Agrégation dynamique locale des statistiques par établissement
      const apprenantsBdd = resApprenants.data || [];
      const synthese = resEtab.data.map(etab => {
        const idCent = etab.id_centre ?? etab.id_etablissement;
        const elevesDuCentre = apprenantsBdd.filter(a => (a.etablissement_id ?? a.centre_id)?.toString() === idCent?.toString());
        
        // Calculs des indicateurs de performance
        const total = elevesDuCentre.length;
        const admis = elevesDuCentre.filter(a => (a.mention && a.mention !== 'Ajourné') || a.progression === 'TERMINER').length; // Logique métier à adapter selon vos flags BDD
        const ajournes = total - admis;
        const tauxReussite = total > 0 ? ((admis / total) * 100).toFixed(1) : 0;

        return {
          id_centre: idCent,
          nom_etablissement: etab.nom_etablissement,
          district: etab.localisation_district,
          total_candidats: total,
          admis_count: admis,
          ajournes_count: ajournes,
          taux: tauxReussite,
          statut_pv: total > 0 ? "TRANSMIS" : "EN_ATTENTE"
        };
      });

      setBilanNotes(synthese);
    } catch (err) {
      console.error("❌ Erreur de récupération des bilans de PV d'examens :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerSyntheseTerrain();
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Bandeau d'en-tête */}
      <div style={{ backgroundColor: '#1a1f2c', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div>
          <h2>📊 Suivi Global et Supervision des Procès-Verbaux (PV)</h2>
          <p>Espace Directeur Régional — Suivi en temps réel des remontées de notes des centres d'examens</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ backgroundColor: '#ffffff', color: '#1a1f2c', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          🎛️ Retour Dashboard Admin
        </button>
      </div>

      {/* Widgets de synthèse régionaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #eef2f5', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '0.85rem', color: '#5f6368', fontWeight: '600' }}>🏫 Centres Répertoriés</span>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '1.6rem', color: '#002f6c' }}>{listeEtablissements.length}</h3>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #eef2f5', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '0.85rem', color: '#5f6368', fontWeight: '600' }}>📜 PV Reçus / Transmis</span>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '1.6rem', color: '#137333' }}>
            {bilanNotes.filter(b => b.statut_pv === 'TRANSMIS').length}
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #eef2f5', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '0.85rem', color: '#5f6368', fontWeight: '600' }}>⏳ PV en retards / Attente</span>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '1.6rem', color: '#b06000' }}>
            {bilanNotes.filter(b => b.statut_pv === 'EN_ATTENTE').length}
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #eef2f5', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '0.85rem', color: '#5f6368', fontWeight: '600' }}>📈 Taux Régional Global</span>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '1.6rem', color: '#1a73e8' }}>
            {(bilanNotes.reduce((acc, curr) => acc + parseFloat(curr.taux), 0) / (bilanNotes.length || 1)).toFixed(1)}%
          </h3>
        </div>
      </div>

      {/* Tableau central de supervision */}
      <div style={{ background: '#ffffff', padding: '25px', borderRadius: '8px', border: '1px solid #dadce0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#3c4043' }}>📋 Registre de contrôle des Centres de Saisie</h3>
          <button onClick={chargerSyntheseTerrain} style={{ background: '#f1f3f4', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>🔄 Rafraîchir les données</button>
        </div>

        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nom de l'Établissement / Centre</th>
              <th>Localisation (District)</th>
              <th style={{ textAlign: 'center' }}>Candidats Inscrits</th>
              <th style={{ textAlign: 'center' }}>Admis</th>
              <th style={{ textAlign: 'center' }}>Ajournés</th>
              <th style={{ textAlign: 'center' }}>Taux Réussite</th>
              <th style={{ textAlign: 'center' }}>Statut du PV</th>
              <th style={{ textAlign: 'center' }}>Décision</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#5f6368', fontStyle: 'italic' }}>
                  ⏳ Analyse des registres d'examens de la DRETFP en cours...
                </td>
              </tr>
            ) : bilanNotes.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#5f6368' }}>
                  📭 Aucun établissement répertorié.
                </td>
              </tr>
            ) : (
              bilanNotes.map((stat, i) => (
                <tr key={stat.id_centre || i}>
                  <td><strong>{stat.nom_etablissement}</strong></td>
                  <td><span style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{stat.district}</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stat.total_candidats}</td>
                  <td style={{ textAlign: 'center', color: '#137333', fontWeight: '600' }}>{stat.admis_count}</td>
                  <td style={{ textAlign: 'center', color: '#c5221f', fontWeight: '600' }}>{stat.ajournes_count}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#202124' }}>{stat.taux}%</div>
                    <div style={{ width: '100px', height: '5px', background: '#f1f3f4', borderRadius: '3px', margin: '4px auto 0 auto', overflow: 'hidden' }}>
                      <div style={{ width: `${stat.taux}%`, height: '100%', background: parseFloat(stat.taux) >= 50 ? '#34a853' : '#f4b400' }}></div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="status-badge" style={{ 
                      backgroundColor: stat.statut_pv === 'TRANSMIS' ? '#e6f4ea' : '#fef7e0',
                      color: stat.statut_pv === 'TRANSMIS' ? '#137333' : '#b06000',
                      fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem'
                    }}>
                      {stat.statut_pv === 'TRANSMIS' ? '📥 Reçu / Clos' : '⏳ En attente'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      disabled={stat.statut_pv === 'EN_ATTENTE'}
                      onClick={() => {
                        alert(`📜 Validation officielle du PV pour ${stat.nom_etablissement}.\nLes mentions sont figées. Les diplômes entrent en file d'impression.`);
                      }}
                      style={{ 
                        background: stat.statut_pv === 'TRANSMIS' ? '#1a73e8' : '#bdc1c6',
                        color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', 
                        fontWeight: '600', cursor: stat.statut_pv === 'TRANSMIS' ? 'pointer' : 'not-allowed', fontSize: '0.8rem' 
                      }}
                      >
                      🛡️ Sceller le PV
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaisieCentreTerrain;

