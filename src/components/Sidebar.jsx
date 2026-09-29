import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDretfp from '/src/assets/images/logo.jpeg';
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuFileText, 
  LuBriefcase, 
  LuFolder, 
  LuLayers, 
  LuHammer,
  LuSchool,
  LuCalendar,
  LuUserCheck,
  LuChevronDown,
  LuChevronsLeft,
  LuChevronsRight,
  LuAward
} from 'react-icons/lu'; 

const Sidebar = ({ activeMenu, setActiveMenu, notifCount, setNotifCount, filterType, setFilterType, demandes = [], isSidebarOpen, setIsSidebarOpen }) => {
  const [sousMenuOuvert, setSousMenuOuvert] = useState(false);
  const [champOuvert, setChampOuvert] = useState(false);
  const navigate = useNavigate();

  const countAttestationsEnCours = demandes.filter(
    d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'ATTESTATION'
  ).length;

  const countDiplomesEnCours = demandes.filter(
    d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'DIPLOME'
  ).length;

  return (
    <div 
      className="sidebar notranslate" 
      translate="no"
      style={{ 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #dadce0', 
        height: '100vh', 
        padding: '1rem 0', 
        width: isSidebarOpen ? '260px' : '75px', 
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      
      <div className="sidebar-logo" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isSidebarOpen ? 'space-between' : 'center', 
        padding: isSidebarOpen ? '0 1.2rem' : '0', 
        marginBottom: '2rem',
        width: '100%',
        boxSizing: 'border-box',
        height: '40px'
      }}>
        {isSidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logoDretfp} alt="Logo" style={{ width: '35px', height: '34px', borderRadius: '4px' }} />
            <span style={{ fontWeight: 'bold', color: '#3c4043', fontSize: '1.15rem', whiteSpace: 'nowrap' }}>DRETFP</span>
          </div>
        )}

        <button 
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#5f6368',
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: isSidebarOpen ? 'transparent' : '#f1f3f4',
            width: '40px',
            height: '40px',
            flexShrink: 0
          }}
          title={isSidebarOpen ? "Masquer le menu" : "Afficher le menu"}
        >
          {isSidebarOpen ? <LuChevronsLeft /> : <LuChevronsRight />}
        </button>
      </div>

      <ul className="sidebar-menu" style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
        
        <li 
          className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('dashboard')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: '14px', padding: '12px 1.5rem', cursor: 'pointer', color: '#5f6368', whiteSpace: 'nowrap' }}
        >
          <LuLayoutDashboard style={{ fontSize: '1.35rem', flexShrink: 0 }} />
          {isSidebarOpen && <span>Tableau de bord</span>}
        </li>
        
        <li 
          className={`sidebar-item ${activeMenu === 'liste_apprenants' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('liste_apprenants')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: '14px', padding: '12px 1.5rem', cursor: 'pointer', color: '#5f6368', whiteSpace: 'nowrap' }}
        >
          <LuUsers style={{ fontSize: '1.35rem', flexShrink: 0 }} />
          {isSidebarOpen && <span>Liste des Apprenants</span>}
        </li>

        <li 
          className={`sidebar-item ${activeMenu === 'liste_demandes' ? 'active' : ''}`} 
          onClick={() => {
            setActiveMenu('liste_demandes');
            setFilterType('Tous');
            setNotifCount(0);
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', padding: '12px 1.5rem', cursor: 'pointer', color: '#5f6368', whiteSpace: 'nowrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LuFileText style={{ fontSize: '1.35rem', flexShrink: 0 }} />
            {isSidebarOpen && <span>Liste des Demandes</span>}
          </div>
          
          {isSidebarOpen && notifCount > 0 && (
            <span style={{ backgroundColor: '#e53e3e', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>
              {notifCount}
            </span>
          )}
        </li>

        <li 
          className={`sidebar-item ${activeMenu.startsWith('traitement_') ? 'active' : ''}`} 
          onClick={() => isSidebarOpen && setSousMenuOuvert(!sousMenuOuvert)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', padding: '12px 1.5rem', cursor: 'pointer', color: '#5f6368', whiteSpace: 'nowrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LuLayers style={{ fontSize: '1.3rem', flexShrink: 0 }} />
            {isSidebarOpen && <span>Liste des Traitements</span>}
            {isSidebarOpen && (countAttestationsEnCours + countDiplomesEnCours) > 0 && !sousMenuOuvert && (
              <span style={{ backgroundColor: '#dd6b20', color: 'white', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold', flexShrink: 0 }}>
                {countAttestationsEnCours + countDiplomesEnCours}
              </span>
            )}
          </div>
          {isSidebarOpen && <LuChevronDown style={{ fontSize: '0.9rem', color: '#a0aec0', transform: sousMenuOuvert ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />}
        </li>

        {isSidebarOpen && sousMenuOuvert && (
          <ul style={{ listStyle: 'none', paddingLeft: '2.5rem', background: '#f8f9fa' }}>
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'traitement_attestation' ? 'active' : ''}`} 
              onClick={() => { setFilterType('ATTESTATION'); setActiveMenu('traitement_attestation'); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <span>📜 Traitement attestation</span>
              {countAttestationsEnCours > 0 && (
                <span style={{ backgroundColor: '#3182ce', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '8px' }}>
                  {countAttestationsEnCours}
                </span>
              )}
            </li>
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'traitement_diplome' ? 'active' : ''}`} 
              onClick={() => { setFilterType('DIPLOME'); setActiveMenu('traitement_diplome'); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <span>🎓 Traitement diplôme</span>
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
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarOpen ? 'flex-start' : 'center', 
            gap: '12px', 
            padding: '10px 1.5rem', 
            cursor: 'pointer', 
            color: '#5f6368',
            whiteSpace: 'nowrap'
          }}
        >
          <LuSchool style={{ fontSize: '1.2rem', color: '#5f6368', flexShrink: 0 }} />
          {isSidebarOpen && <span>Liste des Établissements</span>}
        </li>

        <li 
          className={`sidebar-item ${activeMenu === 'liste_examens' ? 'active' : ''}`} 
          onClick={() => setActiveMenu('liste_examens')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarOpen ? 'flex-start' : 'center', 
            gap: '14px', 
            padding: '12px 1.5rem', 
            cursor: 'pointer', 
            color: '#5f6368', 
            whiteSpace: 'nowrap' 
          }}
        >
          <LuAward style={{ fontSize: '1.35rem', flexShrink: 0 }} />
          {isSidebarOpen && <span>Examens</span>}
        </li>

        <li 
          className={`sidebar-item ${activeMenu.startsWith('liste_') && ['liste_secteurs', 'liste_filieres', 'liste_metiers'].includes(activeMenu) ? 'active' : ''}`} 
          onClick={() => isSidebarOpen && setChampOuvert(!champOuvert)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarOpen ? 'space-between' : 'center', 
            padding: '10px 1.5rem', 
            cursor: isSidebarOpen ? 'pointer' : 'default', 
            color: '#5f6368',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LuBriefcase style={{ fontSize: '1.2rem', color: '#5f6368', flexShrink: 0 }} />
            {isSidebarOpen && <span>Champ professionnel</span>}
          </div>
          {isSidebarOpen && (
            <LuChevronDown style={{ 
              fontSize: '0.9rem', 
              color: '#a0aec0', 
              transform: champOuvert ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s' 
            }} />
          )}
        </li>

        {isSidebarOpen && champOuvert && (
          <ul style={{ listStyle: 'none', paddingLeft: '2.5rem', background: '#f8f9fa' }}>
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'liste_secteurs' ? 'active' : ''}`} 
              onClick={() => setActiveMenu('liste_secteurs')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <LuFolder style={{ fontSize: '1rem', color: '#718096', flexShrink: 0 }} />
              <span>Secteurs</span>
            </li>
            
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'liste_filieres' ? 'active' : ''}`} 
              onClick={() => setActiveMenu('liste_filieres')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <LuFileText style={{ fontSize: '1rem', color: '#718096', flexShrink: 0 }} />
              <span>Filières</span>
            </li>
            
            <li 
              className={`sidebar-item sub-item ${activeMenu === 'liste_metiers' ? 'active' : ''}`} 
              onClick={() => setActiveMenu('liste_metiers')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <LuHammer style={{ fontSize: '1rem', color: '#718096', flexShrink: 0 }} />
              <span>Métiers</span>
            </li>
          </ul>
        )}

        <li 
          className="sidebar-item" 
          onClick={() => navigate('/saisie-notes')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            gap: '12px', 
            padding: '10px 1.5rem', 
            cursor: 'pointer', 
            color: '#5f6368',
            whiteSpace: 'nowrap'
          }}
        >
          <LuCalendar style={{ fontSize: '1.2rem', color: '#5f6368', flexShrink: 0 }} />
          {isSidebarOpen && <span>Examens & Centres</span>}
        </li>
        
        <li 
          className="sidebar-item" 
          onClick={() => navigate('/login')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            gap: '12px', 
            padding: '10px 1.5rem', 
            cursor: 'pointer', 
            color: '#5f6368',
            whiteSpace: 'nowrap'
          }}
        >
          <LuUserCheck style={{ fontSize: '1.2rem', color: '#5f6368', flexShrink: 0 }} />
          {isSidebarOpen && <span>Utilisateurs</span>}
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;
