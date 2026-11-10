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
      localStorage.setItem('user_role', role);
      
      if (centre_affectation) {
        localStorage.setItem('centre_affectation', centre_affectation);
      }

      if (role === 'ADMIN_DRETFP') {
        window.location.href = '/dashboard';
      } else if (role === 'AGENT_CENTRE') {
        window.location.href = '/chef-de-centre';
      } else if (role === 'APPRENANT') {
        window.location.href = '/';
      } else {
        setError("⚠️ Rôle applicatif non reconnu par le système central.");
      }

    } catch (err) {
      console.error("❌ Échec d'authentification :", err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Identifiants ou mot de passe incorrects.');
      } else {
        setError('📡 Impossible de joindre le serveur central de la DRETFP. Vérifiez votre tunnel Ngrok.');
      }
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

        <form onSubmit={handleSubmit} className="login-form">
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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Connexion en cours...' : '🔑 Se connecter au système'}
          </button>
        </form>

        <div className="login-footer">
          <p>Nouveau responsable de centre ? <span onClick={() => navigate('/register')} style={{ color: '#1a73e8', cursor: 'pointer', fontWeight: '600' }}>Activer votre compte terrain</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
