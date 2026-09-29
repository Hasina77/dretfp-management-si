import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', email); 
      params.append('password', password);

      const response = await axios.post('http://localhost:8000/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, role } = response.data;

      localStorage.setItem('dretfp_token', access_token);
      localStorage.setItem('user_role', role);

      if (role === 'ADMIN_DRETFP' || role === 'AGENT_CENTRE') {
        window.location.href = '/dashboard';
      } else if (role === 'APPRENANT') {
        window.location.href = '/demande-diplome';
      }

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Identifiants ou mot de passe DRETFP incorrects.');
      } else {
        setError('Impossible de joindre le serveur central DRETFP. Vérifiez s\'il est allumé.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>DRETFP </h2>
          <p>Système d'Information Intégré</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Adresse E-mail Professionnelle ou Matricule</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
