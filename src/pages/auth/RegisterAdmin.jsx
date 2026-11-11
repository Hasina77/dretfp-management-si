import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretCode, setSecretCode] = useState(''); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    if (secretCode !== "DRETFP_AMORONIMANIA_2026") {
      setError("❌ Code secret de la Direction invalide. Initialisation refusée.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password
      };

      await API.post('/auth/register', payload);
      
      setSuccess("🎉 Compte Administrateur central créé avec succès dans MySQL ! Redirection...");
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setError(err.response?.data?.detail || "Échec de la création du compte administrateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <div className="login-card" style={{ borderTop: '4px solid #c5221f', background: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '440px' }}>
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2>DRETFP AMORON'I MANIA</h2>
          <p style={{ color: '#c5221f', fontWeight: 'bold', fontSize: '0.9rem' }}>📝 Initialisation Initiale du Compte Admin Bureau</p>
        </div>

        <form onSubmit={handleRegisterAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {error && <div style={{ backgroundColor: '#fce8e6', color: '#c5221f', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #fad2cf' }}>{error}</div>}
          {success && <div style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #ceead6' }}>{success}</div>}

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600' }}>Adresse E-mail Professionnelle DRETFP *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: inspecteur@dretfp.mg" required disabled={loading} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600' }}>Mot de passe Bureau *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600' }}>Confirmer le mot de passe *</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required disabled={loading} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#b06000' }}>Clé de Sécurité d'Enregistrement Direction *</label>
            <input type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} placeholder="Code secret matériel" required disabled={loading} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #b06000', boxSizing: 'border-box', backgroundColor: '#fff9e6' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', height: '45px', backgroundColor: '#c5221f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', marginTop: '10px' }}>
            {loading ? 'Création du profil...' : '🛡️ Enregistrer le compte Administrateur'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          <p>Compte déjà existant ? <span onClick={() => navigate('/login')} style={{ color: '#002f6c', cursor: 'pointer', fontWeight: 'bold' }}>Se connecter au Bureau</span></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
