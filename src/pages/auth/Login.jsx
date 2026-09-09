import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Facultatif : Pour ajouter ton style CSS personnalisé

const Login = () => {
  // 1. États pour stocker les saisies du formulaire (Table users)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Fonction de soumission du formulaire
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Transformation des données au format standard pour l'authentification API
      const params = new URLSearchParams();
      params.append('username', email); // FastAPI utilise 'username' par défaut pour l'e-mail
      params.append('password', password);

      const response = await axios.post('http://localhost:8000/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, role } = response.data;

      // Sauvegarde des informations de session
      localStorage.setItem('dretfp_token', access_token);
      localStorage.setItem('user_role', role);

      // Redirection automatique
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
        {/* Emplacement propre pour ton logo DRETFP dans src/assets/images/ */}
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
