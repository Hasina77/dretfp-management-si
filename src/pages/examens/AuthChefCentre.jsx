import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './AuthChefCentre.css'; 

const AuthChefCentre = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("❌ Les mots de passe saisis ne sont pas identiques.");
      return;
    }

    if (password.length < 6) {
      setError("❌ Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password: password
      };

      const response = await API.post('/auth/register-chef', payload);

      if (response.data.status === 'success' || response.status === 201) {
        setSuccess("🎉 Votre compte a été validé et créé avec succès ! Redirection...");
        setTimeout(() => {
          navigate('/login'); 
        }, 3000);
      }
    } catch (err) {
      console.error("❌ Échec de la création de compte :", err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Une erreur est survenue lors de l'inscription.");
      } else {
        setError("📡 Impossible de joindre le serveur central. Vérifiez votre connexion ou votre tunnel Ngrok.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-chef-container">
      <div className="auth-chef-card">
        <div className="auth-chef-header">
          <h2>DRETFP Amoron'i Mania</h2>
          <p>Enregistrement Initial des Chefs de Centre</p>
        </div>

        <form onSubmit={handleRegister} className="auth-chef-form">
          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          <div className="form-group-chef">
            <label htmlFor="username">Identifiant de dotation (Username officiel) *</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: chef_ambositra"
              required
              disabled={loading}
            />
            <small className="help-text">⚠️ Doit correspondre exactement à l'identifiant transmis par la Direction.</small>
          </div>

          <div className="form-group-chef">
            <label htmlFor="email">Adresse E-mail Professionnelle *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: responsable@centre.mg"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group-chef">
            <label htmlFor="password">Définir un mot de passe *</label>
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

          <div className="form-group-chef">
            <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-register-chef" disabled={loading}>
            {loading ? "Vérification et création..." : "🔐 Activer mon espace distant"}
          </button>
        </form>

        <div className="auth-chef-footer">
          <p>Vous possédez déjà un compte ? <span onClick={() => navigate('/login')} style={{ color: '#1a73e8', cursor: 'pointer', fontWeight: '600' }}>Se connecter</span></p>
        </div>
      </div>
    </div>
  );
};

export default AuthChefCentre;
