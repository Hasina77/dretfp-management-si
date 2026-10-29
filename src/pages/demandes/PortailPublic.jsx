import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoDretfp from '/src/assets/images/logo.jpeg';

export default function PortailPublic({ listeEtablissements, etablissementsOptions }) {
  const [matricule, setMatricule] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [session, setSession] = useState(2026);
  const [typeDoc, setTypeDoc] = useState('ATTESTATION');
  
  const [etablissementId, setEtablissementId] = useState('');
  const [centresLocaux, setCentresLocaux] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });


    useEffect(() => {
    const injecterEtChargerCentres = async () => {
      try {
        const response = await axios.get('https://loca.lt', {
          headers: {
            'bypass-tunnel-reminder': 'true',
            'Content-Type': 'application/json'
          }
        });
        if (Array.isArray(response.data)) {
          setCentresLocaux(response.data);
        }
      } catch (err) {
        console.error("⚠️ Erreur :", err);
      }
    };
    injecterEtChargerCentres();
  }, []);



  const handleSoumettreFormulaire = async (e) => {
    e.preventDefault();

    const imPropre = String(matricule).trim().toUpperCase();

    if (!imPropre || !nom) {
      setMessage({ type: 'error', text: "⚠️ Le numéro matricule (IM) et le nom de l'apprenant sont obligatoires." });
      return;
    }

    let structureValide = true;

    if (imPropre.length !== 12) {
      structureValide = false;
    }
    else if (imPropre.charAt(3) !== '-' || imPropre.charAt(8) !== '-') {
      structureValide = false;
    }
    else {
      const caracteresDuMilieu = imPropre.substring(4, 8); 
      if (isNaN(caracteresDuMilieu) || caracteresDuMilieu.includes(' ')) {
        structureValide = false;
      }
    }

    if (!structureValide) {
      setMessage({ 
        type: 'error', 
        text: `🚨 Structure non conforme ! Format exigé : XXX-0000-XXX (Ex: 1HG-0000-DRT). Les 4 caractères du milieu doivent être strictement des CHIFFRES.` 
      });
      return;
    }

    if (!etablissementId) {
      setMessage({ type: 'error', text: "⚠️ Veuillez sélectionner votre établissement d'origine." });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });

    const etabCible = (centresLocaux || []).find(c => (c.id_etablissement ?? c.id ?? c.id_centre)?.toString() === etablissementId.toString());
    const nomCentreTexte = etabCible ? (etabCible.nom_etablissement || etabCible.nom) : "CENTRE REGIONAL";

    const payload = {
      im_apprenant: matriculePropre,
      nom_apprenant: String(nom).trim().toUpperCase(),
      prenom_apprenant: String(prenom).trim(),
      session: parseInt(session),
      type_document: String(typeDoc).toUpperCase(),
      centre_examen: String(nomCentreTexte).trim().toUpperCase()
    };

    try {
      const response = await axios.post('https://loca.lt', payload, {
    headers: {
      'bypass-tunnel-reminder': 'true',
      'Content-Type': 'application/json'
    }
  });
      if (response.data.status === 'success') {
        setMessage({ 
          type: 'success', 
          text: `🎉 Succès ! Votre demande de ${typeDoc.toLowerCase()} a été enregistrée à la DRETFP. Statut : En attente.` 
        });
        setMatricule('');
        setNom('');
        setPrenom('');
        setEtablissementId('');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: `❌ Rejet : ${err.response?.data?.detail || "Erreur technique d'écriture."}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Poppins', 'Segoe UI', sans-serif", color: '#202124' }}>
      
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logoDretfp} alt="Logo" style={{ width: '35px', height: '34px', borderRadius: '4px' }} />
            <span style={{ fontWeight: 'bold', color: '#3c4043', fontSize: '1.15rem', whiteSpace: 'nowrap' }}>DRETFP AMORON'I MANIA</span>
          </div>
       
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
          <div style={{ width: '24px', height: '3px', backgroundColor: '#333' }}></div>
          <div style={{ width: '24px', height: '3px', backgroundColor: '#333' }}></div>
          <div style={{ width: '24px', height: '3px', backgroundColor: '#333' }}></div>
        </div>
      </nav>

      <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '50px', height: '1px', backgroundColor: '#70757a' }}></div>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '1px' }}>Demandes de Titres</span>
          <div style={{ width: '50px', height: '1px', backgroundColor: '#70757a' }}></div>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '25px', color: '#002f6c' }}>
          Toutes les Apprenants doivent complétées les informations 
        </h1>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'left', marginTop: '30px' }}>
          
          {message.text && (
            <div style={{ 
              padding: '14px 20px', borderRadius: '6px', marginBottom: '25px', fontWeight: '600', fontSize: '0.92rem',
              backgroundColor: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
              color: message.type === 'success' ? '#137333' : '#c5221f',
              border: `1px solid ${message.type === 'success' ? '#ceead6' : '#fad2cf'}`
            }}>
              {message.text}
            </div>
          )}

            <form onSubmit={handleSoumettreFormulaire} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
              <div style={{ gridColumn: '1 / span 2' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.88rem', color: '#3c4043' }}>Numéro Matricule (IM) :</label>
                <input 
              type="text" 
              placeholder="Ex: 1CF-0000-BEP" 
              value={matricule} 
              onChange={(e) => setMatricule(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }}
            />
              </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.88rem', color: '#3c4043' }}>Nom de l'Apprenant :</label>
              <input 
                type="text" 
                placeholder="Ex: RAKOTO" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box', textTransform: 'uppercase', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.88rem', color: '#3c4043' }}>Prénoms :</label>
              <input 
                type="text" 
                placeholder="Ex: Jean " 
                value={prenom} 
                onChange={(e) => setPrenom(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ gridColumn: '1 / span 2' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.88rem', color: '#3c4043' }}>Établissement / Centre d'Origine :</label>
              <select 
                value={etablissementId} 
                onChange={(e) => setEtablissementId(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.92rem' }}
              >
                <option value="">-- Sélectionnez votre centre d'examen --</option>
                {centresLocaux.map((e, i) => {
                  const idUnique = e.id_etablissement ?? e.id ?? e.id_centre ?? i;
                  return <option key={idUnique} value={idUnique}>{e.nom_etablissement || e.nom}</option>;
                })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.88rem', color: '#3c4043' }}>Type de Document demandé :</label>
              <select 
                value={typeDoc} 
                onChange={(e) => setTypeDoc(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.92rem' }}
              >
                <option value="ATTESTATION">📜 Attestation de Réussite</option>
                <option value="DIPLOME">🎓 Diplôme National</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.88rem', color: '#3c4043' }}>Année de la Session :</label>
              <input 
                type="number" 
                value={session} 
                onChange={(e) => setSession(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ gridColumn: '1 / span 2', marginTop: '15px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', height: '46px', backgroundColor: loading ? '#9aa0a6' : '#1a73e8', 
                  color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', 
                  cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'background-color 0.2s'
                }}
              >
                {loading ? '⏳ Traitement sécurisé en cours...' : '🚀 Envoyer ma Demande en Ligne'}
              </button>
            </div>

          </form>
        </div>

        <div style={{ backgroundColor: '#e8f0fe', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '30px', border: '1px solid #d2e3fc' }}>
          <div style={{ backgroundColor: '#1a73e8', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#5f6368', textTransform: 'uppercase' }}>Suivi d'instruction</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#185abc' }}>Traitement immédiat après validation du guichet régional</div>
          </div>
        </div>

      </div>
    </div>
  );
}

