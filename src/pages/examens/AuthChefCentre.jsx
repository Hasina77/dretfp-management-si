import React, { useState } from 'react';
import API from '../../services/api';
import './AuthChefCentre.css';

const AuthChefCentre = () => {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginChef = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', username.trim());
      params.append('password', password);

      const response = await API.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, role, centre_affectation } = response.data;

      if (role !== 'AGENT_CENTRE') {
        setError("🔒 Accès refusé : Ce portail mobile est réservé aux Chefs de Centre sur le terrain.");
        setLoading(false);
        return;
      }

      localStorage.setItem('dretfp_token', access_token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('centre_affectation', centre_affectation);

      window.location.href = '/chef-de-centre';

    } catch (err) {
      setError(err.response?.data?.detail || "Identifiants de terrain invalides.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChef = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password: password
      };

      await API.post('/auth/register-chef', payload);
      setSuccess("🎉 Compte certifié et activé avec succès ! Vous pouvez vous connecter.");
      setTimeout(() => {
        setIsLoginMode(true);
        setPassword('');
        setConfirmPassword('');
      }, 2500);

    } catch (err) {
      setError(err.response?.data?.detail || "Échec de la validation de votre fiche de poste.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-chef-container">
      <div className="auth-chef-card" style={{ borderTop: isLoginMode ? '4px solid #1a73e8' : '4px solid #34a853' }}>
        <div className="auth-chef-header">
          <h2>DRETFP AMORON'I MANIA</h2>
          <p style={{ color: isLoginMode ? '#1a73e8' : '#34a853', fontWeight: 'bold' }}>
            {isLoginMode ? '🏕️ Portail Terrain — Connexion Chef de Centre' : '📝 Portail Terrain — Activation de Compte Terrain'}
          </p>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}

        {isLoginMode ? (
          <form onSubmit={handleLoginChef} className="auth-chef-form">
            <div className="form-group-chef">
              <label>Nom d'utilisateur (Username) ou Email *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: chef_ambositra" required disabled={loading} />
            </div>
            <div className="form-group-chef">
              <label>Mot de passe terrain *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
            </div>
            <button type="submit" className="btn-register-chef" disabled={loading} style={{ backgroundColor: '#1a73e8' }}>
              {loading ? 'Vérification...' : '🔐 Connexion Espace Terrain'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterChef} className="auth-chef-form">
            <div className="form-group-chef">
              <label>Username Officiel (Fourni par l'Admin) *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: chef_ambositra" required disabled={loading} />
            </div>
            <div className="form-group-chef">
              <label>Adresse E-mail Professionnelle *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="responsable@centre.mg" required disabled={loading} />
            </div>
            <div className="form-group-chef">
              <label>Définir votre mot de passe </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
            </div>
            <div className="form-group-chef">
              <label>Confirmer votre mot de passe </label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
            </div>
            <button type="submit" className="btn-register-chef" disabled={loading} style={{ backgroundColor: '#34a853' }}>
              {loading ? 'Vérification du registre...' : '✍️ Activer mon Espace Distant'}
            </button>
          </form>
        )}

        <div className="auth-chef-footer">
          {isLoginMode ? (
            <p>Première liaison sur le terrain ? <span onClick={() => { setIsLoginMode(false); setError(''); }} style={{ color: '#34a853', cursor: 'pointer', fontWeight: 'bold' }}>Activer votre compte</span></p>
          ) : (
            <p>Compte déjà configuré ? <span onClick={() => { setIsLoginMode(true); setError(''); }} style={{ color: '#1a73e8', cursor: 'pointer', fontWeight: 'bold' }}>Se connecter</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthChefCentre;
