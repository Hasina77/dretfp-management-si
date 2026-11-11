import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api'; 
import './Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', email.trim()); 
      params.append('password', password);

      const response = await API.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, role } = response.data;

      if (role !== 'ADMIN_DRETFP') {
        setError("🔒 Accès interdit : Ce guichet est exclusivement réservé aux administrateurs du bureau central de la DRETFP.");
        setLoading(false);
        return;
      }

      localStorage.setItem('dretfp_token', access_token);
      localStorage.setItem('user_role', role);
      
      window.location.href = '/dashboard';

    } catch (err) {
      console.error("❌ Échec d'authentification bureau :", err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Identifiants administratifs incorrects.');
      } else {
        setError('📡 Impossible de joindre le serveur central de la DRETFP. Vérifiez votre tunnel Ngrok.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    
    const bloquerRetourFlèche = () => {
      window.history.pushState(null, null, window.location.href);
      alert("🔒 Session fermée : Action impossible. Veuillez vous réauthentifier.");
    };

    window.addEventListener('popstate', bloquerRetourFlèche);

    return () => {
      window.removeEventListener('popstate', bloquerRetourFlèche);
    };
  }, []);

    const handleResetPassword = async (e) => {
      e.preventDefault();
      setResetError('');
      setResetMessage('');

      if (secretCode !== "DRETFP_AMORONIMANIA_2026") {
        setResetError("❌ Clé de sécurité de la Direction invalide.");
        return;
      }

      if (newPassword.length < 6) {
        setResetError("❌ Le nouveau mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      try {
        await API.post('/auth/reset-admin-password', {
          email: resetEmail.trim(),
          new_password: newPassword,
          secret_key: secretCode
        });
        setResetMessage("✅ Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => {
          setShowResetModal(false);
          setResetMessage('');
          setSecretCode('');
          setNewPassword('');
        }, 2500);
      } catch (err) {
        setResetError(err.response?.data?.detail || "Impossible de réinitialiser ce compte.");
      }
    };


  return (
    <div className="login-container">
      <div className="login-card" style={{ borderTop: '4px solid #002f6c' }}>
        <div className="login-header">
          <h2>DRETFP AMORON'I MANIA</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {error && <div className="error-message" style={{ backgroundColor: '#fce8e6', color: '#c5221f', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500', border: '1px solid #fad2cf' }}>{error}</div>}

          <div className="form-group">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>
              Adresse E-mail 
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: admin@dretfp.mg"
              required
              disabled={loading}
              style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#3c4043' }}>
              Mot de passe 
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
              <span
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                style={{
                  fontSize: '0.82rem',
                  color: '#1a73e8',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Mot de passe oublié ?
              </span>
            </div>

          </div>



          <button 
            type="submit" 
            className="btn-login" 
            disabled={loading} 
            style={{ width: '100%', height: '45px', backgroundColor: '#002f6c', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', marginTop: '10px', transition: 'background-color 0.2s' }}
          >
            {loading ? 'Vérification des registres...' : ' Connexion Admin'}
          </button>
        </form>

      </div>
    
     {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderTop: '4px solid #c5221f' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#002f6c' }}>🔑 Réinitialisation Sécurisée</h3>
            <p style={{ fontSize: '0.82rem', color: '#5f6368', marginBottom: '20px' }}>
              Saisissez votre adresse e-mail officielle et la clé de sécurité de la Direction Régionale.
            </p>

            {resetError && <div style={{ backgroundColor: '#fce8e6', color: '#c5221f', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '12px' }}>{resetError}</div>}
            {resetMessage && <div style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '12px' }}>{resetMessage}</div>}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>E-mail Administrateur </label>
                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="admin@dretfp.mg" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: '#b06000' }}>Clé Secrète Direction </label>
                <input type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required placeholder="Code matériel DRETFP" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #b06000', backgroundColor: '#fff9e6', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Nouveau mot de passe </label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowResetModal(false)} style={{ flex: 1, height: '40px', backgroundColor: '#f1f3f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, height: '40px', backgroundColor: '#002f6c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
