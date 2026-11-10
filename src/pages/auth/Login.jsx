import React, { useState } from 'react';
import API from '../../services/api'; 
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
      params.append('username', email.trim()); 
      params.append('password', password);

      const response = await API.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, role } = response.data;

      if (role !== 'ADMIN_DRETFP') {
        setError("🔒 Accès interdit : Ce guichet est exclusivement réservé au personnel du bureau de la DRETFP.");
        setLoading(false);
        return;
      }

      localStorage.setItem('dretfp_token', access_token);
      localStorage.setItem('user_role', role);
      
      window.location.href = '/dashboard';

    } catch (err) {
      setError(err.response?.data?.detail || "Identifiants administratifs incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ borderTop: '4px solid #002f6c' }}>
        <div className="login-header">
          <h2>SI-DRETFP AMORON'I MANIA</h2>
          <p style={{ color: '#c5221f', fontWeight: 'bold' }}>💻 Portail Bureau — Administration Centrale</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Adresse E-mail Professionnelle *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@dretfp.mg" required disabled={loading} />
          </div>

          <div className="form-group">
            <label>Mot de passe Bureau *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
          </div>

          <button type="submit" className="btn-login" disabled={loading} style={{ backgroundColor: '#002f6c' }}>
            {loading ? 'Vérification...' : '🔑 Connexion Bureau Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
