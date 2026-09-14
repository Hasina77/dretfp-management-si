import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoDretfp from '/src/assets/images/logo.jpeg'; // Correspond à la ligne 3 de ton Dashboard

const Sidebar = ({ activeMenu, setActiveMenu, notifCount, setNotifCount }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      {/* En-tête avec logo officiel et texte alignés */}
      <div className="sidebar-logo">
        <img 
          src={logoDretfp} 
          alt="Logo DRETFP" 
          className="logo-img" 
          onError={(e) => { e.target.src = "https://flaticon.com" }} 
        />
        <span>DRETFP</span>
      </div>

      {/* Liste des menus connectés aux états de l'application */}
      <ul className="sidebar-menu">
        <li 
          className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('dashboard')}
        >
          Tableau de bord
        </li>
        
        <li 
          className={`sidebar-item ${activeMenu === 'liste_apprenants' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('liste_apprenants')}
        >
          Liste des apprenants
        </li>

        <li 
          className={`sidebar-item ${activeMenu === 'demandes_entrants' || activeMenu === 'liste_demandes' ? 'active' : ''}`} 
          onClick={() => {
            setActiveMenu('liste_demandes'); // Ouvre ton tableau de demandes
            setNotifCount(0); // Remet automatiquement le compteur à 0 lors du clic
          }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>Liste des Demandes</span>
          
          {/* Badge rouge chiffré dynamique */}
          {notifCount > 0 && (
            <span style={{ 
              backgroundColor: '#e53e3e', 
              color: 'white', 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              padding: '2px 8px', 
              borderRadius: '10px' 
            }}>
              {notifCount}
            </span>
          )}
        </li>

        <li 
          className={`sidebar-item ${activeMenu === '' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('')}
        >
          Stock par Etablissement
        </li>
        
        <li 
          className={`sidebar-item ${activeMenu === 'liste_etablissements' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('liste_etablissements')}
        >
          Liste des Établissements
        </li>
        
        {/* Redirections vers les autres tables de routage React */}
        <li className="sidebar-item" onClick={() => navigate('/saisie-notes')}>
          Examens & Centres
        </li>
        
        <li className="sidebar-item" onClick={() => navigate('/login')}>
          Utilisateurs
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
