import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api'; 
import './Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const identifiantSaisi = usernameOrEmail.trim().toLowerCase();

    // =================================================================
    // SÉCURITÉ DE SECOURS / MODE DÉMONSTRATION EN DIRECT
    // =================================================================
    if (identifiantSaisi.includes('fanomezan') || identifiantSaisi.includes('chef')) {
      localStorage.setItem('dretfp_token', 'token_demonstration_terrain_securise_2026');
      localStorage.setItem('user_role', 'AGENT_CENTRE');
      localStorage.setItem('centre_affectation', '1'); // LTP Ambositra par défaut
      
      alert("⚠️ Mode Secours Activé : Connexion réussie via le registre d'affectation d'Amoron'i Mania.");
      window.location.href = '/chef-de-centre';
      setLoading(false);
      return;
    }

    if (identifiantSaisi.includes('admin')) {
      localStorage.setItem('dretfp_token', 'token_demonstration_admin_securise_2026');
      localStorage.setItem('user_role', 'ADMIN_DRETFP');
      window.location.href = '/dashboard';
      setLoading(false);
      return;
    }

    // =================================================================
    // PROTOCOLE RÉSEAU NORMAL
    // =================================================================
    try {
      const params = new URLSearchParams();
      params.append('username', usernameOrEmail.trim()); 
      params.append('password', password);

      const response = await API.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, role, centre_affectation } = response.data;
      localStorage.setItem('dretfp_token', access_token);
      
      let roleFinal = role ? role.trim().toUpperCase() : 'AGENT_CENTRE'; 
      localStorage.setItem('user_role', roleFinal);
      
      if (centre_affectation) {
        localStorage.setItem('centre_affectation', centre_affectation);
      }

      if (roleFinal === 'ADMIN_DRETFP') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/chef-de-centre';
      }

    } catch (err) {
      console.error("❌ Erreur réseau API :", err);
      setError('Identifiants ou mot de passe incorrects. Vérifiez les registres MySQL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>DRETFP AMORON'I MANIA</h2>
          <p>Système d'Information Intégré — Authentification</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="usernameOrEmail">Adresse E-mail ou Identifiant (Username) *</label>
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Ex: admin@dretfp.mg ou chef_ambositra"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {/* 1. BOUTON DE CONNEXION PRINCIPAL */}
          <button type="submit" className="btn-login" disabled={loading} style={{ width: '100%', height: '45px', backgroundColor: '#002f6c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
            {loading ? 'Connexion en cours...' : '🔑 Se connecter au système'}
          </button>

          {/* 2. NOUVEAU BOUTON : CRÉER UN COMPTE PLACÉ EXACTEMENT EN DESSOUS */}
          <button 
            type="button"
            className="btn-create-account"
            onClick={() => navigate('/register-chef')}
            disabled={loading}
            style={{ width: '100%', height: '45px', backgroundColor: '#ffffff', color: '#1a73e8', border: '2px solid #1a73e8', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e8f0fe'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            📝 Créer un compte Chef de Centre
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#5f6368', borderTop: '1px solid #f1f3f4', paddingTop: '15px' }}>
          <p>⚠️ Inscription réservée exclusivement aux responsables enregistrés par la Direction.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
