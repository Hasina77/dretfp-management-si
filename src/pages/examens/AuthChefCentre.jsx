import React, { useState } from 'react';
import axios from 'axios';
import './AuthChefCentre.css';

const AuthChefCentre = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centre, setCentre] = useState('Lycée Technique Fianarantsoa');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const baseUrl = 'https://loca.lt';

    try {
      if (isRegisterMode) {
        await axios.post(`${baseUrl}/register`, {
          email: email,
          password: password,
          role: 'AGENT_CENTRE',
          centre_affectation: centre
        });
        setMessage({ type: 'success', text: 'Compte Chef de Centre créé ! Veuillez vous connecter.' });
        setIsRegisterMode(false);
      } else {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await axios.post(`${baseUrl}/login`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        localStorage.setItem('dretfp_token', response.data.access_token);
        localStorage.setItem('chef_centre_etablissement', centre); 

        window.location.href = '/saisie-centre-public';
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-chef-container">
      <div className="auth-chef-card">
        <h2>{isRegisterMode ? '📝 Créer un compte Chef de Centre' : '🔐 Connexion Portail Terrain'}</h2>
        <p className="subtitle">Direction Régionale de l'Enseignement Technique</p>

        {message.text && <div className={`alert-box ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="auth-chef-form">
          <div className="form-group-block">
            <label>Adresse E-mail Officielle</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: chef.fianar@dretfp.mg" required />
          </div>

          <div className="form-group-block">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div className="form-group-block">
            <label>Centre / Établissement d'Affectation</label>
            <select value={centre} onChange={(e) => setCentre(e.target.value)}>
              <option value="Lycée Technique Fianarantsoa">Lycée Technique Fianarantsoa</option>
              <option value="CFP Ambalavao">CFP Ambalavao</option>
            </select>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Traitement...' : isRegisterMode ? "S'inscrire et initialiser" : 'Se connecter au portail'}
          </button>
        </form>

        <div className="auth-toggle-link" onClick={() => setIsRegisterMode(!isRegisterMode)}>
          {isRegisterMode ? 'Déjà un compte ? Connectez-vous' : "Première connexion ? Créez votre compte terrain"}
        </div>
      </div>
    </div>
  );
};

export default AuthChefCentre;
