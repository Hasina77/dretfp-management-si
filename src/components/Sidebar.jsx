import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDretfp from '/src/assets/images/logo.jpeg'; 

const Sidebar = ({ activeMenu, setActiveMenu, notifCount, setNotifCount, filterType, setFilterType, demandes = [] }) => {
  // 🎯 État local pour gérer l'ouverture et la fermeture de l'accordéon déroulant à symbole
  const [sousMenuOuvert, setSousMenuOuvert] = useState(false);
  const navigate = useNavigate();

  const countAttestationsEnCours = demandes.filter(
    d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'ATTESTATION'
  ).length;

  const countDiplomesEnCours = demandes.filter(
    d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'DIPLOME'
  ).length;

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
          Liste des Apprenants
        </li>

        <li 
          className={`sidebar-item ${activeMenu === 'liste_demandes' ? 'active' : ''}`} 
          onClick={() => {
            setActiveMenu('liste_demandes'); // Ouvre ton tableau global de demandes
            setFilterType('Tous');           // Affiche tout par défaut sur cet onglet
            setNotifCount(0);                // Remet automatiquement le compteur de badge à 0
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

         {/* 🎯 ACCORDÉON DÉROULANT : LISTE DES TRAITEMENTS */}
        <li 
          className={`sidebar-item ${activeMenu.startsWith('traitement_') ? 'active' : ''}`} 
          onClick={() => setSousMenuOuvert(!sousMenuOuvert)}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Liste des Traitements</span>
            {/* Petit badge global jaune si des traitements généraux attendent */}
            {(countAttestationsEnCours + countDiplomesEnCours) > 0 && !sousMenuOuvert && (
              <span style={{ backgroundColor: '#dd6b20', color: 'white', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                {countAttestationsEnCours + countDiplomesEnCours}
              </span>
            )}
          </span>
          
          <span style={{ 
            fontSize: '0.7rem', 
            color: '#a0aec0', 
            transform: sousMenuOuvert ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </li>

        {/* 🎯 SOUS-MENUS AVEC COMPTEURS INDIVIDUELS INTÉGRÉS */}
        {sousMenuOuvert && (
          <ul style={{ 
            listStyle: 'none', 
            paddingLeft: '1.2rem', 
            margin: '4px 0',
            background: '#f7fafc', 
            borderLeft: '3px solid #002f6c',
            borderRadius: '0 4px 4px 0'
          }}>
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'traitement_attestation' ? 'active' : ''}`} 
              onClick={() => {
                setFilterType('ATTESTATION');
                setActiveMenu('traitement_attestation');
              }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <span>Traitement attestation</span>
              
              {/* Badge numérique bleu pour les Attestations en cours */}
              {countAttestationsEnCours > 0 && (
                <span style={{ backgroundColor: '#3182ce', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '8px' }}>
                  {countAttestationsEnCours}
                </span>
              )}
            </li>
            
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'traitement_diplome' ? 'active' : ''}`} 
              onClick={() => {
                setFilterType('DIPLOME');
                setActiveMenu('traitement_diplome');
              }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <span>Traitement diplôme</span>
              
              {/* Badge numérique bleu pour les Diplômes en cours */}
              {countDiplomesEnCours > 0 && (
                <span style={{ backgroundColor: '#3182ce', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '8px' }}>
                  {countDiplomesEnCours}
                </span>
              )}
            </li>
          </ul>
        )}
          
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
