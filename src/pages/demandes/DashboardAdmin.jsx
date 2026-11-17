import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDretfp from '/src/assets/images/logo.jpeg';
import Sidebar from '/src/components/Sidebar';
import * as XLSX from 'xlsx';
import API from '../../services/api'; 
import './DashboardAdmin.css';
import PortailPublic from './PortailPublic';

import { 
  LuUserPlus,
  LuHistory     
} from 'react-icons/lu';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  PieChart, Cell, LineChart, CartesianGrid, LabelList 
} from 'recharts';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const DashboardAdmin = () => {


  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedApprenant, setSelectedApprenant] = useState(null);
  const [modalMode, setModalMode] = useState('');

  const [activeMenu, setActiveMenu] = useState(() => {
    return sessionStorage.getItem('admin_active_tab') || 'dashboard';
    });

    useEffect(() => {
      sessionStorage.setItem('admin_active_tab', activeMenu);
    }, [activeMenu]);



  const [listeEtablissements, setListeEtablissements] = useState([]);
  const [listeSecteurs, setListeSecteurs] = useState([]);
  const [listeFilieres, setListeFilieres] = useState([]);
  const [listeMetiers, setListeMetiers] = useState([]);

  const [apprenants, setApprenants] = useState([]);
  const [searchApprenant, setSearchApprenant] = useState('');
  const [selEtablissementId, setSelEtablissementId] = useState('Tous');
  const [selSecteurId, setSelSecteurId] = useState('Tous');
  const [selFiliereId, setSelFiliereId] = useState('Tous');
  const [selMetierId, setSelMetierId] = useState('Tous');

  const [listeExamens, setListeExamens] = useState([]);
  const [searchExamen, setSearchExamen] = useState('');
  const [showExamenModal, setShowExamenModal] = useState(false);
  const [examenModalMode, setExamenModalMode] = useState('ajouter');
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [openExamenMenuId, setOpenExamenMenuId] = useState(null);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showTraiteModal, setShowTraiteModal] = useState(false);

  const [showEnLigneModal, setShowEnLigneModal] = useState(false);
  const [demandesCochees, setDemandesCochees] = useState([]);
  const [apprenantsCoches, setApprenantsCoches] = useState([]);
  const [demandesTraitementCochees, setDemandesTraitementCochees] = useState([]);
  const [diplomesCoches, setDiplomesCoches] = useState([]);
  const [demandesListeCochees, setDemandesListeCochees] = useState([]);
  const [demandesEnLigneCochees, setDemandesEnLigneCochees] = useState([]);

  const [showDetailsEvolution, setShowDetailsEvolution] = useState(false);

  const [selectedAutreCentreId, setSelectedAutreCentreId] = useState('');

  const [openCardMenuId, setOpenCardMenuId] = useState(null); 
  const [selectedChefView, setSelectedChefView] = useState(null);
  const [chefEditForm, setChefEditForm] = useState({ nom: '', prenom: '', email: '', telephone: '', username: '', statut: 'ACTIF' });


  const [preselectedEtabId, setPreselectedEtabId] = useState('');
  const [showAddChefModal, setShowAddChefModal] = useState(false);
  const [chefsCentre, setChefsCentre] = useState([]);
  const [openChefMenuId, setOpenChefMenuId] = useState(null);
  const [selectedChefEtabId, setSelectedChefEtabId] = useState(null);
  const [subApprenantsCoches, setSubApprenantsCoches] = useState([]);
  const [notifChefsCount, setNotifChefsCount] = useState(0);
  const verifierNotificationsChefs = async () => {
    try {
      const response = await API.get('/documents/notifications-attente');
      setNotifChefsCount(response.data.notifications_count);
    } catch (err) {
      console.error("⚠️ Impossible de charger les notifications de fiches candidats :", err);
    }
  };

  useEffect(() => {
    verifierNotificationsChefs(); 
    
    const intervalle = setInterval(() => {
      verifierNotificationsChefs();
    }, 30000); 

    return () => clearInterval(intervalle); 
  }, []);

  

  const [listeExamensDashboard, setListeExamensDashboard] = useState([]);

    useEffect(() => {
      const chargerExamensPourStats = async () => {
        try {
          const res = await API.get('/examens/liste');
          setListeExamensDashboard(res.data || []);
        } catch (err) {
          console.error("Erreur chargement examens dashboard :", err);
        }
      };
      chargerExamensPourStats();
    }, []);

  const [statsChampProData, setStatsChampProData] = useState({
      secteurs: 0,
      filieres: 0,
      metiers: 0
    });

    useEffect(() => {
    const chargerChampProStats = async () => {
      try {
        const extraireListe = (res) => {
          if (!res || !res.data) return [];
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data.items)) return res.data.items;
          if (Array.isArray(res.data.data)) return res.data.data;
          return [];
        };

        const [resSec, resFil, resMet] = await Promise.all([
          API.get('/secteurs').catch(() => API.get('/secteurs/liste')).catch(() => ({ data: [] })),
          API.get('/filieres').catch(() => API.get('/filieres/liste')).catch(() => ({ data: [] })),
          API.get('/metiers').catch(() => API.get('/metiers/liste')).catch(() => ({ data: [] }))
        ]);

        setStatsChampProData({
          secteurs: extraireListe(resSec).length,
          filieres: extraireListe(resFil).length,
          metiers: extraireListe(resMet).length
        });
      } catch (err) {
        console.error("Erreur chargement stats Champ Pro :", err);
      }
    };

    chargerChampProStats();
  }, []);
    

    const [nbChefsDashboard, setNbChefsDashboard] = useState(0);

    useEffect(() => {
      const chargerNombreChefs = async () => {
        try {
          const res = await API.get('/chefs-centre').catch(() => API.get('/chefs-centre/liste'));
          
          if (Array.isArray(res.data)) {
            setNbChefsDashboard(res.data.length);
          } else if (res.data && Array.isArray(res.data.items)) {
            setNbChefsDashboard(res.data.items.length);
          }
        } catch (err) {
          console.error("Erreur chargement compteur chefs :", err);
        }
      };

      chargerNombreChefs();
    }, []);


  const [openDemandeMenuId, setOpenDemandeMenuId] = useState(null);
  const [openTraitementMenuId, setOpenTraitementMenuId] = useState(null);

  
  const [search, setSearch] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('Tous');
  const [filterFiliere, setFilterFiliere] = useState('Tous');
  const [filterCentre, setFilterCentre] = useState('Tous');
  const [filterType, setFilterType] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const [notifCount, setNotifCount] = useState(0);

  
  const [apprenantsRégion, setApprenantsRégion] = useState([]);

  const [modalEtabId, setModalEtabId] = useState('');
  const [modalSecteurId, setModalSecteurId] = useState('');
  const [modalFiliereId, setModalFiliereId] = useState('');
  const [modalMetierId, setModalMetierId] = useState('');


   
  const [demandes, setDemandes] = useState([]);
  const [searchNomIm, setSearchNomIm] = useState('');
  const [filterDoc, setFilterDoc] = useState('Tous');
  const [filterStatutDemande, setFilterStatutDemande] = useState('Tous');

  
  const [searchSecteur, setSearchSecteur] = useState('');
  const [openSecteurMenuId, setOpenSecteurMenuId] = useState(null);
  const [showSecteurModal, setShowSecteurModal] = useState(false);
  const [secteurModalMode, setSecteurModalMode] = useState(''); 
  const [selectedSecteur, setSelectedSecteur] = useState(null);
    
  const secteursVisualises = (listeSecteurs || []).filter(sec => {
    if (!sec) return false;
    
    const codeSecteur = `SEC-${sec.id_secteur || sec.id || ''}`.toLowerCase();
    const nomSecteur = (sec.nom_secteur || '').toLowerCase();
    
    const nomEtab = (listeEtablissements.find(e => (e.id_etablissement || e.id) === sec.etablissement_id)?.nom_etablissement || '').toLowerCase();
    
    const saisie = searchSecteur.toLowerCase();
    
    return codeSecteur.includes(saisie) || nomSecteur.includes(saisie) || nomEtab.includes(saisie);
  });

  const [searchFiliere, setSearchFiliere] = useState('');
  const [openFiliereMenuId, setOpenFiliereMenuId] = useState(null);
  const [showFiliereModal, setShowFiliereModal] = useState(false);
  const [filiereModalMode, setFiliereModalMode] = useState(''); 
  const [selectedFiliere, setSelectedFiliere] = useState(null);

  const [searchMetier, setSearchMetier] = useState('');
  const [openMetierMenuId, setOpenMetierMenuId] = useState(null);
  const [showMetierModal, setShowMetierModal] = useState(false);
  const [metierModalMode, setMetierModalMode] = useState('');
  const [selectedMetier, setSelectedMetier] = useState(null);

  const [nouvelApprenantExamen, setNouvelApprenantExamen] = useState('');
  const [nouvelApprenantSecteur, setNouvelApprenantSecteur] = useState('');
  const [nouvelApprenantFiliere, setNouvelApprenantFiliere] = useState('');
  const [nouvelApprenantMetier, setNouvelApprenantMetier] = useState('');

  const [searchTraitement, setSearchTraitement] = useState('');
  const [sessionTraitement, setSessionTraitement] = useState('Tous');
  const [filterDocTraitement, setFilterDocTraitement] = useState('Tous');
  const [filterCentreTraitement, setFilterCentreTraitement] = useState('Tous');
  const [filterStatutTraitement, setFilterStatutTraitement] = useState('Tous');


  const [documentsChef, setDocumentsChef] = useState([]);
  const [loadingDocsChef, setLoadingDocsChef] = useState(false);

  const chargerDocumentsDuChef = async (idEtab) => {
    if (!idEtab) return;
    setLoadingDocsChef(true);
    try {
      const res = await API.get(`/documents/${idEtab}`);
      setDocumentsChef(res.data || []);
    } catch (err) {
      console.error("Erreur chargement documents :", err);
      setDocumentsChef([]);
    } finally {
      setLoadingDocsChef(false);
    }
  };


 
const [parametresSysteme, setParametresSysteme] = useState(() => {
  const saved = localStorage.getItem('dretfp_parametres_systeme');
  return saved ? JSON.parse(saved) : {
    nomDirection: "DRETFP AMORON'I MANIA",
    adresseBureau: "Ambositra 306, Région Amoron'i Mania",
    nomSignataire: "Le Directeur Régional",
    sessionActive: "2026",
    portailDemandesOuvert: true,
    saisieTerrainOuverte: true,
    moyenneAdmission: 10,
    seuilAssezBien: 12,
    seuilBien: 14,
    seuilTresBien: 16,
    retentionHistoriqueJours: 90,
    cleSecreteDirection: "DRETFP_AMORONIMANIA_2026",
    emailNotification: "dretfp.amoronimania@gmail.com",
    modeleMessageWhatsApp: "Bonjour {NOM}, votre {TITRE} est signé(e) et prêt(e) au retrait à la DRETFP Ambositra."
  };
});

const [showSecretKey, setShowSecretKey] = useState(false);
const [pwdForm, setPwdForm] = useState({
  email: localStorage.getItem('user_email') || '',
  ancienPassword: '',
  nouveauPassword: '',
  confirmerPassword: ''
});
const [pwdLoading, setPwdLoading] = useState(false);

const handleUpdateAdminPassword = async () => {
  if (!pwdForm.email || !pwdForm.ancienPassword || !pwdForm.nouveauPassword) {
    alert("⚠️ Veuillez remplir tous les champs du mot de passe.");
    return;
  }
  if (pwdForm.nouveauPassword !== pwdForm.confirmerPassword) {
    alert("❌ La confirmation du nouveau mot de passe ne correspond pas.");
    return;
  }

  setPwdLoading(true);
  try {
    await API.put('/auth/change-admin-password', {
      email: pwdForm.email,
      ancien_password: pwdForm.ancienPassword,
      nouveau_password: pwdForm.nouveauPassword
    });
    alert("✅ Votre mot de passe administrateur a été modifié avec succès !");
    setPwdForm({ ...pwdForm, ancienPassword: '', nouveauPassword: '', confirmerPassword: '' });
  } catch (err) {
    alert(err.response?.data?.detail || "❌ Erreur lors de la modification du mot de passe.");
  } finally {
    setPwdLoading(false);
  }
};

const handleSaveParametres = (e) => {
  e.preventDefault();
  localStorage.setItem('dretfp_parametres_systeme', JSON.stringify(parametresSysteme));
  alert("✅ Paramètres généraux de la DRETFP enregistrés avec succès !");
};


  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('dretfp_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'ADMIN_DRETFP') {
      alert("🔒 Accès interdit : Session expirée ou privilèges insuffisants.");
      localStorage.clear();
      navigate('/login', { replace: true });
      return;
    }

    setIsAuthorized(true);
  }, [navigate]);

 
  const chargerChefsCentre = async () => {
    try {
      const response = await API.get('/chefs-centre/liste');
      setChefsCentre(response.data);
    } catch (err) {
      console.error("❌ Impossible de récupérer la liste des chefs de centre depuis MySQL :", err);
    }
  };

  useEffect(() => {
    if (['liste_apprenants', 'liste_secteurs', 'liste_filieres', 'liste_metiers'].includes(activeMenu)) {
      chargerApprenants();
      if (typeof chargerNomenclaturesBdd === 'function') {
        chargerNomenclaturesBdd();
      }
    }
    if (activeMenu === 'resultat_etablissement') {
      chargerChefsCentre();
    }
  }, [activeMenu]);

  const [listeHistorique, setListeHistorique] = useState([]);

  const chargerHistorique = async () => {
  try {
    const jours = parametresSysteme.retentionHistoriqueJours || 90;
    const res = await API.get(`/historique/liste?jours=${jours}`);
    setListeHistorique(res.data || []);
  } catch (err) {
    console.error("Erreur chargement historique :", err);
  }
};


    useEffect(() => {
      if (activeMenu === 'historique') {
        chargerHistorique();
      }
    }, [activeMenu]);

    const [selectedHistoriqueIds, setSelectedHistoriqueIds] = useState([]);

    const handleToggleSelectHistorique = (id) => {
      setSelectedHistoriqueIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };

    const handleSelectAllHistorique = (e) => {
      if (e.target.checked) {
        setSelectedHistoriqueIds(listeHistorique.map((item) => item.id_historique));
      } else {
        setSelectedHistoriqueIds([]);
      }
    };

    const handleSupprimerHistoriqueSelection = async () => {
      if (selectedHistoriqueIds.length === 0) return;

      if (!window.confirm(`🗑️ Voulez-vous supprimer définitivement ces ${selectedHistoriqueIds.length} événement(s) de l'historique ?`)) {
        return;
      }

      try {
        await API.post('/historique/supprimer-selection', {
          ids: selectedHistoriqueIds
        });
        setSelectedHistoriqueIds([]);
        chargerHistorique();
        alert("✅ Événements sélectionnés supprimés avec succès.");
      } catch (err) {
        console.error("Erreur lors de la suppression :", err);
        alert("❌ Impossible de supprimer la sélection.");
      }
    };
   


   const chargerNomenclaturesBdd = async () => {
    try {
      const [resEtab, resSec, resFil, resMet] = await Promise.all([
        API.get('/etablissements/liste'),
        API.get('/secteurs/liste'),
        API.get('/filieres/liste'),
        API.get('/metiers/liste')
      ]);
      
      setListeEtablissements(resEtab.data);
      setListeSecteurs(resSec.data);
      setListeFilieres(resFil.data);
      setListeMetiers(resMet.data);
    } catch (err) {
      console.error("Erreur lors du chargement des tables relationnelles indépendantes");
    }
  };

  useEffect(() => {
    chargerNomenclaturesBdd();
  }, []);
  const etablissementsOptions = listeEtablissements.filter(e => 
    [...new Set((apprenants || []).map(a => a.etablissement_id))].includes(e.id_etablissement || e.id)
  );

  const secteursOptions = listeSecteurs.filter(s => 
    [...new Set(
      (apprenants || [])
        .filter(a => selEtablissementId === 'Tous' || a.etablissement_id?.toString() === selEtablissementId.toString()) 
        .map(a => a.secteur_id)
    )].includes(s.id_secteur || s.id)
  );

  const filieresOptions = listeFilieres.filter(f => 
    [...new Set(
      (apprenants || [])
        .filter(a => selEtablissementId === 'Tous' || a.etablissement_id?.toString() === selEtablissementId.toString()) 
        .filter(a => selSecteurId === 'Tous' || a.secteur_id?.toString() === selSecteurId.toString())
        .map(a => a.filiere_id)
    )].includes(f.id_filiere || f.id)
  );

  const metiersOptions = listeMetiers.filter(m => 
    [...new Set(
      (apprenants || [])
        .filter(a => selEtablissementId === 'Tous' || a.etablissement_id?.toString() === selEtablissementId.toString()) 
        .filter(a => selSecteurId === 'Tous' || a.secteur_id?.toString() === selSecteurId.toString())
        .filter(a => selFiliereId === 'Tous' || a.filiere_id?.toString() === selFiliereId.toString())
        .map(a => a.metier_id)
    )].includes(m.id_metier || m.id)
  );

  
  
  useEffect(() => {
    chargerApprenants();
  }, [search, filterAnnee, filterFiliere, filterCentre]);

  const sauvegarderModification = async (id, donneesModifiees) => {
    try {
      await API.put(`/apprenants/modifier/${id}`, donneesModifiees);
      alert("Données mises à jour avec succès dans la base centrale DRETFP !");
      chargerApprenants();
    } catch (err) {
      alert("Erreur lors de la modification en BDD.");
    }
  };


  useEffect(() => {
  if (activeMenu === 'resultat_etablissement' && typeof chargerChefsCentre === 'function') {
    const intervalle = setInterval(() => {
      chargerChefsCentre();
    }, 15000); 
    return () => clearInterval(intervalle);
  }
}, [activeMenu]);

  const supprimerApprenant = async (id) => {
    if (window.confirm("⚠️ Confirmez-vous la radiation définitive de cet apprenant du registre ?")) {
      
      try {
        await API.delete(`/apprenants/supprimer/${id}`);
        
        setApprenantsRégion(apprenantsRégion.filter(item => item.id_apprenant !== id));
        alert("🗑️ Apprenant supprimé avec succès de la base de données centrale.");
        
      } catch (err) {
        console.warn("FastAPI non connecté. Exécution de la suppression en mode local simulé.");
        
        setApprenantsRégion(apprenantsRégion.filter(item => item.id_apprenant !== id));
        alert("📥 Mode démo : L'apprenant a été retiré localement de l'interface.");
      }
    }
  };

  useEffect(() => {
    if (typeof chargerExamens === 'function') {
      chargerExamens(); 
    }
  }, []); 

  const exporterVersExcel = () => {
    if (!apprenantsFiltres || apprenantsFiltres.length === 0) {
      alert("⚠️ Aucun apprenant à exporter pour les critères sélectionnés.");
      return;
    }

    for (const item of apprenantsFiltres) {
      const matriculeAVerifier = String(item.im_apprenant || "").trim().toUpperCase();
      
      let elementValide = true;
      if (matriculeAVerifier.length !== 12) {
        elementValide = false;
      } else if (matriculeAVerifier.charAt(3) !== '-' || matriculeAVerifier.charAt(8) !== '-') {
        elementValide = false;
      } else {
        const milieu = matriculeAVerifier.substring(4, 8);
        if (isNaN(milieu) || milieu.includes(' ')) {
          elementValide = false;
        }
      }

      if (!elementValide) {
        alert(`🚨 EXPORTATION BLOQUÉE (MATRICULE INCORRECT) :\n\nL'apprenant "${item.nom_apprenant} ${item.prenom_apprenant || ''}" possède un numéro matricule non conforme en base de données : "${matriculeAVerifier || 'VIDE'}".\n\nStructure exigée : XXX-0000-XXX (Les 4 caractères du centre doivent être STRICTEMENT des CHIFFRES).\n\nVeuillez corriger ou mettre à jour la fiche de cet élève avant de pouvoir exporter le registre.`);
        return;
      }
    }

    const donneesExcel = apprenantsFiltres.map((item, index) => {
      const nomEtab = (listeEtablissements || []).find(e => 
        (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === item.etablissement_id?.toString()
      )?.nom_etablissement || `Établissement N°${item.etablissement_id}`;

      const nomSec = (listeSecteurs || []).find(s => 
        (s.id_secteur ?? s.id)?.toString() === item.secteur_id?.toString()
      )?.nom_secteur || `Secteur N°${item.secteur_id}`;

      const nomFil = (listeFilieres || []).find(f => 
        (f.id_filiere ?? f.id)?.toString() === item.filiere_id?.toString()
      )?.nom_filiere || `Filière N°${item.filiere_id}`;

      const nomMet = (listeMetiers || []).find(m => 
        (m.id_metier ?? m.id)?.toString() === item.metier_id?.toString()
      )?.nom_metier || `Métier N°${item.metier_id}`;

      let datePropre = item.date_naiss;
      if (datePropre && !datePropre.includes('/')) {
        const testDate = new Date(datePropre);
        if (!isNaN(testDate.getTime())) {
          datePropre = testDate.toLocaleDateString('fr-FR');
        }
      }

      
      return {
        'Matricule (IM)': String(item.im_apprenant).trim().toUpperCase(),
        'Nom': String(item.nom_apprenant || "").toUpperCase().trim(),
        'Prénoms': String(item.prenom_apprenant || "").trim(),
        'Date de Naissance': datePropre,
        'Lieu de Naissance': String(item.lieu_naiss || "").toUpperCase().trim(),
        'Examen': String(item.examen_id || "").toUpperCase().trim(),
        'Session': item.session || 2026,
        'Mention': item.mention || "Passable",
        'Établissement': nomEtab, 
        'Secteur': nomSec,        
        'Filière': nomFil,         
        'Métier': nomMet
      };
    });

    const feuille = XLSX.utils.json_to_sheet(donneesExcel);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, "Registre Apprenants");
    
    const anneeFichier = filterAnnee || 2026;
    XLSX.writeFile(classeur, `Registre_Apprenants_DRETFP_${anneeFichier}.xlsx`);
  };

  const importerDepuisExcel = (e) => {
    const file = e.target.files[0];  
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const nombreFeuille = workbook.SheetNames[0]; 
        const feuille = workbook.Sheets[nombreFeuille];
        
        const listeImportee = XLSX.utils.sheet_to_json(feuille);
        
        if (listeImportee.length === 0) {
          alert("⚠️ Le fichier Excel sélectionné ne contient aucune ligne valide !");
          return;
        }

        for (let i = 0; i < listeImportee.length; i++) {
          const row = listeImportee[i];
          const matriculeBrut = String(row['Matricule (IM)'] || row['im_apprenant'] || row['Matricule'] || row['IM'] || "").trim().toUpperCase();
          
          let ligneValide = true;
          if (matriculeBrut.length !== 12) {
            ligneValide = false;
          } else if (matriculeBrut.charAt(3) !== '-' || matriculeBrut.charAt(8) !== '-') {
            ligneValide = false;
          } else {
            const milieu = matriculeBrut.substring(4, 8);
            if (isNaN(milieu) || milieu.includes(' ')) {
              ligneValide = false;
            }
          }

          if (!ligneValide) {
            alert(`🚨 REJET STRICT DE L'IMPORTATION EXCEL :\n\nÀ la ligne numéro ${i + 2} du fichier, le numéro matricule "${matriculeBrut || 'VIDE'}" n'est pas conforme.\n\nStructure obligatoire exigée : XXX-0000-XXX (Ex: 1HG-0001-DRT).`);
            e.target.value = "";
            return;
          }
        }

        const apprenantsFormates = listeImportee.map((row) => {
          const etabTexte = String(row['Établissement'] || row['etablissement_id'] || "").trim().toLowerCase();
          const secteurTexte = String(row['Secteur'] || row['secteur_id'] || "").trim().toLowerCase();
          const filiereTexte = String(row['Filière'] || row['filiere_id'] || "").trim().toLowerCase();
          const metierTexte = String(row['Métier'] || row['metier_id'] || "").trim().toLowerCase();
          const nomExamenExcel = (
            row['Examen'] || 
            row['examen'] || 
            row['EXAMEN'] || 
            row['Examen '] || 
            ''
          ).toString().trim().toUpperCase();
          const etabTrouve = (listeEtablissements || []).find(e => 
            String(e.nom_etablissement || e.nom || "").trim().toLowerCase() === etabTexte
          );
          const secteurTrouve = (listeSecteurs || []).find(s => 
            String(s.nom_secteur || s.nom || "").trim().toLowerCase() === secteurTexte
          );
          const filiereTrouve = (listeFilieres || []).find(f => 
            String(f.nom_filiere || f.nom || "").trim().toLowerCase() === filiereTexte
          );
          const metierTrouve = (listeMetiers || []).find(m => 
            String(m.nom_metier || m.nom || "").trim().toLowerCase() === metierTexte
          );
          const examenTrouve = (listeExamens || examens || []).find((ex) => {
            const nomBase = (ex.nom_exam || ex.nom_examen || '').toString().trim().toUpperCase();
            return nomBase === nomExamenExcel;
          });

          const examen_id_final = examenTrouve ? (examenTrouve.id_examen ?? examenTrouve.id) : null;

          const finalEtabId = etabTrouve ? (etabTrouve.id_etablissement ?? etabTrouve.id ?? etabTrouve.id_centre) : 1;
          const finalSecteurId = secteurTrouve ? (secteurTrouve.id_secteur ?? secteurTrouve.id) : 1;
          const finalFiliereId = filiereTrouve ? (filiereTrouve.id_filiere ?? filiereTrouve.id) : 1;
          const finalMetierId = metierTrouve ? (metierTrouve.id_metier ?? metierTrouve.id) : 1;
          const finalExamenId = examenTrouve ? (examenTrouve.id_examen ?? examenTrouve.id) : 1;

          return {
            im_apprenant: String(row['Matricule (IM)'] || row['im_apprenant'] || row['Matricule'] || row['IM'] || "").trim().toUpperCase(),
            nom_apprenant: String(row['Nom'] || row['nom_apprenant'] || 'INCONNU').toUpperCase().trim(),
            prenom_apprenant: String(row['Prénoms'] || row['prenom_apprenant'] || "").trim(),
            date_naiss: String(row['Date de Naissance'] || row['date_naiss'] || '2000-01-01').trim(),
            lieu_naiss: String(row['Lieu de Naissance'] || row['lieu_naiss'] || 'INCONNU').toUpperCase().trim(),
            
            examen_id: String(finalExamenId),
            
            etablissement_id: parseInt(finalEtabId, 10) || 1,
            secteur_id: parseInt(finalSecteurId, 10) || 1,
            filiere_id: parseInt(finalFiliereId, 10) || 1,
            metier_id: parseInt(finalMetierId, 10) || 1,
            
            session: parseInt(row['Session'] || row['session'], 10) || 2026,
            mention: String(row['Mention'] || row['mention'] || 'Passable').trim(),           
            progression: String(row['Statut Parcours'] || row['Statut Demande'] || row['progression'] || 'AUCUNE_DEMANDE').trim()
          };
        });


        console.log("📦 [DONNÉES ENVOYÉES À FASTAPI] :", { apprenants: apprenantsFormates });

        try {
          const response = await API.post('http://localhost:8000/api/apprenants/import-bulk', { apprenants: apprenantsFormates });
          
          alert(`✅ Importation en masse réussie ! ${apprenantsFormates.length} apprenants ont été synchronisés et enregistrés avec succès dans MySQL.`);
          
          if (typeof chargerApprenants === 'function') {
            await chargerApprenants();
          }
        } catch (apiErr) {
          console.error("❌ Détails de l'erreur réseau :", apiErr);
          if (apiErr.response && apiErr.response.data && apiErr.response.data.detail) {
            console.log("🚨 [FASTAPI EXPLICATION CRASH] :", apiErr.response.data.detail);
            alert(`⚠️ Rejet FastAPI (422) :\n\n${JSON.stringify(apiErr.response.data.detail)}`);
          } else {
            alert("⚠️ Échec d'enregistrement de masse : Le serveur FastAPI local sur le port 8000 ne répond pas.");
          }
        }


      } catch (parseErr) {
        console.error(parseErr);
        alert("⚠️ Le format ou l'arborescence du fichier Excel n'est pas lisible.");
      }
    };
    reader.readAsArrayBuffer(file);
    
    e.target.value = "";
  };



  const chargerApprenants = async () => {
    try {
      const response = await API.get('/apprenants/liste'); 
      setApprenants(response.data); 
    } catch (err) {
      console.error("Erreur lors de la récupération des apprenants");
    }
  };

  useEffect(() => {
    if (['liste_apprenants', 'liste_secteurs', 'liste_filieres', 'liste_metiers'].includes(activeMenu)) {
      chargerApprenants();
     if (typeof chargerNomenclaturesBdd === 'function') {
        chargerNomenclaturesBdd();
      }
    }
  }, [activeMenu]);


  const apprenantsFiltres = (typeof apprenants !== 'undefined' ? apprenants : (typeof apprenantsRégion !== 'undefined' ? apprenantsRégion : [])).filter(item => {
    if (!item) return false;

    let texteRecherche = "";
    if (typeof search !== 'undefined') texteRecherche = search;
    else if (typeof searchQuery !== 'undefined') texteRecherche = searchQuery;
    
    const nomComplet = `${item.nom_apprenant || ""} ${item.prenom_apprenant || ""}`.toLowerCase();
    const rechercheNettoyee = String(texteRecherche).toLowerCase().trim();
    const matchSearch = !rechercheNettoyee || 
      nomComplet.includes(rechercheNettoyee) || 
      (item.im_apprenant || "").toString().includes(rechercheNettoyee);

    let anneeFiltreVal = "Tous";
    if (typeof filterAnnee !== 'undefined') anneeFiltreVal = filterAnnee.toString();
    const matchAnnee = anneeFiltreVal === 'Tous' || (item.session || "").toString() === anneeFiltreVal;

    let etabFiltreVal = "Tous";
    if (typeof selEtablissementId !== 'undefined') etabFiltreVal = selEtablissementId.toString();
    else if (typeof filterCentre !== 'undefined') etabFiltreVal = filterCentre.toString();
    const matchCentre = etabFiltreVal === 'Tous' || (item.etablissement_id || "").toString() === etabFiltreVal;

    let secteurFiltreVal = "Tous";
    if (typeof selSecteurId !== 'undefined') secteurFiltreVal = selSecteurId.toString();
    const matchSecteur = secteurFiltreVal === 'Tous' || (item.secteur_id || "").toString() === secteurFiltreVal;

    let filiereFiltreVal = "Tous";
    if (typeof selFiliereId !== 'undefined') filiereFiltreVal = selFiliereId.toString();
    else if (typeof filterFiliere !== 'undefined') filiereFiltreVal = filterFiliere.toString();
    const matchFiliere = filiereFiltreVal === 'Tous' || (item.filiere_id || "").toString() === filiereFiltreVal;

    let metierFiltreVal = "Tous";
    if (typeof selMetierId !== 'undefined') metierFiltreVal = selMetierId.toString();
    const matchMetier = metierFiltreVal === 'Tous' || (item.metier_id || "").toString() === metierFiltreVal;

    return matchSearch && matchAnnee && matchCentre && matchSecteur && matchFiliere && matchMetier;
  });

  const catalogueGlobalDemandes = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
  
  const diplomesTraitesFiltres = catalogueGlobalDemandes.filter(d => {
    const estUnDiplome = (d.type_document || "").toUpperCase() === 'DIPLOME';
    
    const estValide = ['EN_TRAITEMENT', 'EN_COURS', 'OBTENU', 'TERMINER', 'EN_ATTENTE'].includes((d.statut || "").toUpperCase());
    if (!estUnDiplome || !estValide) return false;

    const texteRecherche = searchTraitement.toLowerCase().trim();
    const matchTexte = !texteRecherche || 
      (d.nom_complet || "").toLowerCase().includes(texteRecherche) ||
      (d.im_apprenant || "").toString().toLowerCase().includes(texteRecherche);

    const matchSession = sessionTraitement === 'Tous' || 
      (d.session || "").toString() === sessionTraitement.toString();

    const centreDmd = (d.centre_examen || "LTP AMBOSITRA").toUpperCase();
    const matchCentre = filterCentreTraitement === 'Tous' || centreDmd === filterCentreTraitement.toUpperCase();

    const statutDmd = (d.statut || "EN_TRAITEMENT").toUpperCase();
    const matchStatut = filterStatutTraitement === 'Tous' || statutDmd === filterStatutTraitement.toUpperCase();

    return matchTexte && matchSession && matchCentre && matchStatut;
  });

 

  const demandesFiltrees = (demandes || []).filter(item => {
    if (!item) return false;

    const statutItem = (item.statut || "EN_ATTENTE").toString().toUpperCase();
    const estPrisEnCharge = ['RECU', 'EN_TRAITEMENT', 'EN_COURS', 'TERMINER', 'OBTENU'].includes(statutItem);
    if (!estPrisEnCharge) return false;

    const nomAchercher = (item.nom_complet || item.nom || "").toString().toLowerCase();
    const imAchercher = (item.im_apprenant || item.matricule || "").toString().toLowerCase();
    const saisie = (searchNomIm || "").toLowerCase().trim();
    const matchSearch = nomAchercher.includes(saisie) || imAchercher.includes(saisie);

    const docItem = (item.type_document || item.type || "").toString().toUpperCase();
    const matchDoc = filterDoc === 'Tous' || docItem === filterDoc.toUpperCase();

    const centreItem = (item.centre_examen || item.centre || "").toString().toLowerCase();
    const matchCentre = filterCentre === 'Tous' || centreItem === filterCentre.toLowerCase();

    const matchStatut = filterStatutDemande === 'Tous' || statutItem === filterStatutDemande.toUpperCase();

    return matchSearch && matchDoc && matchCentre && matchStatut;
  });


  const apprenantsVisualises = (apprenants || []).filter(app => {
    if (!app) return false;

    const nomComplet = `${app.nom_apprenant || ''} ${app.prenom_apprenant || ''}`.toLowerCase();
    const imApprenant = (app.im_apprenant || '').toString().toLowerCase();
    const saisie = searchApprenant.toLowerCase();
    const matchSearch = nomComplet.includes(saisie) || imApprenant.includes(saisie);
    const matchEtab = selEtablissementId === 'Tous' || (app.etablissement_id || app.centre) === selEtablissementId;
    const matchSecteur = selSecteurId === 'Tous' || app.secteur === selSecteurId;
    const matchFiliere = selFiliereId === 'Tous' || app.filiere === selFiliereId;
    const matchMetier = selMetierId === 'Tous' || (app.metier || app.specialite) === selMetierId;

    return matchSearch && matchEtab && matchSecteur && matchFiliere && matchMetier;
  });



  const [documentSelectionne, setDocumentSelectionne] = useState('ATTESTATION'); 

  const transfererVersDemandes = async (apprenant, typeDoc, isGroup = false) => {
    if (!apprenant) return;

    const demandeExisteDeja = (demandes || []).some((demande) => {
      const demMatricule = (demande.im_apprenant || demande.matricule || "").toString().trim().toLowerCase();
      const appMatricule = (apprenant.im_apprenant || "").toString().trim().toLowerCase();
      const demType = (demande.type_document || demande.type || "").toString().trim().toLowerCase();
      const appType = (typeDoc || "").toString().trim().toLowerCase();
      
      return demMatricule === appMatricule && demType === appType;
    });

    if (demandeExisteDeja) {
      alert(`⚠️ Action Interdite : Cet apprenant a déjà une demande de ${typeDoc.toLowerCase()} enregistrée !`);
      return;
    }

    const etabTrouve = (listeEtablissements || []).find(e => 
      (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === apprenant.etablissement_id?.toString()
    );
    const nomCentreExamen = etabTrouve ? (etabTrouve.nom_etablissement || etabTrouve.nom) : "Centre non spécifié";
    const prenomPart = apprenant.prenom_apprenant ? ` ${apprenant.prenom_apprenant}` : "";
    const nomCompletCalcule = `${apprenant.nom_apprenant}${prenomPart}`.trim().toUpperCase();

    const payload = {
      im_apprenant: String(apprenant.im_apprenant).trim(),
      nom_complet: nomCompletCalcule,
      type_document: String(typeDoc).trim().toUpperCase(), 
      centre_examen: String(nomCentreExamen).trim()
    };

    try {
      const response = await API.post('http://localhost:8000/api/demandes/creer', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.data) {
        setDemandes(prevDemandes => [response.data.data, ...prevDemandes]);
      } else {
        const nouvelleDemandeSecours = {
          id_demande: Date.now(),
          im_apprenant: payload.im_apprenant,
          nom_complet: payload.nom_complet,
          type_document: payload.type_document, 
          centre_examen: payload.centre_examen,
          date_depot: new Date().toLocaleDateString('fr-FR'),
          statut: 'EN_COURS'
        };
        setDemandes(prevDemandes => [nouvelleDemandeSecours, ...prevDemandes]);
      }

      setNotifCount(prev => prev + 1);
      alert(`✅ Succès : La demande de ${typeDoc.toLowerCase()} pour ${payload.nom_complet} a été enregistrée avec succès dans la base MySQL !`);
      
      if (typeof chargerApprenants === 'function') await chargerApprenants();
      if (typeof chargerDemandes === 'function') await chargerDemandes();
      if (!isGroup) {
        alert(`✅ Succès : La demande de ${typeDoc.toLowerCase()} pour ${payload.nom_complet} a été enregistrée avec succès dans la base MySQL !`);
      } else {
        console.log(`✅ Synchronisation MySQL réussie pour : ${payload.nom_complet}`);
      }

    } catch (err) {
      console.error(err);
      
      if (err.response && err.response.status === 422) {
        const detailsErreur = err.response.data?.detail;
        if (Array.isArray(detailsErreur)) {
          const messageFormate = detailsErreur.map(e => `Champ '${e.loc[e.loc.length - 1]}' : ${e.msg}`).join('\n');
          alert(`⚠️ Erreur de validation serveur (422) :\n${messageFormate}`);
        } else {
          alert("⚠️ Données rejetées par le serveur. Vérifiez le format de vos structures.");
        }
      } else {
        alert(err.response?.data?.detail || "⚠️ Erreur de transmission réseau au serveur central.");
      }
    }
  };



  const [showAddEtablissement, setShowAddEtablissement] = useState(false);
  const [openEtabMenuId, setOpenEtabMenuId] = useState(null); 
  const [codeCentre, setCodeCentre] = useState('');
  const [nomEtab, setNomEtab] = useState('');
  const [district, setDistrict] = useState('');
  const [contactEtab, setContactEtab] = useState('');
  const [emailEtab, setEmailEtab] = useState('');

  const [etablissements, setEtablissements] = useState([]);
  const chargerEtablissements = async () => {
    try {
      const response = await API.get('/etablissements/liste');
      setEtablissements(response.data); 
    } catch (err) {
      console.error("Erreur lors de la récupération des établissements depuis FastAPI");
    }
  };
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  const [showEditEtablissement, setShowEditEtablissement] = useState(false);

  useEffect(() => {
    if (activeMenu === 'liste_etablissements') {
      chargerEtablissements();
    }
    if (activeMenu === 'liste_demandes') {
      chargerDemandes(); 
    }
  }, [activeMenu]);


  const handleCreerDemandeTitre = async (apprenant, typeDoc) => {
    try {
      await API.post('/demandes/creer', {
        im_apprenant: apprenant.im_apprenant,
        nom_complet: `${apprenant.nom_apprenant} ${apprenant.prenom_apprenant}`,
        type_document: typeDoc, 
        centre_examen: apprenant.etablissement_id || "Centre Non Spécifié"
      });

      alert(`📄 La demande de ${typeDoc} pour ${apprenant.nom_apprenant} a été transmise avec succès au registre des demandes !`);
      
      if (activeMenu === 'liste_demandes') {
        await chargerDemandes();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "⚠️ Erreur lors du transfert des renseignements au serveur central.");
    }
  };

  const handleEnvoyerAuTraitement = async () => {
    if (!selectedDemande) return;
    const idCible = selectedDemande.id_demande ?? selectedDemande.id;

    try {
      await API.put(`/demandes/changer-statut-diplome/${idCible}?statut_cible=RECU`);

      alert(`📥 Dossier de ${selectedDemande.nom_complet || 'l\'apprenant'} pris en charge et transféré dans la Liste des Demandes !`);
      
      if (typeof chargerDemandes === 'function') await chargerDemandes(); 
      setShowTraiteModal(false);
      setSelectedDemande(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la prise en charge du dossier.");
    }
  };



  const handleSignerDocumentDefinitif = async (idDemande) => {
    if (window.confirm("✒️ Confirmez-vous l'apposition de la signature officielle sur ce titre ?")) {
      try {
        await API.put(`/demandes/finaliser-signature/${idDemande}`);
        alert("✅ Le document a été signé avec succès et archivé comme validé !");
        await chargerDemandes(); 
      } catch (err) {
        alert("Erreur lors de la signature finale sur le serveur.");
      }
    }
  };


    const handleEnregistrerEtablissement = async (e) => {
      e.preventDefault();

    const resteNumero = contactEtab.replace(/\s+/g, '');

    const regex9Chiffres = /^\d{9}$/;

    if (!regex9Chiffres.test(resteNumero)) {
      alert("⚠️ Ce numéro n'existe pas à Madagascar. Vous devez saisir exactement 9 chiffres après le +261 (Ex: 345214587).");
      return; 
    }

    const contactComplet = `+261 ${resteNumero.substring(0,2)} ${resteNumero.substring(2,5)} ${resteNumero.substring(5,7)} ${resteNumero.substring(7,9)}`;

    try {
      await API.post('/etablissements/creer', {
        code_centre: codeCentre,
        nom_etablissement: nomEtab,
        localisation_district: district,
        contact: contactComplet, 
        email: emailEtab
      });
      
      alert(`🏢 L'établissement "${nomEtab}" a été inséré dans la base !`);
      await chargerEtablissements();
      setShowAddEtablissement(false);
      setCodeCentre(''); setNomEtab(''); setDistrict(''); setContactEtab(''); setEmailEtab('');
      
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur de transmission au serveur central.");
    }
  };
  const handleModifierEtablissement = async (e) => {
    e.preventDefault();

    const code = document.getElementById('edit-code-centre').value;
    const nom = document.getElementById('edit-nom-etablissement').value;
    const dist = document.getElementById('edit-localisation').value;
    const email = document.getElementById('edit-email').value;
    const resteNum = contactEtab.replace(/\s+/g, '');

    if (!/^\d{9}$/.test(resteNum)) {
      alert("⚠️ Ce numéro n'existe pas à Madagascar. Saisissez strictement 9 chiffres (Ex: 345214587).");
      return;
    }

    const contactComplet = `+261 ${resteNum.substring(0,2)} ${resteNum.substring(2,5)} ${resteNum.substring(5,7)} ${resteNum.substring(7,9)}`;

    try {
      await API.put(`/etablissements/modifier/${selectedEtablissement.id_centre}`, {
        code_centre: code,
        nom_etablissement: nom,
        localisation_district: dist,
        contact: contactComplet,
        email: email
      });

      alert(`✅ L'établissement "${nom}" a été mis à jour avec succès en base de données !`);
      await chargerEtablissements();
      setShowEditEtablissement(false);
      setSelectedEtablissement(null);
      setContactEtab('');
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la mise à jour sur le serveur central.");
    }
  };
  const [showDetailsEtablissement, setShowDetailsEtablissement] = useState(false);

  const [selectedEtabIds, setSelectedEtabIds] = useState([]);

  
const chargerDemandes = async () => {
    try {
      const response = await API.get('/demandes/liste');
      setDemandes(response.data); 
    } catch (err) {
      console.error("Erreur lors de la récupération des demandes de titres");
    }
  };
 const handleLancerImpression = async (demandeSelectionnee) => {
    if (!demandeSelectionnee) return;

    const idCible = demandeSelectionnee.id_demande ?? demandeSelectionnee.id;

    try {
      await API.put(`/demandes/imprimer/${idCible}`);
      
      window.print();
      
      if (typeof chargerDemandes === 'function') await chargerDemandes();
      if (typeof chargerApprenants === 'function') await chargerApprenants();

    } catch (err) {
      console.error(err);
      alert("⚠️ Erreur lors de la synchronisation de l'impression.");
    }
  };

  const ImprimerEtValiderAttestation = async (demande) => {
    if (!demande) return;

    const idCible = demande.id_demande ?? demande.id;
    const matriculeDemande = demande.im_apprenant;

    const cibleApprenant = (apprenants || []).find(app => 
      String(app.im_apprenant).trim() === String(matriculeDemande).trim()
    );

    if (!cibleApprenant) {
      alert(`⚠️ Erreur : Le matricule "${matriculeDemande}" n'existe pas ou plus dans la liste des apprenants.`);
      return;
    }

    const nomComplet = `${cibleApprenant.nom_apprenant || ""} ${cibleApprenant.prenom_apprenant || ""}`.trim().toUpperCase();
    const matriculeFinal = cibleApprenant.im_apprenant;
    const lieuNaissance = (cibleApprenant.lieu_naiss || "Ambositra").toUpperCase();
    const anneeSession = cibleApprenant.session || 2026;
    const mentionObtenue = String(cibleApprenant.mention || "PASSABLE").toUpperCase();

    let dateNaissancePropre = cibleApprenant.date_naiss || "";
    if (dateNaissancePropre && dateNaissancePropre.includes('-')) {
      const parsedDate = new Date(dateNaissancePropre);
      if (!isNaN(parsedDate.getTime())) {
        dateNaissancePropre = parsedDate.toLocaleDateString('fr-FR');
      }
    }

    
    const nomExamen = String(cibleApprenant.examen_id || "B.E.P").toUpperCase();

    const etabTrouve = (listeEtablissements || []).find(e => 
      (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === cibleApprenant.etablissement_id?.toString()
    );
    const nomEtablissement = etabTrouve ? (etabTrouve.nom_etablissement || etabTrouve.nom) : "CENTRE TECHNIQUE REGIONAL";

    const secTrouve = (listeSecteurs || []).find(s => 
      (s.id_secteur ?? s.id)?.toString() === cibleApprenant.secteur_id?.toString()
    );
    const nomSecteur = secTrouve ? secTrouve.nom_secteur : "INDUSTRIEL";

    const filTrouve = (listeFilieres || []).find(f => 
      (f.id_filiere ?? f.id)?.toString() === cibleApprenant.filiere_id?.toString()
    );
    const nomFiliere = filTrouve ? filTrouve.nom_filiere : "GÉNIE CIVIL";

    const metTrouve = (listeMetiers || []).find(m => 
      (m.id_metier ?? m.id)?.toString() === cibleApprenant.metier_id?.toString()
    );
    const nomMetier = metTrouve ? metTrouve.nom_metier : "BÂTIMENT ET TRAVAUX PUBLICS";

    const dateEdition = new Date().toLocaleDateString('fr-FR');

    try {
      const printContainer = document.createElement('div');
      printContainer.id = 'official-attestation-print-zone';
      printContainer.innerHTML = `
        <div class="attestation-document-box">
          <div class="rep-header">
            <strong>REPOBLIKAN'I MADAGASIKARA</strong><br/>
            <span class="motto">Fitiavana – Tanindrazana – Fandrosoana</span><br/>
            <span>*********</span>
          </div>
          
          <div class="ministry-header">
            MINISTERE DE L'ENSEIGNEMENT TECHNIQUE<br/>ET DE LA FORMATION PROFESSIONNELLE<br/>
            <span>*********</span><br/>
            SECRETARIAT GENERAL<br/>
            <span>*********</span><br/>
            DIRECTION REGIONALE DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE<br/>AMORON'I MANIA<br/>
            <span>*********</span>
          </div>

          <div class="doc-number">N° D'INSCRIPTION : <strong>${matriculeFinal}</strong></div>
          
          <div class="doc-title">ATTESTATION DE REUSSITE</div>

          <div class="doc-body">
            <p class="intro-text">LE DIRECTEUR REGIONAL DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE, atteste que :</p>
            
            <div class="info-bloc">
              <div class="info-line"><span class="info-label">Nom :</span><span class="info-value">${nomComplet}</span></div>
              <div class="info-line"><span class="info-label">Né(e) le :</span><span class="info-value">${dateNaissancePropre} à ${lieuNaissance}</span></div>
              <div class="info-line"><span class="info-label">A subi avec succès l'Examen du :</span><span class="info-value">${nomExamen}</span></div>
              <div class="info-line"><span class="info-label">Centre :</span><span class="info-value">${nomEtablissement}</span></div>
              <div class="info-line"><span class="info-label">Secteur :</span><span class="info-value">${nomSecteur}</span></div>
              <div class="info-line"><span class="info-label">Filière/Métier :</span><span class="info-value">${nomFiliere} / ${nomMetier}</span></div>
              <div class="info-line"><span class="info-label">Session du :</span><span class="info-value">${anneeSession}</span></div>
              <div class="info-line"><span class="info-label">Mention :</span><span class="info-value">${mentionObtenue}</span></div>
            </div>
          </div>

          <div class="footer-container">
            <div class="warning-box">
              <strong style="display:block; text-align:center; text-decoration:underline; margin-bottom:4px;">AVIS IMPORTANT</strong>
              Il ne peut être délivré qu'une seule attestation de réussite.<br/>
              L'intéressé(e) doit en faire autant de copies qui lui sont<br/>
              nécessaires et les certifier conformes à l'original.
            </div>
            
            <div class="signature-box">
              Fait à Ambositra, le ${dateEdition}<br/>
              <div class="signature-title">
                P. LE DIRECTEUR REGIONAL DE L'ENSEIGNEMENT TECHNIQUE ET DE LA<br/>FORMATION PROFESSIONNELLE
              </div>
              <span class="delegate">Par délégation</span>
            </div>
          </div>
        </div>
      `;


      document.body.appendChild(printContainer);
      window.print();
      document.body.removeChild(printContainer);

      await API.put(`/demandes/imprimer/${idCible}`);
      
      setDemandes(prevDemandes => 
        prevDemandes.map(d => {
          const currentId = d.id_demande ?? d.id;
          if (currentId === idCible) {
            return { ...d, statut: "TERMINER" }; 
          }
          return d;
        })
      );

      if (typeof chargerDemandes === 'function') await chargerDemandes();
      if (typeof chargerApprenants === 'function') await chargerApprenants();
      
      alert(`🎉 Attestation générée avec succès pour ${nomComplet} !`);
      
    } catch (err) {
      console.error(err);
      alert("⚠️ Erreur réseau lors de la mise à jour du statut d'impression.");
    }
  };

  const handleImpressionEnMasseAttestations = async () => {
    if (!demandesTraitementCochees || demandesTraitementCochees.length === 0) return;

    if (!window.confirm(`🖨️ Voulez-vous lancer l'impression en chaîne pour les ${demandesTraitementCochees.length} attestation(s) sélectionnée(s) ?`)) {
      return;
    }

    const ancienTitreOnglet = document.title;
    
    let compteurDecroissant = demandesTraitementCochees.length;

    for (const idLigne of demandesTraitementCochees) {
      const demande = (demandes || []).find(d => (d.id_demande ?? d.id) === idLigne);
      if (!demande) continue;

      const cibleApprenant = (apprenants || []).find(app => 
        String(app.im_apprenant).trim() === String(demande.im_apprenant).trim()
      );

      const nomComplet = cibleApprenant 
        ? `${cibleApprenant.nom_apprenant || ""} ${cibleApprenant.prenom_apprenant || ""}`.trim().toUpperCase()
        : (demande.nom_complet || "Candidat").toUpperCase();

      const matriculeFinal = demande.im_apprenant;
      const lieuNaissance = (cibleApprenant?.lieu_naiss || "AMBOSITRA").toUpperCase();
      const dateNaissancePropre = cibleApprenant?.date_naiss || "23 Mai 2002";
      const nomExamen = String(cibleApprenant?.examen_id || "B.E.P").toUpperCase();
      const anneeSession = cibleApprenant?.session || demande.session || 2021;
      const mentionObtenue = String(cibleApprenant?.mention || "PASSABLE").toUpperCase();

      const etabTrouve = (listeEtablissements || []).find(e => (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === cibleApprenant?.etablissement_id?.toString());
      const nomEtablissement = etabTrouve ? (etabTrouve.nom_etablissement || etabTrouve.nom) : "CENTRE TECHNIQUE CENTRAL";
      const nomSecteur = (listeSecteurs || []).find(s => (s.id_secteur ?? s.id)?.toString() === cibleApprenant?.secteur_id?.toString())?.nom_secteur || "GENIE CIVIL";
      const nomFiliere = (listeFilieres || []).find(f => (f.id_filiere ?? f.id)?.toString() === cibleApprenant?.filiere_id?.toString())?.nom_filiere || "BATIMENT ET TRAVAUX PUBLICS";
      const nomMetier = (listeMetiers || []).find(m => (m.id_metier ?? m.id)?.toString() === cibleApprenant?.metier_id?.toString())?.nom_metier || "CHEF D'EQUIPE DE CHANTIER";

      const prefixeNombre = compteurDecroissant < 10 ? `0${compteurDecroissant}` : compteurDecroissant;
      document.title = `Attestation_${prefixeNombre}_${nomComplet.replace(/ /g, "_")}`;

      const printContainer = document.createElement('div');
      printContainer.id = 'official-attestation-print-zone';
      printContainer.innerHTML = `
        <div class="attestation-document-box">
          <div class="rep-header">
            <strong>REPOBLIKAN'I MADAGASIKARA</strong><br/>
            <span class="motto">Fitiavana – Tanindrazana – Fandrosoana</span><br/>
            <span>*********</span>
          </div>
          <div class="ministry-header">
            MINISTERE DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE<br/>*********<br/>
            SECRETARIAT GENERAL<br/>*********<br/>
            DIRECTION REGIONALE DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE AMORON'I MANIA<br/>*********
          </div>
          <div class="doc-number">N° D'INSCRIPTION : ${matriculeFinal}</div>
          <div class="doc-title">ATTESTATION DE REUSSITE</div>
          <div class="doc-body">
            <p class="intro-text">LE DIRECTEUR REGIONAL DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE, atteste que :</p>
            <div class="info-bloc">
              <div class="info-line"><span class="info-label">Mr / Mlle :</span><span class="info-value">${nomComplet}</span></div>
              <div class="info-line"><span class="info-label">Né(e) le :</span><span class="info-value">${dateNaissancePropre} à ${lieuNaissance}</span></div>
              <div class="info-line"><span class="info-label">A subi avec succès l'Examen du :</span><span class="info-value">${nomExamen}</span></div>
              <div class="info-line"><span class="info-label">Centre :</span><span class="info-value">${nomEtablissement}</span></div>
              <div class="info-line"><span class="info-label">Secteur :</span><span class="info-value">${nomSecteur}</span></div>
              <div class="info-line"><span class="info-label">Filière/Métier :</span><span class="info-value">${nomFiliere} / ${nomMetier}</span></div>
              <div class="info-line"><span class="info-label">Session du :</span><span class="info-value">${anneeSession}</span></div>
              <div class="info-line"><span class="info-label">Mention :</span><span class="info-value">${mentionObtenue}</span></div>
            </div>
          </div>
          <div class="footer-container">
            <div class="warning-box">
              <strong>AVIS IMPORTANT</strong><br/>Il ne peut être délivré qu'une seule attestation.
            </div>
            <div class="signature-box">
              Fait à Ambositra, le ${new Date().toLocaleDateString('fr-FR')}<br/>
              <div class="signature-title">P. LE DIRECTEUR REGIONAL DE L'ENSEIGNEMENT TECHNIQUE...</div>
              <span class="delegate">Par délégation</span>
            </div>
          </div>
        </div>
      `;

      try {
        document.body.appendChild(printContainer);
        window.print(); 
        document.body.removeChild(printContainer);

        const idCible = demande.id_demande ?? demande.id;
        await API.put(`/demandes/imprimer/${idCible}`);
        
        compteurDecroissant--; 
      } catch (sqlErr) {
        console.error("Erreur d'écriture de l'impression :", sqlErr);
      }
    }

    document.title = ancienTitreOnglet;

    alert("🎉 Chaîne d'impression achevée ! Les statuts cochés ont tous été synchronisés sur MySQL.");
    
    if (typeof chargerDemandes === 'function') await chargerDemandes();
    setDemandesTraitementCochees([]); 
  };





    
  const handleEnregistrerSecteur = async (e) => {
    if (e) e.preventDefault();
    
    const inputNom = document.getElementById('sec_nom')?.value?.trim();
    const inputEtab = document.getElementById('sec_etab_id')?.value;
    const inputDesc = document.getElementById('sec_desc')?.value?.trim();

    if (!inputNom || !inputEtab) {
      alert("⚠️ Veuillez renseigner le nom du secteur et son établissement d'attache.");
      return;
    }

    const corpsSecteurJson = {
      nom_secteur: String(inputNom),
      etablissement_id: Number(inputEtab) || 1, 
      description_sec: String(inputDesc || "")
    };

    try {
      if (secteurModalMode === 'ajouter') {
        await API.post('http://localhost:8000/api/secteurs/creer', corpsSecteurJson);
        alert("✅ Nouveau secteur technologique ajouté avec succès !");
      } else if (secteurModalMode === 'modifier') {
        const idSecteurCible = selectedSecteur.id_secteur || selectedSecteur.id;
        await API.put(`http://localhost:8000/api/secteurs/modifier/${idSecteurCible}`, corpsSecteurJson);
        alert("✅ Le secteur a été modifié avec succès !");
      }
      
      if (typeof chargerNomenclaturesBdd === 'function') await chargerNomenclaturesBdd();
      
      setShowSecteurModal(false);
      setSelectedSecteur(null);
    } catch (err) {
      console.error(err);
      alert("Erreur serveur : " + (err.response?.data?.detail || "Le format de la requête est incorrect."));
    }
  };

  const handleSupprimerSecteur = async (idSecteur) => {
    if (!idSecteur) {
      alert("⚠️ Erreur interne : Impossible de récupérer l'identifiant de ce secteur.");
      return;
    }

    if (window.confirm("⚠️ Voulez-vous vraiment supprimer définitivement ce secteur ? Les filières et métiers associés risquent de se désynchroniser.")) {
      try {
        await API.delete(`http://localhost:8000/api/secteurs/supprimer/${idSecteur}`);
        
        alert("🗑️ Secteur supprimé avec succès de la base!");
        if (typeof chargerNomenclaturesBdd === 'function') {
          await chargerNomenclaturesBdd();
        }
      } catch (err) {
        console.error(err);
        alert("⚠️ Erreur : Impossible de supprimer ce secteur. Vérifie ton terminal FastAPI.");
      }
    }
  };


  const handleEnregistrerFiliere = async (e) => {
    if (e) e.preventDefault();
    
    const nomFiliere = document.getElementById('fil_nom')?.value?.trim();
    const secteurId = document.getElementById('fil_sec_id')?.value;
    const descFiliere = document.getElementById('fil_desc')?.value?.trim();

    if (!nomFiliere || !secteurId || secteurId === "") {
      alert("⚠️ Veuillez renseigner le nom de la filière et son secteur d'attache.");
      return;
    }

    const corpsJson = {
      nom_filiere: nomFiliere,
      secteur_id: parseInt(secteurId, 10),
      description_fil: descFiliere || ""
    };
    try {
      if (filiereModalMode === 'ajouter') {
        await API.post('http://localhost:8000/api/filieres/creer', corpsJson);
        alert("✅ Nouvelle filière technique ajoutée avec succès !");
      } else if (filiereModalMode === 'modifier') {
        const idFilCible = selectedFiliere.id_filiere || selectedFiliere.id;
        await API.put(`http://localhost:8000/api/filieres/modifier/${idFilCible}`, corpsJson);
        alert("✅ La filière a été modifiée avec succès !");
      }

      
      if (typeof chargerNomenclaturesBdd === 'function') await chargerNomenclaturesBdd();
      setShowFiliereModal(false);
      setSelectedFiliere(null);
    } catch (err) {
      alert("⚠️ Échec de la communication réseau avec le serveur FastAPI.");
    }
  };

  const handleSupprimerFiliere = async (idFil) => {
    if (!idFil) {
      alert("⚠️ Erreur interne : Impossible de récupérer l'identifiant de cette filière.");
      return;
    }

    if (window.confirm("⚠️ Voulez-vous vraiment supprimer définitivement cette filière technique ?")) {
      try {
        await API.delete(`http://localhost:8000/api/filieres/supprimer/${idFil}`);
        
        alert("🗑️ Filière supprimée avec succès de la base SQLite !");
        
        if (typeof chargerNomenclaturesBdd === 'function') {
          await chargerNomenclaturesBdd();
        }
      } catch (err) {
        console.error(err);
        alert("⚠️ Erreur : Impossible d'effacer cette filière.");
      }
    }
  };


  const handleEnregistrerMetier = async (e) => {
    if (e) e.preventDefault();
    
    const nomMetier = document.getElementById('met_nom')?.value?.trim();
    const filiereId = document.getElementById('met_fil_id')?.value;
    const descMetier = document.getElementById('met_desc')?.value?.trim();

    if (!nomMetier || !filiereId || filiereId === "") {
      alert("⚠️ Veuillez renseigner le nom du métier et sa filière d'attache.");
      return;
    }

    const corpsJson = {
      nom_metier: nomMetier,
      filiere_id: parseInt(filiereId, 10),
      description_met: descMetier || ""
    };

    try {
      if (metierModalMode === 'ajouter') {
        await API.post('http://localhost:8000/api/metiers/creer', corpsJson);
        alert("✅ Nouveau métier spécifique ajouté avec succès !");
      } else if (metierModalMode === 'modifier') {
        const idMetCible = selectedMetier.id_metier || selectedMetier.id;
        await API.put(`http://localhost:8000/api/metiers/modifier/${idMetCible}`, corpsJson);
        alert("✅ Le métier a été modifié avec succès !");
      }
      
      if (typeof chargerNomenclaturesBdd === 'function') await chargerNomenclaturesBdd();
      setShowMetierModal(false);
      setSelectedMetier(null);
    } catch (err) {
      alert("⚠️ Échec de la communication réseau avec le serveur FastAPI port 8000.");
    }
  };

  const handleSupprimerMetier = async (idMet) => {
    if (window.confirm("⚠️ Supprimer définitivement ce métier du référentiel ?")) {
      try {
        await API.delete(`http://localhost:8000/api/metiers/supprimer/${idMet}`);
        alert("🗑️ Métier supprimé avec succès.");
        if (typeof chargerNomenclaturesBdd === 'function') await chargerNomenclaturesBdd();
      } catch (err) {
        alert("⚠️ Erreur lors de la suppression du métier.");
      }
    }
  };

  
  const secteursModaleFiltrés = (listeSecteurs || []).filter(s => {
    if (!modalEtabId || modalEtabId === '') return false;
    const idSecteurEtab = s.etablissement_id ?? s.centre_id ?? s.id_etablissement;
    
    return idSecteurEtab?.toString() === modalEtabId.toString();
  });


  const filieresModaleFiltrées = (listeFilieres || []).filter(f => {
    if (!modalSecteurId || modalSecteurId === '') return true;
    return f.secteur_id?.toString() === modalSecteurId.toString();
  });

  const metiersModaleFiltrés = (listeMetiers || []).filter(m => {
    if (!modalFiliereId || modalFiliereId === '') return true;
    return m.filiere_id?.toString() === modalFiliereId.toString();
  });

  const handleSupprimerExamen = async (idExam) => {
    if (!idExam) return;
    if (window.confirm("⚠️ Voulez-vous vraiment supprimer définitivement cet examen ?")) {
      try {
        await API.delete(`http://localhost:8000/api/examens/supprimer/${idExam}`);
        alert("🗑️ Examen supprimé avec succès !");
        if (typeof chargerNomenclaturesBdd === 'function') await chargerNomenclaturesBdd();
      } catch (err) {
        alert("⚠️ Erreur lors de la suppression.");
      }
    }
  };
  const chargerExamens = async () => {
    try {
      const response = await API.get('http://localhost:8000/api/examens/liste');
      setListeExamens(response.data || []);
    } catch (err) {
      console.error("⚠️ Impossible de charger le répertoire des examens :", err);
    }
  };
 
  useEffect(() => {
    chargerExamens();
  }, []); 

  useEffect(() => {
    if (activeMenu === 'liste_examens' || activeMenu === 'liste_apprenants') {
      chargerExamens();
    }
  }, [activeMenu]);


 
  const handleActionGroupesDemandes = async (typeDoc) => {
    if (!apprenantsCoches || apprenantsCoches.length === 0) return;

    if (!window.confirm(`❓ Voulez-vous générer et valider automatiquement les demandes de ${typeDoc.toLowerCase()} pour les ${apprenantsCoches.length} apprenant(s) sélectionné(s) ?`)) {
      return;
    }

    let succesCount = 0;
    let erreursCount = 0;

    for (const idLigne of apprenantsCoches) {
      const candidat = (apprenants || []).find(app => (app.id_apprenant || app.id) === idLigne);
      if (!candidat) continue;

      const prenomPart = candidat.prenom_apprenant ? ` ${candidat.prenom_apprenant}` : "";
      const nomCompletCalcule = `${candidat.nom_apprenant}${prenomPart}`.trim().toUpperCase();

      const etabTrouve = (listeEtablissements || []).find(e => 
        (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === candidat.etablissement_id?.toString()
      );
      const nomCentreExamen = etabTrouve ? (etabTrouve.nom_etablissement || etabTrouve.nom) : "CENTRE REGIONAL";

      const payload = {
        im_apprenant: String(candidat.im_apprenant).trim(),
        nom_complet: nomCompletCalcule,
        type_document: String(typeDoc).trim().toUpperCase(),
        centre_examen: String(nomCentreExamen).trim(),
        statut: "EN_TRAITEMENT"
      };



      try {
        await API.post('/demandes/creer', payload);
        succesCount++;
      } catch (err) {
        console.error(`❌ Échec pour ${candidat.nom_apprenant} :`, err);
        erreursCount++;
      }
    }

    alert(`📊 Opération de masse achevée :\n✅ ${succesCount} demande(s) de ${typeDoc.toLowerCase()} enregistrée(s) avec succès dans la base MySQL.\n❌ ${erreursCount} échec(s).`);

    if (typeof chargerDemandes === 'function') await chargerDemandes();
    if (typeof chargerApprenants === 'function') await chargerApprenants();
    
    setApprenantsCoches([]); 
    setNotifCount(prev => prev + succesCount); 
  };


  const handleSuppressionGroupesApprenants = async () => {
    if (apprenantsCoches.length === 0) return;

    if (!window.confirm(`🚨 ATTENTION CRITIQUE :\nÊtes-vous absolument sûr de vouloir supprimer DÉFINITIVEMENT les ${apprenantsCoches.length} apprenants sélectionnés de la base de données ? Cette action est irréversible.`)) {
      return;
    }

    let supprCount = 0;

    for (const idLigne of apprenantsCoches) {
      try {
        await API.delete(`/apprenants/supprimer/${idLigne}`);
        supprCount++;
      } catch (err) {
        console.error(`Erreur de suppression de la ligne ${idLigne} :`, err);
      }
    }

    alert(`🗑️ Succès : ${supprCount} fiche(s) apprenant(s) effacée(s) du registre MySQL.`);
    
    if (typeof chargerApprenants === 'function') await chargerApprenants();
    setApprenantsCoches([]); 
  };

  useEffect(() => {
    if (typeof chargerDemandes === 'function') {
      chargerDemandes();
      console.log("📡 Registre central des demandes MySQL synchronisé dès le démarrage.");
    }
    
    if (typeof chargerApprenants === 'function') chargerApprenants();
    if (typeof chargerEtablissements === 'function') chargerEtablissements();
  }, []); 


  const [editingChefFields, setEditingChefFields] = useState({
    nom: false,
    prenom: false,
    email: false,
    telephone: false
  });

  const ouvrirInterfaceChef = (chef, tab) => {
    setOpenCardMenuId(null);
    setEditingChefFields({ nom: false, prenom: false, email: false, telephone: false });

    setChefEditForm({
      nom: chef.nom_chefcentre || chef.nom || '',
      prenom: chef.prenom_chefcentre || chef.prenom || '',
      email: chef.mail_chefcentre || chef.email || '',
      telephone: chef.tel_chefcentre || chef.telephone || '',
      username: chef.username || '',
      statut: chef.statut || 'ACTIF'
    });

    setSelectedChefView({ chef, tab });
  };

  const handleUpdateChefDetails = async (e) => {
  e.preventDefault();
  if (!selectedChefView?.chef) return;
  
  const idChef = selectedChefView.chef.id_chefcentre ?? selectedChefView.chef.id;

  try {
    await API.put(`/chefs-centre/${idChef}`, {
      nom_chefcentre: chefEditForm.nom,
      prenom_chefcentre: chefEditForm.prenom,
      mail_chefcentre: chefEditForm.email,
      tel_chefcentre: chefEditForm.telephone,
      username: chefEditForm.username
    });

    alert(`✅ Informations de ${chefEditForm.nom} ${chefEditForm.prenom} enregistrées dans MySQL !`);
    
    setSelectedChefView((prev) => ({
      ...prev,
      chef: {
        ...prev.chef,
        nom_chefcentre: chefEditForm.nom,
        prenom_chefcentre: chefEditForm.prenom,
        mail_chefcentre: chefEditForm.email,
        tel_chefcentre: chefEditForm.telephone,
        username: chefEditForm.username
      }
    }));
    setEditingChefFields({ nom: false, prenom: false, email: false, telephone: false });
    
    if (typeof chargerChefsCentre === 'function') chargerChefsCentre();
  } catch (err) {
    console.error("Erreur mise à jour chef :", err);
    alert("❌ Erreur lors de la sauvegarde dans la base de données.");
  }
};




  const catalogueGlobal = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
  
  const attestationsTraiteesFiltrees = catalogueGlobal.filter(d => {
    const estValide = ['EN_COURS', 'TERMINER'].includes((d.statut || "").toUpperCase());
    if (!estValide) return false;

    const texteRecherche = searchTraitement.toLowerCase().trim();
    const matchTexte = !texteRecherche || 
      (d.nom_complet || "").toLowerCase().includes(texteRecherche) ||
      (d.im_apprenant || "").toString().toLowerCase().includes(texteRecherche);

    const matchSession = sessionTraitement === 'Tous' || 
      (d.session || "").toString() === sessionTraitement.toString();

    const typeDocDmd = (d.type_document || "").toUpperCase();
    const matchDoc = filterDocTraitement === 'Tous' || typeDocDmd === filterDocTraitement.toUpperCase();

    const centreDmd = (d.centre_examen || "CENTRE REGIONAL").toUpperCase();
    const matchCentre = filterCentreTraitement === 'Tous' || centreDmd === filterCentreTraitement.toUpperCase();

    const statutDmd = (d.statut || "EN_COURS").toUpperCase();
    const matchStatut = filterStatutTraitement === 'Tous' || statutDmd === filterStatutTraitement.toUpperCase();

    return matchTexte && matchSession && matchDoc && matchCentre && matchStatut;
  });

  const handleSignatureEnMasseDiplomes = async () => {
    if (!diplomesCoches || diplomesCoches.length === 0) return;

    if (!window.confirm(`❓ Voulez-vous valider et homologuer automatiquement les ${diplomesCoches.length} diplôme(s) sélectionné(s) ?`)) {
      return;
    }

    let succesCount = 0;

    for (const idLigne of diplomesCoches) {
      const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
      const demande = catalogue.find(d => (d.id_demande ?? d.id) === idLigne);
      if (!demande) continue;

      try {
        const idCible = demande.id_demande ?? demande.id;
        await API.put(`/demandes/imprimer/${idCible}`);
        succesCount++;
      } catch (err) {
        console.error(`❌ Échec d'homologation pour l'ID ${idLigne} :`, err);
      }
    }

    alert(`📊 Opération terminée :\n✅ ${succesCount} diplôme(s) homologué(s) et signé(s) avec succès dans MySQL !`);

    if (typeof chargerDemandes === 'function') await chargerDemandes();
    if (typeof chargerApprenants === 'function') await chargerApprenants();
    setDiplomesCoches([]); 
  };

  const handleExporterGroupesDiplomesExcel = async () => {
    if (!diplomesCoches || diplomesCoches.length === 0) return;

    if (!window.confirm(`📊 Voulez-vous exporter les ${diplomesCoches.length} diplôme(s) sélectionné(s) en Excel ?`)) {
      return;
    }

    const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
    const lignesAExporter = [];
    let succesCount = 0;

    for (const idLigne of diplomesCoches) {
      const dmd = catalogue.find(d => (d.id_demande ?? d.id) === idLigne);
      if (!dmd) continue;

      const cibleApprenant = (apprenants || []).find(app => String(app.im_apprenant).trim() === String(dmd.im_apprenant).trim());
      const etabTrouve = (listeEtablissements || []).find(e => (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === cibleApprenant?.etablissement_id?.toString());
      const nomEtablissement = etabTrouve ? (etabTrouve.nom_etablissement || etabTrouve.nom) : (dmd.centre_examen || "Non spécifié");
      const nomSec = (listeSecteurs || []).find(s => (s.id_secteur ?? s.id)?.toString() === cibleApprenant?.secteur_id?.toString())?.nom_secteur || "Non spécifié";
      const nomFil = (listeFilieres || []).find(f => (f.id_filiere ?? f.id)?.toString() === cibleApprenant?.filiere_id?.toString())?.nom_filiere || "Non spécifiée";
      const nomMet = (listeMetiers || []).find(m => (m.id_metier ?? m.id)?.toString() === cibleApprenant?.metier_id?.toString())?.nom_metier || "Non spécifié";

      lignesAExporter.push({
        'MATRICULE (IM)': dmd.im_apprenant || 'N/A',
        'NOM': cibleApprenant?.nom_apprenant || dmd.nom_complet || 'INCONNU',
        'PRÉNOMS': cibleApprenant?.prenom_apprenant || '',
        'DATE DE NAISSANCE': cibleApprenant?.date_naiss || '',
        'LIEU DE NAISSANCE': (cibleApprenant?.lieu_naiss || '').toUpperCase(),
        'EXAMEN (DIPLÔME)': String(cibleApprenant?.examen_id || dmd.type_document || 'DIPLOME').toUpperCase(),
        'ÉTABLISSEMENT / CENTRE': nomEtablissement,
        'SECTEUR': nomSec,
        'FILIÈRE': nomFil,
        'MÉTIER': nomMet,
        'SESSION': cibleApprenant?.session || dmd.session || '',
        'MENTION': String(cibleApprenant?.mention || 'Passable').toUpperCase(),
        'STATUT DOCUMENT': 'En cours' 
      });
    }

    try {
      const feuilleTravail = XLSX.utils.json_to_sheet(lignesAExporter);
      const classeur = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(classeur, feuilleTravail, "Registre");
      XLSX.writeFile(classeur, `DRETFP_Export_Diplomes.xlsx`);

      for (const idLigne of diplomesCoches) {
        const dmd = catalogue.find(d => (d.id_demande ?? d.id) === idLigne);
        if (!dmd) continue;
        const idCible = dmd.id_demande ?? d.id;

        await API.put(`/demandes/modifier/${idCible}`, {
          ...dmd,
          statut: 'EN_COURS'
        });
        succesCount++;
      }

      alert(`✅ Fichier Excel téléchargé avec succès !\n🚀 Les ${succesCount} diplômes cochés passent désormais au statut "En cours".`);

    } catch (err) {
      console.error("❌ Erreur d'exportation Excel :", err);
      alert("⚠️ Erreur réseau lors de la mise à jour des statuts dans MySQL.");
    }

    if (typeof chargerDemandes === 'function') await chargerDemandes();
    setDiplomesCoches([]); 
  };

  const handleBasculerStatutObtenu = async (demandeSelectionnee) => {
    if (!demandeSelectionnee) return;
    
    const nomCandidat = demandeSelectionnee.nom_complet || "cet apprenant";

    if (!window.confirm(`🎓 Confirmez-vous que le diplôme officiel de ${nomCandidat} est arrivé à la direction régionale et a été obtenu par l'élève ?`)) {
      return;
    }

    const idCible = demandeSelectionnee.id_demande ?? demandeSelectionnee.id;

    const payloadModif = {
      im_apprenant: String(demandeSelectionnee.im_apprenant).trim(),
      nom_complet: String(demandeSelectionnee.nom_complet).trim().toUpperCase(),
      type_document: String(demandeSelectionnee.type_document || "DIPLOME").trim().toUpperCase(),
      centre_examen: String(demandeSelectionnee.centre_examen || "LTP AMBOSITRA").trim().toUpperCase(),
      statut: "OBTENU" 
    };

    try {
      await API.put(`/demandes/modifier/${idCible}`, payloadModif);

      alert(`🎉 Félicitations ! Le diplôme de ${nomCandidat} est désormais validé comme "Obtenu".`);
      
      if (typeof chargerDemandes === 'function') await chargerDemandes();
    } catch (err) {
      console.error("❌ Erreur lors du passage au statut Obtenu :", err);
      alert("⚠️ Impossible de mettre à jour le statut dans la base MySQL.");
    }
  };
  
  const handleEnvoyerAuTraitementGroupes = async () => {
    if (!demandesListeCochees || demandesListeCochees.length === 0) return;

    if (!window.confirm(`❓ Voulez-vous envoyer en traitement les ${demandesListeCochees.length} demande(s) sélectionnée(s) d'un seul clic ?`)) {
      return;
    }

    let succesCount = 0;
    const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);

    for (const idLigne of demandesListeCochees) {
      const dem = catalogue.find(d => (d.id_demande ?? d.id) === idLigne);
      if (!dem) continue;

      const idCible = dem.id_demande ?? dem.id;
      const typeDoc = String(dem.type_document || 'ATTESTATION').toUpperCase();
      
      const statutCible = typeDoc === 'ATTESTATION' ? 'EN_COURS' : 'EN_TRAITEMENT';

      try {
        await API.put(`/demandes/changer-statut-diplome/${idCible}?statut_cible=${statutCible}`);
        succesCount++;
      } catch (err) {
        console.error(`❌ Échec de transfert pour la demande ID ${idLigne} :`, err);
      }
    }

    alert(`📊 Opération de masse achevée :\n✅ ${succesCount} demande(s) envoyée(s) avec succès dans leurs onglets de traitement respectifs.`);

    if (typeof chargerDemandes === 'function') await chargerDemandes();
    if (typeof chargerApprenants === 'function') await chargerApprenants();
    setDemandesListeCochees([]); 
  };

  
const [statutsEnvoiChefs, setStatutsEnvoiChefs] = useState(() => {
  const saved = localStorage.getItem('dretfp_statuts_envoi_chefs');
  return saved ? JSON.parse(saved) : {};
});

const marquerAccesEnvoye = (chefObj, canal) => {
  const cleChef = (chefObj.id_chefcentre ?? chefObj.id ?? chefObj.username)?.toString();
  if (!cleChef) return;

  setStatutsEnvoiChefs((prev) => {
    const actuel = prev[cleChef] || { email: false, whatsapp: false };
    const misAJour = {
      ...prev,
      [cleChef]: {
        ...actuel,
        [canal]: true,
        date: new Date().toLocaleDateString('fr-FR')
      }
    };
    localStorage.setItem('dretfp_statuts_envoi_chefs', JSON.stringify(misAJour));
    return misAJour;
  });
};


const soumettreDemandeEnLigne = async (donneesFormulaire) => {
  const payload = {
    im_apprenant: donneesFormulaire.matricule,
    nom_apprenant: donneesFormulaire.nom,
    prenom_apprenant: donneesFormulaire.prenom || "",
    session: parseInt(donneesFormulaire.anneeSession),
    type_document: donneesFormulaire.typeDoc 
  };

  try {
    const response = await axios.post('http://localhost:8000/api/demandes/recevoir-enligne', payload);
    alert("✅ Votre demande a bien été envoyée à la Direction Régionale. Statut : En attente.");
  } catch (err) {
    alert(`⚠️ Échec de l'envoi : ${err.response?.data?.detail || "Serveur injoignable"}`);
  }
};

   const handlePrendreEnChargeGroupes = async () => {
    if (!demandesEnLigneCochees || demandesEnLigneCochees.length === 0) return;

    if (!window.confirm(`📥 Voulez-vous prendre en charge et transférer les ${demandesEnLigneCochees.length} demande(s) sélectionnée(s) ?`)) {
      return;
    }

    let succesCount = 0;
    const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);

    for (const idLigne of demandesEnLigneCochees) {
      const dem = catalogue.find(d => (d.id_demande ?? d.id) === idLigne);
      if (!dem) continue;
      const idCible = dem.id_demande ?? dem.id;

      try {
        await API.put(`/demandes/changer-statut-diplome/${idCible}?statut_cible=RECU`);
        succesCount++;
      } catch (err) {
        console.error(`❌ Échec pour l'ID ${idLigne} :`, err);
      }
    }

    alert(`📊 Opération terminée :\n✅ ${succesCount} demande(s) en ligne transférée(s) avec succès.`);
    if (typeof chargerDemandes === 'function') await chargerDemandes();
    setDemandesEnLigneCochees([]);
  };

  useEffect(() => {
    if (window.location.pathname === '/demande-en-ligne') {
      setActiveMenu('simulateur_etudiant');
    }
  }, []);

   const handleLogoutAdmin = () => {
    if (window.confirm("🚪 Voulez-vous fermer votre session d'administration centrale ?")) {
      localStorage.clear();
      sessionStorage.clear();

      window.location.replace('/login');
    }
  };


  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#002f6c' }}>
          <h3>🔒 Authentification de sécurité en cours...</h3>
        </div>
      </div>
    );
  }








  return (
    <div className="dashboard-container">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} notifCount={notifCount} setNotifCount={setNotifCount} filterType={filterType} setFilterType={setFilterType} demandes={demandes} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="main-content">
        <div className="header-bar">
          <div className="header-title">
            <h1>Direction Régionale de l'Enseignement Technique</h1>
           
          </div>

          <div className="header-bar" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             
              <button
                type="button"
                onClick={() => setActiveMenu('parametres')}
                style={{
                  background: activeMenu === 'parametres' ? '#e8f0fe' : '#ffffff',
                  border: activeMenu === 'parametres' ? '1px solid #1a73e8' : 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  color: activeMenu === 'parametres' ? '#1a73e8' : '#333333'
                }}
                title="Paramètres généraux du système"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f3f4';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.color = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = activeMenu === 'parametres' ? '#e8f0fe' : '#ffffff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.color = activeMenu === 'parametres' ? '#1a73e8' : '#333333';
                }}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              <button 
                type="button"
                onClick={handleLogoutAdmin}
                style={{ 
                  background: '#ffffff', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '35px', 
                  height: '35px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  color: '#333333' 
                }}
                title="Fermer la session administrative"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f3f4';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.color = '#c5221f'; 
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.color = '#333333';
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
              </button>

              <div 
                onClick={() => {
                  setActiveMenu('resultat_etablissement'); 
                  setNotifChefsCount(0); 
                }}
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%', 
                  background: notifChefsCount > 0 ? '#fde8e8' : '#f1f3f4', 
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
                title={notifChefsCount > 0 ? `🔔 ${notifChefsCount} fiches candidats reçues du terrain !` : "Aucune notification"}
              >
                <span style={{ fontSize: '1.1rem' }}>🔔</span>
                {notifChefsCount > 0 && (
                  <span 
                    style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      backgroundColor: '#e53e3e', color: '#ffffff',
                      fontSize: '0.75rem', fontWeight: 'bold',
                      padding: '2px 6px', borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      animation: 'scaleUpModal 0.3s ease-out'
                    }}
                  >
                    {notifChefsCount}
                  </span>
                )}
              </div>

              <button 
                type="button"
                className="btn-demandes-en-ligne"
                onClick={() => {
                  setActiveMenu('demandes_en_ligne'); 
                  if (typeof setOpenMenuId === 'function') setOpenMenuId(null);
                }}
                style={{ 
                  backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', 
                  borderRadius: '6px', padding: '0 16px', fontWeight: 'bold', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  height: '36px', boxShadow: '0 2px 5px rgba(26,115,232,0.2)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1557b0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1a73e8'; }}
              >
                🌐 Demandes en Ligne
              </button>
            </div>

        </div>

        <div className="content-body">

          
          {activeMenu === 'dashboard' && (() => {
            const safeApprenants = typeof apprenants !== 'undefined' ? apprenants : [];
            const safeDemandes = typeof demandes !== 'undefined' ? demandes : [];
            const safeEtablissements = typeof etablissements !== 'undefined' ? etablissements : [];
            const safeExamens = typeof examens !== 'undefined' ? examens : [];
            const safeSecteurs = typeof secteurs !== 'undefined' ? secteurs : [];
            const safeFilieres = typeof filieres !== 'undefined' ? filieres : [];
            const safeMetiers = typeof metiers !== 'undefined' ? metiers : [];

            const totalApprenants = safeApprenants.length;
            const totalDemandes = safeDemandes.length;
            
            const demandesAttestation = safeDemandes.filter((d) => {
              const type = (d.type_titre || d.type_demande || d.type_document || d.titre || '').toLowerCase();
              return type.includes('attestation');
            }).length;

            const demandesDiplome = safeDemandes.filter((d) => {
              const type = (d.type_titre || d.type_demande || d.type_document || d.titre || '').toLowerCase();
              return type.includes('diplome') || type.includes('diplôme');
            }).length;

            const totalEtablissements = safeEtablissements.length;
            
            const secteursUniquesApp = new Set(safeApprenants.map(a => a.secteur || a.nom_secteur).filter(Boolean)).size;
            const filieresUniquesApp = new Set(safeApprenants.map(a => a.filiere || a.nom_filiere).filter(Boolean)).size;
            const metiersUniquesApp = new Set(safeApprenants.map(a => a.metier || a.nom_metier || a.specialite).filter(Boolean)).size;

            const nbSecteurs = Math.max(safeSecteurs.length, statsChampProData.secteurs, secteursUniquesApp);
            const nbFilieres = Math.max(safeFilieres.length, statsChampProData.filieres, filieresUniquesApp);
            const nbMetiers = Math.max(safeMetiers.length, statsChampProData.metiers, metiersUniquesApp);

            const totalChampPro = nbSecteurs + nbFilieres + nbMetiers;

            const pctSecteurs = totalChampPro > 0 ? Math.round((nbSecteurs / totalChampPro) * 100) : 33;
            const pctFilieres = totalChampPro > 0 ? Math.round((nbFilieres / totalChampPro) * 100) : 33;
            const finFilieres = pctSecteurs + pctFilieres;

            const gradientAnneauChampPro = totalChampPro > 0
              ? `conic-gradient(#3d99a3 0% ${pctSecteurs}%, #354046 ${pctSecteurs}% ${finFilieres}%, #8d999e ${finFilieres}% 100%)`
              : 'conic-gradient(#d1d5db 0% 100%)';


            const statsExamens = (() => {
              const tousLesExamens = (typeof examens !== 'undefined' && examens.length > 0) 
                ? examens 
                : ((typeof listeExamens !== 'undefined' && listeExamens.length > 0) ? listeExamens : listeExamensDashboard);

              const groupes = {};

              safeApprenants.forEach((app) => {
                let nomTrouve = app.nom_examen || app.examen;

                if (!nomTrouve && app.examen_id && tousLesExamens.length > 0) {
                  const examCorrespondant = tousLesExamens.find(
                    (ex) => (ex.id_examen ?? ex.id)?.toString() === app.examen_id?.toString()
                  );
                  if (examCorrespondant) {
                    nomTrouve = examCorrespondant.nom_exam || examCorrespondant.nom_examen;
                  }
                }

                const etiquetteFinale = nomTrouve || (app.examen_id ? `Examen #${app.examen_id}` : 'Non défini');
                groupes[etiquetteFinale] = (groupes[etiquetteFinale] || 0) + 1;
              });

              const resultat = Object.keys(groupes).map((cle) => ({
                label: cle,
                val: groupes[cle]
              }));

              return resultat.length > 0 ? resultat : [{ label: 'Aucun examen', val: 0 }];
            })();

            const maxExam = Math.max(...statsExamens.map((s) => s.val), 1);


            const statsEvolution = (() => {
              const anneesMap = {};

              safeApprenants.forEach((app) => {
                const annee = (app.session_examen || app.annee_session || '2026').toString().trim();
                if (!anneesMap[annee]) {
                  anneesMap[annee] = { annee, total: 0, delivres: 0 };
                }
                anneesMap[annee].total += 1;
                
                const estAdmis = (app.mention && app.mention !== 'Ajourné') || app.progression === 'TERMINER';
                if (estAdmis) {
                  anneesMap[annee].delivres += 1;
                }
              });

              safeDemandes.forEach((dem) => {
                const annee = (dem.session_examen || '2026').toString().trim();
                if (!anneesMap[annee]) {
                  anneesMap[annee] = { annee, total: 0, delivres: 0 };
                }
                anneesMap[annee].total += 1;
                if (dem.statut?.toUpperCase().includes('VALID')) {
                  anneesMap[annee].delivres += 1;
                }
              });

              const listeTriee = Object.values(anneesMap).sort((a, b) => a.annee.localeCompare(b.annee));
              if (listeTriee.length === 0) {
                return [{ annee: '2026', total: 0, delivres: 0, taux: 0 }];
              }

              return listeTriee.map((item) => ({
                ...item,
                taux: item.total > 0 ? Math.round((item.delivres / item.total) * 100) : 0
              }));
            })();

            const pointsEvolutionSVG = statsEvolution.map((item, idx) => {
              const largeurUtile = 310;
              const x = statsEvolution.length === 1 
                ? 200 
                : 50 + (idx * (largeurUtile / (statsEvolution.length - 1)));
              const y = 115 - ((item.taux / 100) * 90); 
              return { ...item, x, y };
            });

            const polylinePoints = pointsEvolutionSVG.map((p) => `${p.x},${p.y}`).join(' ');



            const statsEtab = safeEtablissements.length > 0
              ? safeEtablissements.slice(0, 5).map(et => {
                  const idEt = et.id_centre ?? et.id_etablissement ?? et.id;
                  const count = safeApprenants.filter(a => (a.etablissement_id ?? a.centre_id)?.toString() === idEt?.toString()).length;
                  return { label: et.nom_etablissement || 'Centre', val: count };
                })
              : [{ label: 'LTP Ambositra', val: 42 }, { label: 'CFP Fandriana', val: 28 }, { label: 'LTP Manandriana', val: 19 }];
            const maxEtab = Math.max(...statsEtab.map(s => s.val), 1);


            const repartitionEtablissements = (() => {
              const listeAvecEffectifs = safeEtablissements.map((et) => {
                const idEt = (et.id_centre ?? et.id_etablissement ?? et.id)?.toString();
                const nomEt = (et.nom_etablissement || 'Centre').trim();

                const nbApprenants = safeApprenants.filter((app) => {
                  const appEtId = (app.etablissement_id ?? app.centre_id)?.toString();
                  const appEtNom = (app.etablissement || app.nom_etablissement || '').trim().toLowerCase();
                  return (idEt && appEtId === idEt) || (appEtNom && appEtNom === nomEt.toLowerCase());
                }).length;

                return { id: idEt || nomEt, nom: nomEt, count: nbApprenants };
              });


              const tries = [...listeAvecEffectifs].sort((a, b) => b.count - a.count);

              const centre1 = tries[0] || { id: 'c1', nom: 'Aucun centre', count: 0 };
              const centre2 = tries[1] || null;
              const autresCentres = tries.slice(2); 

              const totalAutres = autresCentres.reduce((acc, c) => acc + c.count, 0);
              const totalGlobal = centre1.count + (centre2 ? centre2.count : 0) + totalAutres;

              const pct1 = totalGlobal > 0 ? Math.round((centre1.count / totalGlobal) * 100) : 34;
              const pct2 = totalGlobal > 0 ? Math.round(((centre2 ? centre2.count : 0) / totalGlobal) * 100) : 33;
              const fin2 = pct1 + pct2;

              const gradientAnneau = totalGlobal > 0
                ? `conic-gradient(#3d99a3 0% ${pct1}%, #354046 ${pct1}% ${fin2}%, #8d999e ${fin2}% 100%)`
                : 'conic-gradient(#d1d5db 0% 100%)';

              const centreSelectActif = autresCentres.find((c) => c.id === selectedAutreCentreId) || autresCentres[0] || null;

              return {
                centre1,
                centre2,
                autresCentres,
                centreSelectActif,
                gradientAnneau,
                totalCentres: tries.length
              };
            })();

              const safeChefsCentre = 
                (typeof chefsCentre !== 'undefined' && Array.isArray(chefsCentre) && chefsCentre.length > 0) ? chefsCentre :
                (typeof listeChefs !== 'undefined' && Array.isArray(listeChefs) && listeChefs.length > 0) ? listeChefs :
                (typeof chefs !== 'undefined' && Array.isArray(chefs) && chefs.length > 0) ? chefs : [];

              const totalChefsCentre = Math.max(
                nbChefsDashboard,
                typeof chefsCentre !== 'undefined' && Array.isArray(chefsCentre) ? chefsCentre.length : 0,
                typeof listeChefs !== 'undefined' && Array.isArray(listeChefs) ? listeChefs.length : 0
              );



            return (
              <div style={{ backgroundColor: '#e6e8ea', padding: '16px', borderRadius: '6px', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
                <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8f9fa', 
                  borderRadius: '4px', padding: '14px 16px', marginBottom: '14px', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', gap: '10px' 
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Liste des Apprenants</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{totalApprenants}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Liste des Demandes</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{totalDemandes}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Traitement Attestation</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{demandesAttestation}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Traitement Diplôme</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{demandesDiplome}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Établissements</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{totalEtablissements}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Chef de Centre</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{totalChefsCentre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Champ Professionnel</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#222', marginTop: '4px' }}>{totalChampPro}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>        
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: '4px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>Candidats par Examen</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '160px', paddingTop: '20px', borderBottom: '1px solid #ddd' }}>
                      {statsExamens.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>{item.val}</span>
                          <div style={{ width: '100%', height: `${Math.max((item.val / maxExam) * 120, 8)}px`, backgroundColor: '#3d99a3', borderRadius: '2px 2px 0 0' }} />
                          <span style={{ fontSize: '0.72rem', color: '#555', marginTop: '6px', textAlign: 'center' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: '4px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>
                      Répartition par Établissement
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '160px', gap: '10px' }}>
                      <div style={{ 
                        width: '115px', height: '115px', borderRadius: '50%', flexShrink: 0,
                        background: repartitionEtablissements.gradientAnneau,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.4s ease'
                      }}>
                        <div style={{ 
                          width: '66px', height: '66px', borderRadius: '50%', 
                          backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', fontWeight: 'bold', fontSize: '0.82rem', 
                          color: '#333', textAlign: 'center', padding: '4px' 
                        }}>
                          {repartitionEtablissements.totalCentres} Centre{repartitionEtablissements.totalCentres > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#3d99a3', marginRight: '6px', flexShrink: 0, borderRadius: '2px' }} />
                          <span title={repartitionEtablissements.centre1.nom} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {repartitionEtablissements.centre1.nom} (<strong>{repartitionEtablissements.centre1.count} Apprenant(s)</strong>)
                          </span>
                        </div>

                        {repartitionEtablissements.centre2 && (
                          <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#354046', marginRight: '6px', flexShrink: 0, borderRadius: '2px' }} />
                            <span title={repartitionEtablissements.centre2.nom} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {repartitionEtablissements.centre2.nom} (<strong>{repartitionEtablissements.centre2.count} Apprenant(s)</strong>)
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#8d999e', marginRight: '6px', flexShrink: 0, borderRadius: '2px' }} />
                          
                          {repartitionEtablissements.autresCentres.length > 0 ? (
                            <select
                              value={repartitionEtablissements.centreSelectActif?.id || ''}
                              onChange={(e) => setSelectedAutreCentreId(e.target.value)}
                              style={{
                                border: '1px solid #dadce0',
                                borderRadius: '4px',
                                backgroundColor: '#ffffff',
                                color: '#333',
                                fontSize: '0.74rem',
                                fontWeight: '600',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                maxWidth: '145px',
                                outline: 'none'
                              }}
                              title="Sélectionner un autre centre pour voir son effectif"
                            >
                              {repartitionEtablissements.autresCentres.map((centre) => (
                                <option key={centre.id} value={centre.id}>
                                  {centre.nom} ({centre.count})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color: '#777', fontStyle: 'italic' }}>Autres Centres (0)</span>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>


                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: '4px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>
                      Champ Professionnel & Titres
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '160px' }}>                     
                      <div style={{ 
                        width: '120px', height: '120px', borderRadius: '50%', 
                        background: gradientAnneauChampPro,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.4s ease'
                      }}>
                        <div style={{ 
                          width: '70px', height: '70px', borderRadius: '50%', 
                          backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', 
                          fontSize: '0.85rem', color: '#333', textAlign: 'center', lineHeight: '1.1'
                        }}>
                          <span>{totalChampPro}</span>
                          <span style={{ fontSize: '0.68rem', color: '#666', fontWeight: '600' }}>Total</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#3d99a3', marginRight: '8px', borderRadius: '2px' }} />
                          <span>Secteurs (<strong>{nbSecteurs}</strong>)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#354046', marginRight: '8px', borderRadius: '2px' }} />
                          <span>Filières (<strong>{nbFilieres}</strong>)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#8d999e', marginRight: '8px', borderRadius: '2px' }} />
                          <span>Métiers (<strong>{nbMetiers}</strong>)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: '4px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'relative' }}>         
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>
                        Évolution du Taux de Délivrance (%)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowDetailsEvolution(!showDetailsEvolution)}
                        title={showDetailsEvolution ? "Masquer les détails par année" : "Afficher les détails par année"}
                        style={{
                          background: showDetailsEvolution ? '#e8f0fe' : 'transparent',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#3d99a3',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          width="16" 
                          height="16" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ transform: showDetailsEvolution ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>

                    <svg viewBox="0 0 400 145" style={{ width: '100%', height: '155px' }}>
                      <line x1="30" y1="120" x2="380" y2="120" stroke="#ddd" strokeWidth="1" />
                      
                      {pointsEvolutionSVG.length > 1 && (
                        <polyline fill="none" stroke="#3d99a3" strokeWidth="3" points={polylinePoints} />
                      )}

                      {pointsEvolutionSVG.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#3d99a3" />
                          <text x={pt.x} y={pt.y - 9} textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#333">
                            {pt.taux}%
                          </text>
                          <text x={pt.x} y="138" textAnchor="middle" fontSize="10.5" fill="#555">
                            {pt.annee}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {showDetailsEvolution && (
                      <div style={{ 
                        marginTop: '10px', 
                        paddingTop: '10px', 
                        borderTop: '1px solid #e0e0e0',
                        fontSize: '0.78rem'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ color: '#666', borderBottom: '1px solid #e0e0e0' }}>
                              <th style={{ padding: '4px 6px' }}>Session (An)</th>
                              <th style={{ padding: '4px 6px', textAlign: 'center' }}>Dossiers</th>
                              <th style={{ padding: '4px 6px', textAlign: 'center' }}>Délivrés</th>
                              <th style={{ padding: '4px 6px', textAlign: 'right' }}>Taux</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statsEvolution.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '5px 6px', fontWeight: 'bold', color: '#333' }}>{row.annee}</td>
                                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#555' }}>{row.total}</td>
                                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#137333', fontWeight: '600' }}>{row.delivres}</td>
                                <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 'bold', color: '#3d99a3' }}>{row.taux}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>


                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: '4px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>Résultat par Établissement (Effectifs)</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '160px', paddingTop: '20px', borderBottom: '1px solid #ddd' }}>
                      {statsEtab.map((et, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '65px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>{et.val}</span>
                          <div style={{ width: '36px', height: `${Math.max((et.val / maxEtab) * 110, 8)}px`, backgroundColor: '#3d99a3', borderRadius: '2px 2px 0 0' }} />
                          <span style={{ fontSize: '0.68rem', color: '#555', marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65px' }}>
                            {et.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
  
          {activeMenu === 'liste_apprenants' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="section-title" style={{ margin: 0 }}>
                  Registre Régional des Apprenants Inscrits (Données Réelles DRETFP)
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label className="btn-table-action" style={{ backgroundColor: 'white', cursor: 'pointer', display: 'inline-block', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: '600' }}>
                    📥 Importer la liste (Excel)
                    <input type="file" accept=".xlsx, .xls" onChange={importerDepuisExcel} style={{ display: 'none' }} />
                  </label>
                  <button className="btn-action-top" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', color: '#333' }} onClick={exporterVersExcel}>
                    📤 Exporter la liste (Excel)
                  </button>
                </div>
              </div>

              <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
               
              <div className="filter-bar" style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px', 
                marginBottom: '1rem', 
                alignItems: 'flex-end' 
              }}>
                <input 
                  type="text" 
                  placeholder="Rechercher par Nom ou N° d'Immatriculation (IM)..." 
                  className="search-input"
                  style={{ width: '220px' }}
                  value={searchApprenant}
                  onChange={(e) => setSearchApprenant(e.target.value)}
                />
                
                <select 
                  className="filter-select" 
                  value={selEtablissementId || 'Tous'} 
                  onChange={(e) => setSelEtablissementId(e.target.value)}
                >
                  <option value="Tous">Établissement: Tous</option>
                  {(listeEtablissements || etablissementsOptions || []).map((e, i) => {
                    const idEtab = e.id_etablissement ?? e.id ?? e.id_centre;
                    const nomEtab = e.nom_etablissement || e.nom || "Inconnu";
                    return <option key={idEtab || i} value={idEtab}>{nomEtab}</option>;
                  })}
                </select>

                <select 
                  className="filter-select" 
                  value={selSecteurId || 'Tous'} 
                  onChange={(e) => { 
                    setSelSecteurId(e.target.value); 
                    setSelFiliereId('Tous'); 
                    setSelMetierId('Tous'); 
                  }}
                >
                  <option value="Tous">Secteur: Tous</option>
                  {(listeSecteurs || secteursOptions || []).map((s, i) => {
                    const idSec = s.id_secteur ?? s.id;
                    const nomSec = s.nom_secteur || s.nom || "Inconnu";
                    return <option key={idSec || i} value={idSec}>{nomSec}</option>;
                  })}
                </select>

                <select 
                  className="filter-select" 
                  value={selFiliereId || 'Tous'} 
                  onChange={(e) => { 
                    setSelFiliereId(e.target.value); 
                    setSelMetierId('Tous'); 
                  }}
                >
                  <option value="Tous">Filière: Toutes</option>
                  {(listeFilieres || filieresOptions || [])
                    .filter(f => selSecteurId === 'Tous' || f.secteur_id?.toString() === selSecteurId?.toString())
                    .map((f, i) => {
                      const idFil = f.id_filiere ?? f.id;
                      const nomFil = f.nom_filiere || f.nom || "Inconnu";
                      return <option key={idFil || i} value={idFil}>{nomFil}</option>;
                    })}
                </select>

                <select 
                  className="filter-select" 
                  value={selMetierId || 'Tous'} 
                  onChange={(e) => setSelMetierId(e.target.value)}
                >
                  <option value="Tous">Métier: Tous</option>
                  {(listeMetiers || metiersOptions || [])
                    .filter(m => selFiliereId === 'Tous' || m.filiere_id?.toString() === selFiliereId?.toString())
                    .map((m, i) => {
                      const idMet = m.id_metier ?? m.id;
                      const nomMet = m.nom_metier || m.nom || "Inconnu";
                      return <option key={idMet || i} value={idMet}>{nomMet}</option>;
                    })}
                </select>

                <select 
                  className="filter-select" 
                  value={typeof filterAnnee !== 'undefined' ? filterAnnee : 'Tous'} 
                  onChange={(e) => {
                    if (typeof setFilterAnnee === 'function') setFilterAnnee(e.target.value);
                  }}
                >
                  <option value="Tous">Session:</option>
                  {[...new Set((apprenants || []).map(app => app.session).filter(Boolean))]
                    .sort((a, b) => b - a) 
                    .map((annee) => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))
                  }
                </select>


               
                <button 
                  type="button"
                  title="Ajouter un nouvel apprenant"
                  onClick={() => {
                    setSelectedApprenant(null); 
                    setModalMode('ajouter');   
                    setModalEtabId('');
                    setModalSecteurId('');
                    setModalFiliereId('');
                    setModalMetierId('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '38px',
                    width: '42px',
                    borderRadius: '4px',
                    border: '1px solid #1a73e8',
                    backgroundColor: '#e8f0fe',
                    color: '#1a73e8',
                    cursor: 'pointer',
                    fontSize: '1.3rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a73e8';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f0fe';
                    e.currentTarget.style.color = '#1a73e8';
                  }}
                >
                  <LuUserPlus style={{ flexShrink: 0 }} />
                </button>

              </div>

              </div>

              <div className="data-table-container">
                  {apprenantsCoches.length > 0 && (
                    <div 
                      className="bulk-actions-banner"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: '#e8f0fe', border: '1px solid #818892', borderRadius: '6px',
                        padding: '12px 20px', marginBottom: '15px', animation: 'fadeIn 0.2s ease-in-out'
                      }}
                    >
                      <div style={{ color: '#22b83b', fontWeight: '600', fontSize: '0.95rem' }}>
                        En général : <strong>{apprenantsCoches.length}</strong> apprenant(s) sélectionné(s)
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleActionGroupesDemandes('ATTESTATION')}
                          style={{ backgroundColor: '#90e9c4', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.88rem' }}
                        >
                          📜 Demande Attestations
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleActionGroupesDemandes('DIPLOME')}
                          style={{ backgroundColor: '#90e9c4', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.88rem' }}
                        >
                          🎓 Demande Diplômes
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleSuppressionGroupesApprenants}
                          style={{ backgroundColor: 'rgb(245, 97, 87)', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.88rem' }}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  )}

                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={(apprenantsFiltres || []).length > 0 && apprenantsCoches.length === (apprenantsFiltres || []).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const tousLesIds = apprenantsFiltres.map(app => app.id_apprenant || app.id);
                              setApprenantsCoches(tousLesIds);
                            } else {
                              setApprenantsCoches([]); 
                            }
                          }}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                      </th>
                      <th>N° IM (Matricule)</th>
                      <th>Nom & Prénoms</th>
                      <th>Date & Lieu Naissance</th>
                      <th>Examen & Session</th>
                      <th>Établissement & Secteur</th> 
                      <th>Filière & Métier</th>
                      <th>Mention</th>
                      <th>Statut Demande</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!apprenantsFiltres || apprenantsFiltres.length === 0) ? (
                      <tr>
                        <td colSpan="9" className="no-entries" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>
                          📭 Aucun apprenant inscrit ne correspond aux critères de recherche sélectionnés.
                        </td>
                      </tr>
                    ) : (
                      apprenantsFiltres.map((item, index) => {
                        
                        const etablissementTrouve = (listeEtablissements || []).find(e => {
                          const idBdd = e.id_etablissement ?? e.id ?? e.id_centre ?? e.centre_id;
                          const idApprenant = item.etablissement_id ?? item.centre_id;
                          return idBdd?.toString() === idApprenant?.toString();
                        });

                        const nomEtab = etablissementTrouve 
                          ? (etablissementTrouve.nom_etablissement || etablissementTrouve.nom || etablissementTrouve.nom_centre || etablissementTrouve.centre) 
                          : `Centre ID: ${item.etablissement_id || "N/A"}`;

                        const nomSec = (listeSecteurs || []).find(s => (s.id_secteur || s.id)?.toString() === item.secteur_id?.toString())?.nom_secteur || `Sec. ID: ${item.secteur_id || "N/A"}`;
                        const nomFil = (listeFilieres || []).find(f => (f.id_filiere || f.id)?.toString() === item.filiere_id?.toString())?.nom_filiere || `Fil. ID: ${item.filiere_id || "N/A"}`;
                        const nomMet = (listeMetiers || []).find(m => (m.id_metier || m.id)?.toString() === item.metier_id?.toString())?.nom_metier || `Mét. ID: ${item.metier_id || "N/A"}`;

                        let dateAffichee = "N/A";
                        if (item.date_naiss) {
                          if (item.date_naiss.includes('/')) {
                            dateAffichee = item.date_naiss;
                          } else {
                            const testDate = new Date(item.date_naiss);
                            dateAffichee = !isNaN(testDate.getTime()) ? testDate.toLocaleDateString('fr-FR') : item.date_naiss;
                          }
                        }

                        const demandeAssociee = (demandes || []).find(d => d.im_apprenant?.toString() === item.im_apprenant?.toString());
                        const statutDemande = (demandeAssociee?.statut || "AUCUNE_DEMANDE").toUpperCase();

                        const idLigneUnique = item.id_apprenant || item.id || index;
                        const isCoche = apprenantsCoches.includes(idLigneUnique);

                        return (
                          <tr key={idLigneUnique}>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isCoche}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setApprenantsCoches(prev => [...prev, idLigneUnique]);
                                  } else {
                                    setApprenantsCoches(prev => prev.filter(id => id !== idLigneUnique));
                                  }
                                }}
                                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                              />
                            </td>
                            <td><strong>{item.im_apprenant || "N/A"}</strong></td>
                            <td style={{ fontWeight: '500' }}>{item.nom_apprenant} {item.prenom_apprenant || ""}</td>
                            <td>{dateAffichee} à <span style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{item.lieu_naiss || "Inconnu"}</span></td>
                           
                            <td style={{ padding: '12px', fontSize: '0.88rem' }}>
                              <div style={{ fontWeight: 'bold', color: '#4b4f55' }}>
                                {
                                  (() => {
                                    const idBrut = item.examen_id?.toString();
                                    
                                    const exTrouve = (listeExamens || []).find(ex => {
                                      const idExamenModelle = ex.id_examen ?? ex.id ?? ex.examen_id ?? ex.id_ex;
                                      return idExamenModelle?.toString() === idBrut;
                                    });
                                    
                                    if (exTrouve) {
                                      const nomTexte = exTrouve.nom_examen ?? exTrouve.nom ?? exTrouve.libelle_examen ?? exTrouve.designation ?? exTrouve.titre;
                                      if (nomTexte) return nomTexte;
                                    }
                                    
                                    if (idBrut === '1') return 'BEP';
                                    if (idBrut === '2') return 'CAP';
                                    if (idBrut === '3') return 'CFA';
                                    
                                    return idBrut || 'BEP';
                                  })()
                                }
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>
                                ({item.session || '2026'})
                              </div>
                            </td>


                            <td>
                              <strong>{nomEtab}</strong>
                              <br/>
                              <small style={{ color: '#5f6368', fontStyle: 'italic' }}>{nomSec}</small>
                            </td>

                            <td>
                              <strong style={{ color: '#3c4043' }}>{nomFil}</strong>
                              <br/>
                              <small style={{ color: '#5f6368', fontStyle: 'italic' }}>{nomMet}</small>
                            </td>

                            <td><em style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{item.mention || 'Passable'}</em></td>
                            <td>
                              {statutDemande === 'TERMINER' && <span className="status-badge valide">✅ Terminé </span>}
                              {statutDemande === 'EN_COURS' && <span className="status-badge en-cours" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>⏳ En traitement</span>}
                              {statutDemande === 'EN_ATTENTE' && <span className="status-badge en-attente" style={{ backgroundColor: '#fef7e0', color: '#b06000' }}>⏳ En attente</span>}
                              {statutDemande === 'AUCUNE_DEMANDE' && <span className="status-badge offline" style={{ backgroundColor: '#f1f3f4', color: '#5f6368' }}>❌ Aucune</span>}
                            </td>
                                                      
                            <td>
                              <div className="dropdown-action-container" style={{ position: 'relative' }}>
                                <button 
                                  type="button"
                                  className="btn-three-dots"
                                  style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', padding: '4px 8px', fontWeight: 'bold' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === idLigneUnique ? null : idLigneUnique);
                                  }}
                                >
                                  ⋮
                                </button>

                                {openMenuId === idLigneUnique && (
                                  <div className={`dropdown-action-menu ${index >= apprenantsFiltres.length - 2 ? 'open-upward' : ''}`} style={{
                                    position: 'absolute', right: '0', top: '25px', backgroundColor: '#ffffff',
                                    border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                    zIndex: 100, minWidth: '170px', padding: '4px 0'
                                  }}>

                                    <button 
                                      type="button"
                                      className="dropdown-action-item" 
                                      style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }}
                                      onClick={(e) => { 
                                        e.stopPropagation();
                                        setSelectedApprenant({ ...item }); 
                                        setModalMode('details'); 
                                        setOpenMenuId(null); 
                                      }}
                                    >
                                      👁️ Détails
                                    </button>

                                    <button 
                                      type="button"
                                      className="dropdown-action-item" 
                                      style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }}
                                      onClick={(e) => { 
                                        e.stopPropagation();
                                        const apprenantSelectionne = { ...item };
                                        setSelectedApprenant(apprenantSelectionne); 
                                        setModalMode('modifier'); 
                                        setOpenMenuId(null);
                                        setModalEtabId(apprenantSelectionne.etablissement_id || '');
                                        setModalSecteurId(apprenantSelectionne.secteur_id || '');
                                        setModalFiliereId(apprenantSelectionne.filiere_id || '');
                                        setModalMetierId(apprenantSelectionne.metier_id || '');
                                      }}
                                    >
                                      ✏️ Modifier
                                    </button>


                                     <button 
                                      type="button"
                                      className="dropdown-action-item" 
                                      style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }}
                                      onClick={async (e) => { 
                                        e.stopPropagation(); 
                                        
                                        await transfererVersDemandes(item, 'ATTESTATION'); 
                                        
                                        setOpenMenuId(null); 
                                      }}
                                    >
                                      📜 Demande Attestation
                                    </button>
                                    <button 
                                      type="button"
                                      className="dropdown-action-item" 
                                      style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', cursor: 'pointer' }}
                                      onClick={async (e) => { 
                                        e.stopPropagation(); 
                                        
                                        await transfererVersDemandes(item, 'DIPLOME'); 
                                        
                                        setOpenMenuId(null); 
                                      }}
                                    >
                                      🎓 Demande Diplôme
                                    </button>

                                    <button 
                                      className="dropdown-action-item btn-item-delete" 
                                      style={{ width: '100%', border: 'none', background: 'none', padding: '#d93025', padding: '8px 12px', textAlign: 'left', cursor: 'pointer', color: '#d93025' }}
                                      onClick={() => { supprimerApprenant(item.id_apprenant || item.id); setOpenMenuId(null); }}
                                    >
                                      🗑️ Supprimer
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          )}         
        
          {activeMenu === 'liste_demandes' && (
            <div>
              <div className="section-title">Évaluation en temps réel des demandes entrantes</div> 
              <div className="filter-bar-row" style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '1.5rem', 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input 
                    type="text" 
                    placeholder="Saisir un nom ou n° matricule..." 
                    value={searchNomIm}
                    onChange={(e) => setSearchNomIm(e.target.value)}
                    style={{ height: '36px', padding: '0 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <select 
                    value={filterDoc} 
                    onChange={(e) => setFilterDoc(e.target.value)}
                    className="filter-select"
                    style={{ height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Tous">Document : Tous</option>
                    <option value="ATTESTATION">ATTESTATION</option>
                    <option value="DIPLOME"> DIPLÔME</option>
                  </select>
                </div>

                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <select 
                    value={filterCentre} 
                    onChange={(e) => setFilterCentre(e.target.value)}
                    className="filter-select"
                    style={{ height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Tous">Centre : Tous</option>
                    {[...new Set(demandes.map(d => d.centre_examen || d.centre).filter(Boolean))].map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <select 
                    value={filterStatutDemande} 
                    onChange={(e) => setFilterStatutDemande(e.target.value)}
                    className="filter-select"
                    style={{ height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Tous">Statut : Tous</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="EN_COURS">En traitement</option>
                    <option value="TERMINER">Validé / Terminer</option>
                  </select>
                </div>
              </div>
              <div className="data-table-container">
                {(demandesListeCochees || []).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', padding: '12px 20px', borderRadius: '6px', marginBottom: '15px' }}>
                    <span style={{ color: '#185abc', fontWeight: '600' }}>⚡ En masse : <strong>{demandesListeCochees.length}</strong> demande(s) prête(s) pour traitement</span>
                    <button
                      type="button"
                      onClick={handleEnvoyerAuTraitementGroupes}
                      style={{ backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                       Envoyer à la Liste de Traitement
                    </button>
                  </div>
                )}

                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={(() => {
                            const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
                            const selectionnables = catalogue.filter(d => !['TERMINER', 'OBTENU', 'EN_COURS', 'EN_TRAITEMENT'].includes((d.statut || "").toUpperCase()));
                            return selectionnables.length > 0 && (demandesListeCochees || []).length === selectionnables.length;
                          })()}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const idsSelectionnables = (demandesFiltrees || [])
                                .filter(d => !['EN_COURS', 'TERMINER', 'OBTENU'].includes((d.statut || "").toUpperCase()))
                                .map(d => d.id_demande ?? d.id);
                              setDemandesListeCochees(idsSelectionnables);
                            } else {
                              setDemandesListeCochees([]);
                            }
                          }}

                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th>Matricule</th>
                      <th>Nom Complet</th>
                      <th>Document</th>
                      <th>Centre d'Examen</th>
                      <th>Date Dépôt</th>
                      <th>Statut</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!demandesFiltrees || demandesFiltrees.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="no-entries" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>
                           Aucune demande de titre ne correspond aux critères de recherche.
                        </td>
                      </tr>
                    ) : (
                      demandesFiltrees.map((dem, index) => {
                        const matriculeAffiche = dem.im_apprenant || dem.matricule || "N/A";
                        const nomAffiche = dem.nom_complet || dem.nom || "Candidat Anonyme";
                        const docAffiche = dem.type_document || dem.type || "NON SPÉCIFIÉ";
                        const centreAffiche = dem.centre_examen || dem.centre || "Bureau Central";
                        const dateAffiche = dem.date_depot || dem.date_demande || "En cours";
                        const statutAffiche = (dem.statut || "EN_ATTENTE").toString().toUpperCase();

                        const estVerrouille = ['EN_COURS', 'TERMINER', 'OBTENU'].includes(statutAffiche);
                        
                        const idDemUnique = dem.id_demande || dem.id || index;
                        const isCochee = (demandesListeCochees || []).includes(idDemUnique);

                        return (
                          <tr key={idDemUnique} style={{ backgroundColor: isCochee ? '#f8f9fa' : 'transparent' }}>
                            
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <input
                                type="checkbox"
                                disabled={estVerrouille} 
                                checked={isCochee}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDemandesListeCochees(prev => [...(prev || []), idDemUnique]);
                                  } else {
                                    setDemandesListeCochees(prev => (prev || []).filter(id => id !== idDemUnique));
                                  }
                                }}
                                style={{ 
                                  cursor: estVerrouille ? 'not-allowed' : 'pointer',
                                  transform: 'scale(1.1)'
                                }}
                              />
                            </td>

                            <td><strong>{matriculeAffiche}</strong></td>
                            <td style={{ fontWeight: '500' }}>{nomAffiche}</td>
                            <td><span style={{ fontWeight: 600, color: '#002f6c' }}>{docAffiche}</span></td>
                            <td>{centreAffiche}</td>
                            <td>{dateAffiche}</td>
                            
                            <td>
                              {(() => {
                                if (statutAffiche === 'OBTENU') {
                                  return <span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#e6f4ea', color: '#137333' }}>🎓 Obtenu</span>;
                                }
                                if (statutAffiche === 'EN_COURS') {
                                  return <span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#fef7e0', color: '#b06000' }}>⏳ En cours</span>;
                                }
                                if (statutAffiche === 'EN_TRAITEMENT') {
                                  return <span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#e8f0fe', color: '#1a73e8' }}>⏳ En traitement</span>;
                                }
                                if (statutAffiche === 'TERMINER') {
                                  return <span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#e6f4ea', color: '#137333' }}>✅ Terminer</span>;
                                }
                                if (statutAffiche === 'RECU' || statutAffiche === 'EN_ATTENTE') {
                                  return <span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#f5f5f5', color: '#616161', border: '1px solid #dadce0' }}>⏳ En attente</span>;
                                }
                                return <span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#f5f5f5', color: '#616161' }}>⏳ En attente</span>;
                              })()}
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <button
                                  type="button"
                                  className="btn-traiter"
                                  disabled={estVerrouille}
                                  onClick={() => {
                                    setSelectedDemande(dem);
                                    setShowTraiteModal(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid #dadce0',
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                    cursor: estVerrouille ? 'not-allowed' : 'pointer',
                                    backgroundColor: estVerrouille ? '#f1f3f4' : '#ffffff',
                                    color: estVerrouille ? '#9aa0a6' : '#202124'
                                  }}
                                >
                                  Traître
                                </button>
                                
                                <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === idDemUnique ? null : idDemUnique); }}>⋮</span>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>


                </table>
              </div>
            </div>
          )}

          {activeMenu === 'demandes_en_ligne' && (
            <div>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🌐 Gestion des Demandes Déposées en Ligne (Portail Public)</span>
                
              </div>

              {(demandesEnLigneCochees || []).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', padding: '12px 20px', borderRadius: '6px', marginBottom: '15px', marginTop: '15px' }}>
                  <span style={{ color: '#185abc', fontWeight: '600' }}>⚡ En masse : <strong>{demandesEnLigneCochees.length}</strong> dossier(s) en ligne prêt(s) pour traitement</span>
                  <button
                    type="button"
                    onClick={handlePrendreEnChargeGroupes}
                    style={{ backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    📥 Prendre en charge les demandes sélectionnées
                  </button>
                </div>
              )}

              <div className="data-table-container" style={{ marginTop: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={(() => {
                            const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
                            const enAttente = catalogue.filter(d => (d.statut || "").toUpperCase() === 'EN_ATTENTE');
                            return enAttente.length > 0 && (demandesEnLigneCochees || []).length === enAttente.length;
                          })()}
                          onChange={(e) => {
                            const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
                            if (e.target.checked) {
                              const idsEnAttente = catalogue
                                .filter(d => (d.statut || "").toUpperCase() === 'EN_ATTENTE')
                                .map(d => d.id_demande ?? d.id);
                              setDemandesEnLigneCochees(idsEnAttente);
                            } else {
                              setDemandesEnLigneCochees([]);
                            }
                          }}
                          style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                        />
                      </th>
                      <th>Matricule</th>
                      <th>Nom & Prénoms</th>
                      <th>Type de Document</th>
                      <th>Établissement/Centre</th>
                      <th>Session</th>
                      <th>Date d'Envoi</th>
                      <th>Statut Portail</th>
                      <th style={{ textAlign: 'center' }}>Action Guichet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
                      const demandesEnLigne = catalogue.filter(d => (d.statut || "").toUpperCase() === 'EN_ATTENTE');

                      if (demandesEnLigne.length === 0) {
                        return (
                          <tr>
                            <td colSpan="9" className="no-entries" style={{ padding: '3rem', textAlign: 'center', color: '#5f6368' }}>
                              📭 Aucune nouvelle demande en ligne à prendre en charge pour le moment.
                            </td>
                          </tr>
                        );
                      }

                      return demandesEnLigne.map((dem, index) => {
                        const idDemUnique = dem.id_demande ?? dem.id ?? index;
                        const isCochee = (demandesEnLigneCochees || []).includes(idDemUnique);

                        return (
                          <tr key={idDemUnique} style={{ backgroundColor: isCochee ? '#f8f9fa' : 'transparent' }}>
                            
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <input
                                type="checkbox"
                                checked={isCochee}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDemandesEnLigneCochees(prev => [...(prev || []), idDemUnique]);
                                  } else {
                                    setDemandesEnLigneCochees(prev => (prev || []).filter(id => id !== idDemUnique));
                                  }
                                }}
                                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                              />
                            </td>

                            <td><strong>{dem.im_apprenant}</strong></td>
                            <td style={{ fontWeight: '500' }}>{dem.nom_complet}</td>
                            <td><span className="type-badge" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '3px 6px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '600' }}>{dem.type_document}</span></td>
                            <td>
                              <strong style={{ color: '#002f6c' }}>
                                {
                                  dem.centre_examen ? dem.centre_examen.toUpperCase() : "LTP AMBOSITRA"
                                }
                              </strong>
                            </td>

                            <td>{dem.session || "N/A"}</td>
                            <td>{dem.date_depot || "14/10/2026"}</td>
                            <td>
                              <span className="status-badge" style={{ backgroundColor: '#fef7e0', color: '#b06000', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem' }}>
                                ⏳ En attente
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn-valider-import"
                                style={{ backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                onClick={() => {
                                  if (typeof setSelectedDemande === 'function') setSelectedDemande(dem);
                                  if (typeof setShowTraiteModal === 'function') setShowTraiteModal(true);
                                }}
                              >
                                📥 Prendre en charge
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'simulateur_etudiant' && (
            <PortailPublic 
              listeEtablissements={listeEtablissements} 
              etablissementsOptions={etablissementsOptions} 
            />
          )}


          {activeMenu === 'traitement_attestation' && (
            <div>
              <div className="section-title">Traitement des Attestations Provisoires de Réussite</div>                           
                <div className="search-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>                  
                  <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Rechercher un dossier..."
                    value={searchTraitement}
                    onChange={(e) => setSearchTraitement(e.target.value)}
                    style={{ flex: '1', minWidth: '200px', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', fontSize: '0.90rem' }}
                  />

                  <select
                    className="filter-select"
                    value={sessionTraitement}
                    onChange={(e) => setSessionTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <option value="Tous"> Session: Toutes</option>
                    {[...new Set(catalogueGlobal.map(d => d.session).filter(Boolean))].sort((a, b) => b - a).map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filterDocTraitement}
                    onChange={(e) => setFilterDocTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <option value="Tous"> Document: Tous</option>
                    <option value="ATTESTATION">Attestation</option>
                    <option value="DIPLOME">Diplôme</option>
                  </select>

                  <select
                    className="filter-select"
                    value={filterCentreTraitement}
                    onChange={(e) => setFilterCentreTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem', maxWidth: '200px' }}
                  >
                    <option value="Tous"> Centre: Tous</option>
                    {[...new Set(catalogueGlobal.map(d => d.centre_examen || "CENTRE REGIONAL").filter(Boolean))].sort().map(centre => (
                      <option key={centre} value={centre}>{centre.toUpperCase()}</option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filterStatutTraitement}
                    onChange={(e) => setFilterStatutTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <option value="Tous"> Statut: Tous</option>
                    <option value="EN_COURS"> En traitement</option>
                    <option value="TERMINER"> Terminé</option>
                  </select>
                </div>


              <div className="data-table-container">
                {(demandesTraitementCochees || []).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', padding: '12px 20px', borderRadius: '6px', marginBottom: '15px' }}>
                    <span style={{ color: '#185abc', fontWeight: '600' }}>🖨️ Prêt à imprimer : <strong>{demandesTraitementCochees.length}</strong> attestation(s) en chaîne</span>
                    <button
                      type="button"
                      onClick={handleImpressionEnMasseAttestations}
                      style={{ backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Imprimer toutes les demandes
                    </button>
                  </div>
                )}

                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={
                            (() => {
                              const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
                              const enCours = catalogue.filter(d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'ATTESTATION');
                              return enCours.length > 0 && (demandesTraitementCochees || []).length === enCours.length;
                            })()
                          }
                          onChange={(e) => {
                            const catalogue = typeof listeDemandes !== 'undefined' ? listeDemandes : (typeof demandes !== 'undefined' ? demandes : []);
                            if (e.target.checked) {
                              const idsEnCours = catalogue
                                .filter(d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'ATTESTATION')
                                .map(d => d.id_demande ?? d.id);
                              setDemandesTraitementCochees(idsEnCours);
                            } else {
                              setDemandesTraitementCochees([]);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th>Matrice</th>
                      <th>Nom complet</th>
                      <th>Document</th>
                      <th>Centre d'Examen</th>
                      <th>Date Dépôt</th>
                      <th>Statut</th>
                      <th style={{ textAlign: 'center' }}>Décision Finale</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {(() => {
                        const fluxFiltreReal = (typeof attestationsTraiteesFiltrees !== 'undefined' ? attestationsTraiteesFiltrees : [])
                          .filter(d => (d.type_document || "").toUpperCase() === 'ATTESTATION');

                        if (fluxFiltreReal.length === 0) {
                          return <tr><td colSpan="8" className="no-entries" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>🔍 Aucun dossier d'attestation ne correspond à vos critères de recherche.</td></tr>;
                        }

                        return fluxFiltreReal.map((dem, index) => {
                          const statutAffiche = (dem.statut || "EN_COURS").toString().toUpperCase();
                          const idDemUnique = dem.id_demande ?? dem.id ?? index;
                          const isDemCochee = typeof demandesTraitementCochees !== 'undefined' && (demandesTraitementCochees || []).includes(idDemUnique);

                        return (
                          <tr key={idDemUnique} style={{ backgroundColor: isDemCochee ? '#f8f9fa' : 'transparent' }}>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isDemCochee}
                                onChange={(e) => {
                                  if (typeof setDemandesTraitementCochees !== 'undefined') {
                                    if (e.target.checked) {
                                      setDemandesTraitementCochees(prev => [...(prev || []), idDemUnique]);
                                    } else {
                                      setDemandesTraitementCochees(prev => (prev || []).filter(id => id !== idDemUnique));
                                    }
                                  }
                                }}
                                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                              />
                            </td>
                            <td><strong>{dem.im_apprenant}</strong></td>
                            <td style={{ fontWeight: '500' }}>{dem.nom_complet}</td>
                            <td><span className="type-badge" style={{ backgroundColor: '#f1f3f4', padding: '3px 6px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '500' }}>{dem.type_document}</span></td>
                            <td>{dem.centre_examen || "CENTRE REGIONAL"}</td>
                            <td>{dem.date_depot}</td>
                            <td>
                              <span className="status-badge" style={{ 
                                padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem',
                                backgroundColor: statutAffiche === 'TERMINER' ? '#e6f4ea' : '#e8f0fe', 
                                color: statutAffiche === 'TERMINER' ? '#137333' : '#1a73e8' 
                              }}>
                                {statutAffiche === 'TERMINER' ? '✅ Terminé' : ' En traitement'}
                              </span>
                            </td>
                            
                            <td style={{ textAlign: 'center', position: 'relative' }}>
                              {statutAffiche === 'TERMINER' ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                  
                                  <span 
                                    className="date-delivrance-badge"
                                    style={{
                                      backgroundColor: '#f1f3f4',
                                      color: '#3c4043',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      border: '1px solid #dadce0',
                                      display: 'inline-block'
                                    }}
                                  >
                                    🖨️ Délivré le {dem.date_depot || new Date().toLocaleDateString('fr-FR')}
                                  </span>

                                  <span 
                                    style={{ cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', fontWeight: 'bold', color: '#5f6368' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (typeof setOpenTraitementMenuId !== 'undefined') {
                                        setOpenTraitementMenuId(typeof openTraitementMenuId !== 'undefined' && openTraitementMenuId === idDemUnique ? null : idDemUnique);
                                      } else if (typeof setOpenMenuId !== 'undefined') {
                                        setOpenMenuId(typeof openMenuId !== 'undefined' && openMenuId === idDemUnique ? null : idDemUnique);
                                      }
                                    }}
                                  >
                                    ⋮
                                  </span>

                                  {((typeof openTraitementMenuId !== 'undefined' && openTraitementMenuId === idDemUnique) || (typeof openMenuId !== 'undefined' && openMenuId === idDemUnique)) && (
                                    <div className="dropdown-action-menu" style={{
                                      position: 'absolute', right: '10px', top: '35px', backgroundColor: '#ffffff',
                                      border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                      zIndex: 100, minWidth: '130px', padding: '4px 0'
                                    }}>
                                      <button
                                        type="button"
                                        className="dropdown-action-item btn-item-delete"
                                        style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#d93025' }}
                                        onClick={async () => {
                                          if (window.confirm(`⚠️ Annuler et supprimer définitivement l'archivage de la demande de ${dem.nom_complet} ?`)) {
                                            try {
                                              const idCible = dem.id_demande ?? dem.id;
                                              await API.delete(`/demandes/supprimer/${idCible}`);
                                              if (typeof chargerDemandes === 'function') await chargerDemandes();
                                            } catch (err) {
                                              alert("Erreur lors de la suppression.");
                                            }
                                          }
                                          if (typeof setOpenTraitementMenuId !== 'undefined') setOpenTraitementMenuId(null);
                                          if (typeof setOpenMenuId !== 'undefined') setOpenMenuId(null);
                                        }}
                                      >
                                        🗑️ Supprimer
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  style={{ backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                  onClick={async () => {
                                    if (typeof ImprimerEtValiderAttestation === 'function') {
                                      await ImprimerEtValiderAttestation(dem);
                                    }
                                  }}
                                >
                                  🖨️ Imprimer
                                </button>
                              )}
                            </td>
                       </tr>
                        );
                      });
                    })()}
                  </tbody>


                </table>
              </div>
            </div>
          )}
        
         {activeMenu === 'traitement_diplome' && (
            <div>
              <div className="section-title">Homologation et Signature des Diplômes Nationaux</div>
              <div className="data-table-container">
                <div className="search-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Rechercher un diplôme par nom ou matricule..."
                    value={searchTraitement}
                    onChange={(e) => setSearchTraitement(e.target.value)}
                    style={{ flex: '1', minWidth: '200px', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid #dadce0', fontSize: '0.90rem' }}
                  />

                  <select
                    className="filter-select"
                    value={sessionTraitement}
                    onChange={(e) => setSessionTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <option value="Tous"> Session: Toutes</option>
                    {[...new Set(catalogueGlobalDemandes.map(d => d.session).filter(Boolean))].sort((a, b) => b - a).map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filterDocTraitement}
                    onChange={(e) => setFilterDocTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <option value="Tous"> Document: Tous</option>
                    <option value="ATTESTATION">Attestation</option>
                    <option value="DIPLOME">Diplôme</option>
                  </select>

                  <select
                    className="filter-select"
                    value={filterCentreTraitement}
                    onChange={(e) => setFilterCentreTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem', maxWidth: '200px' }}
                  >
                    <option value="Tous"> Centre: Tous</option>
                    {[...new Set(catalogueGlobalDemandes.map(d => d.centre_examen || "LTP AMBOSITRA").filter(Boolean))].sort().map(centre => (
                      <option key={centre} value={centre}>{centre.toUpperCase()}</option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filterStatutTraitement}
                    onChange={(e) => setFilterStatutTraitement(e.target.value)}
                    style={{ height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dadce0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <option value="Tous"> Statut: Tous</option>
                    <option value="EN_COURS"> En cours</option>
                    <option value="TERMINER"> Obtenu</option>
                  </select>
                </div>

                    
                  {(diplomesCoches || []).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', padding: '12px 20px', borderRadius: '6px', marginBottom: '15px' }}>
                      <span style={{ color: '#185abc', fontWeight: '600' }}>⚡ En masse : <strong>{diplomesCoches.length}</strong> diplôme(s) prêt(s) pour l'exportation</span>
                      <button
                        type="button"
                        onClick={handleExporterGroupesDiplomesExcel}
                        style={{ backgroundColor: '#1e7e34', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                         Exporter les demandes en Excel
                      </button>
                    </div>
                  )}


                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={
                            (() => {
                              const lignesSelectionnables = (diplomesTraitesFiltres || [])
                                .filter(d => (d.statut || "").toUpperCase() !== 'OBTENU');
                              
                              return lignesSelectionnables.length > 0 && 
                                (diplomesCoches || []).length === lignesSelectionnables.length;
                            })()
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const idsSelectionnables = (diplomesTraitesFiltres || [])
                                .filter(d => (d.statut || "").toUpperCase() !== 'OBTENU')
                                .map(d => d.id_demande ?? d.id);
                              setDiplomesCoches(idsSelectionnables);
                            } else {
                              setDiplomesCoches([]);
                            }
                          }}
                          style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                        />
                      </th>
                      <th>Matricule (IM)</th>
                      <th>Nom & Prénoms</th>
                      <th>Date & Lieu Naiss.</th>
                      <th>Diplôme & Session</th>
                      <th>Établissement & Secteur</th>
                      <th>Filière & Métier</th>
                      <th>Mention</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {(() => {
                      const fluxFiltre = typeof diplomesTraitesFiltres !== 'undefined' ? diplomesTraitesFiltres : [];

                      if (fluxFiltre.length === 0) {
                        return <tr><td colSpan="9" className="no-entries" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>🔍 Aucun diplôme ne correspond à vos critères de recherche.</td></tr>;
                      }

                      return fluxFiltre.map((dem, index) => {
                        const statutAffiche = (dem.statut || "EN_COURS").toString().toUpperCase();
                        const idDemUnique = dem.id_demande ?? dem.id ?? index;
                        const isDemCochee = (diplomesCoches || []).includes(idDemUnique);

                        const cibleApprenant = (apprenants || []).find(app => 
                          String(app.im_apprenant).trim() === String(dem.im_apprenant).trim()
                        );

                        const nomSec = (listeSecteurs || []).find(s => (s.id_secteur || s.id)?.toString() === cibleApprenant?.secteur_id?.toString())?.nom_secteur || "GENIE CIVIL";
                        const nomFil = (listeFilieres || []).find(f => (f.id_filiere || f.id)?.toString() === cibleApprenant?.filiere_id?.toString())?.nom_filiere || "BATIMENT ET TRAVAUX PUBLICS";
                        const nomMet = (listeMetiers || []).find(m => (m.id_metier || m.id)?.toString() === cibleApprenant?.metier_id?.toString())?.nom_metier || "CHEF D'EQUIPE DE CHANTIER";
                        const etabTrouve = (listeEtablissements || []).find(e => (e.id_etablissement ?? e.id ?? e.id_centre)?.toString() === cibleApprenant?.etablissement_id?.toString());
                        const nomEtab = etabTrouve ? (etabTrouve.nom_etablissement || etabTrouve.nom) : (dem.centre_examen || "LTP AMBOSITRA");

                        let dateNaissance = "23/05/2002";
                        if (cibleApprenant?.date_naiss) {
                          dateNaissance = cibleApprenant.date_naiss.includes('-') 
                            ? new Date(cibleApprenant.date_naiss).toLocaleDateString('fr-FR') 
                            : cibleApprenant.date_naiss;
                        }

                        return (
                          <tr key={idDemUnique} style={{ backgroundColor: isDemCochee ? '#f8f9fa' : 'transparent' }}>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                disabled={statutAffiche === 'OBTENU'} 
                                checked={(diplomesCoches || []).includes(idDemUnique)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDiplomesCoches(prev => [...(prev || []), idDemUnique]);
                                  } else {
                                    setDiplomesCoches(prev => (prev || []).filter(id => id !== idDemUnique));
                                  }
                                }}
                                style={{ 
                                  cursor: statutAffiche === 'OBTENU' ? 'not-allowed' : 'pointer',
                                  transform: 'scale(1.1)' 
                                }}
                              />
                            </td>
                            <td><strong>{dem.im_apprenant}</strong></td>
                            <td style={{ fontWeight: '500' }}>{cibleApprenant?.nom_apprenant || dem.nom_complet} {cibleApprenant?.prenom_apprenant || ""}</td>
                            <td>{dateNaissance} à <span style={{ textTransform: 'uppercase', fontSize: '0.82rem' }}>{cibleApprenant?.lieu_naiss || "Ambositra"}</span></td>
                            <td><span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{cibleApprenant?.examen_id || "B.E.P"}</span> ({cibleApprenant?.session || dem.session || "N/A"})</td>
                            <td><strong>{nomEtab}</strong><br/><small style={{ color: '#5f6368', fontStyle: 'italic' }}>{nomSec}</small></td>
                            <td><strong style={{ color: '#3c4043' }}>{nomFil}</strong><br/><small style={{ color: '#5f6368', fontStyle: 'italic' }}>{nomMet}</small></td>
                            <td><em style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{cibleApprenant?.mention || 'Passable'}</em></td>                      
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              {statutAffiche === 'OBTENU' && (
                                <span 
                                  className="status-badge obtained" 
                                  style={{ padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', display: 'inline-block' }}
                                >
                                  🎓 Obtenu
                                </span>
                              )}

                              {statutAffiche === 'EN_COURS' && (
                                <span 
                                  className="status-badge clickable-en-cours" 
                                  onClick={() => handleBasculerStatutObtenu(dem)} 
                                  title="Cliquez pour marquer ce diplôme comme Obtenu"
                                  style={{ 
                                    padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem',
                                    backgroundColor: '#fef7e0', color: '#b06000', border: '1px solid #fce8b2',
                                    cursor: 'pointer', display: 'inline-block', transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fce8b2'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef7e0'; }}
                                >
                                  ⏳ En cours
                                </span>
                              )}

                              {(statutAffiche === 'EN_TRAITEMENT' || statutAffiche === 'EN_ATTENTE' || (statutAffiche !== 'EN_COURS' && statutAffiche !== 'OBTENU')) && (
                                <span 
                                  className="status-badge in-treatment" 
                                  style={{ padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc', display: 'inline-block' }}
                                >
                                  ⏳ En traitement
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>

              </div>
            </div>
          )}

          {activeMenu === 'liste_etablissements' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div className="section-title" style={{ margin: 0 }}>
                  Répertoire Officiel des Établissements et Centres de Formation (DRETFP)
                </div>
                
                <button 
                  className="btn-action-top" 
                  style={{ backgroundColor: '#002f6c' }} 
                  onClick={() => setShowAddEtablissement(true)}
                >
                  + Ajouter Établissement
                </button>
              </div>
              
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          className="table-checkbox"
                          checked={etablissements.length > 0 && selectedEtabIds.length === etablissements.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEtabIds(etablissements.map(emp => emp.id_centre));
                            } else {
                              setSelectedEtabIds([]);
                            }
                          }}
                        />
                      </th>
                      <th>Centre de codage</th>
                      <th>Nom de l'Établissement</th>
                      <th>Localisation / District</th>
                      <th>Contact</th>
                      <th>E-mail</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etablissements.length === 0 ? (
                      <tr><td colSpan="7" className="no-entries">Aucun établissement enregistré.</td></tr>
                    ) : (
                      etablissements.map((centre, index) => {
                        const isCoche = selectedEtabIds.includes(centre.id_centre);
                        return (
                          <tr key={centre.id_centre} className={isCoche ? 'row-selected' : ''}>
                            
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox"
                                className="table-checkbox"
                                checked={isCoche}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEtabIds([...selectedEtabIds, centre.id_centre]);
                                  } else {
                                    setSelectedEtabIds(selectedEtabIds.filter(id => id !== centre.id_centre));
                                  }
                                }}
                              />
                            </td>

                            <td><strong>{centre.code_centre}</strong></td>
                            <td>{centre.nom_etablissement}</td>
                            <td>{centre.localisation_district}</td>
                            <td>{centre.contact}</td>
                            <td style={{ color: '#1a73e8' }}>{centre.email}</td>
                            
                            <td>
                              <div className="dropdown-action-container">
                                <button 
                                  className="btn-three-dots"
                                  onClick={() => setOpenEtabMenuId(openEtabMenuId === centre.id_centre ? null : centre.id_centre)}
                                >
                                  ⋮
                                </button>

                                {openEtabMenuId === centre.id_centre && (
                                  <div className={`dropdown-action-menu ${index === etablissements.length - 1 ? 'open-upward' : ''}`}>
                                    <button className="dropdown-action-item" onClick={() => { setSelectedEtablissement(centre); setShowDetailsEtablissement(true); setOpenEtabMenuId(null); }}
                                      style={{
                                        padding: '9px 14px',
                                        fontSize: '0.84rem',
                                        color: '#615d5d',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f1f3f4',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}>
                                      👁️ Details
                                    </button>
                                    <button className="dropdown-action-item" onClick={() => { setSelectedEtablissement(centre); setContactEtab(centre.contact.replace('+261 ', '').replace(/\s+/g, '')); setShowEditEtablissement(true); setOpenEtabMenuId(null); }}
                                      style={{
                                        padding: '9px 14px',
                                        fontSize: '0.84rem',
                                        color: '#615d5d',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f1f3f4',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}>
                                        ✏️ Modificateur</button>
                                                                                 
                                    <div
                                      onClick={() => {
                                        const idCentreLigne = openMenuId;
                                        
                                        if (typeof setOpenMenuId === 'function') setOpenMenuId(null);
                                        setPreselectedEtabId(idCentreLigne?.toString() || '');
                                        setShowAddChefModal(true);
                                      }}
                                      style={{
                                        padding: '9px 14px',
                                        fontSize: '0.84rem',
                                        color: '#615d5d',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f1f3f4',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f4'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                                    >
                                      <span>👤</span> Ajouter Chef-Centre
                                    </div>
                                    
                                    <button 
                                      className="dropdown-action-item btn-item-delete" 
                                      onClick={async () => { 
                                        if(window.confirm(`⚠️ ATTENTION : Voulez-vous supprimer définitivement l'établissement "${centre.nom_etablissement}" du répertoire officiel ?`)) {
                                          try {
                                            await API.delete(`/etablissements/supprimer/${centre.id_centre}`);
                                            
                                            alert(`🗑️ L'établissement "${centre.nom_etablissement}" a été supprimé avec succès de la base SQL !`);
                                            
                                            await chargerEtablissements(); 
                                          } catch (err) {
                                            alert(err.response?.data?.detail || "Erreur lors de la suppression sur le serveur central.");
                                          }
                                        }
                                        setOpenEtabMenuId(null); 
                                      }}
                                    >
                                      🗑️ Supprimer
                                    </button>


                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '1.5rem', alignItems: 'center' }}>
                
                <button
                  className="btn-action-top"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                  disabled={selectedEtabIds.length === 0}
                   onClick={() => {
                    const centresCoches = etablissements.filter(e => selectedEtabIds.includes(e.id_centre));
                    
                    centresCoches.forEach(centre => {
                      const numNettoye = centre.contact.replace(/\s+/g, '').replace('+', '').replace('(', '').replace(')', '').replace(/-/g, '');
                      
                      const texteBrut = "Bonjour Monsieur le Chef de Centre,\n\nVoici votre lien d'accès sécurisé à distance pour enregistrer les notes :\nhttps://loca.lt\n\n⚠️ *CONSIGNE IMPORTANT AU PREMIER CLIC :*\nUne page bleue de sécurité va s'ouvrir. Descendez un peu, collez le code de sécurité suivant dans la case 'Endpoint IP' : [153.67.85.106] et cliquez sur 'Click to Continue' pour afficher votre formulaire.";
                      
                      const messageCode = encodeURIComponent(texteBrut);
                      window.open("https://wa.me/" + numNettoye + "?text=" + messageCode, "_blank");
                    });
                  }}
                >
                  💬 Envoyer le lien sur WhatsApp ({selectedEtabIds.length})
                </button>



                <button
                  className="btn-action-top"
                  style={{ 
                    backgroundColor: '#002f6c', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: selectedEtabIds.length > 0 ? 1 : 0.5,
                    cursor: selectedEtabIds.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                  disabled={selectedEtabIds.length === 0}
                  onClick={() => {
                    const centresCoches = etablissements.filter(e => selectedEtabIds.includes(e.id_centre));
                    const listeEmails = centresCoches.map(e => e.email).join(',');
                    const sujet = encodeURIComponent("DRETFP Fianarantsoa — Portail de saisie des fiches d'examen");
                    const message = encodeURIComponent(`Bonjour, voici le lien de saisie sécurisé DRETFP pour votre centre d'examen : https://loca.lt , Le Responsable de la Direction Régionale.`);
                    
                    window.open(`mailto:${listeEmails}?subject=${sujet}&body=${corps}`, '_blank');
                  }}
                >
                  ✉️ Envoyer le lien sur E-mail ({selectedEtabIds.length})
                </button>

                {selectedEtabIds.length > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#5f6368', fontWeight: '500' }}>
                    {selectedEtabIds.length} centre(s) sélectionné(s) pour l'envoi à distance.
                  </span>
                )}
              </div>

            

            </div>
          )}

          {activeMenu === 'liste_examens' && (
            <div className="tab-content-fade">
              <div className="dashboard-header-line">
                <div>
                  <h1 className="main-dashboard-title">Répertoire des Examens Officiels</h1>
                  <p className="dashboard-subtitle">Gestion des titres et des diplômes d'État de la DRETFP Amoron'i Mania</p>
                </div>
              </div>

              <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '15px' }}>
                <input 
                  type="text" 
                  placeholder="Rechercher un examen par son nom (Ex: CAP, BEP)..." 
                  className="search-input"
                  style={{ width: '320px', height: '38px' }}
                  value={searchExamen || ''}
                  onChange={(e) => setSearchExamen(e.target.value)}
                />

                <button 
                  type="button"
                  title="Créer un nouvel examen"
                  onClick={() => {
                    setSelectedExamen(null);
                    setExamenModalMode('ajouter');
                    setShowExamenModal(true);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 16px',
                    borderRadius: '4px', border: '1px solid #1a73e8', backgroundColor: '#e8f0fe',
                    color: '#1a73e8', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a73e8'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'; }}
                >
                  ➕ Ajouter un Examen
                </button>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Code Examen (ID)</th>
                      <th>Intitulé de l'Examen</th>
                      <th>Description / Remarques</th>
                      <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listeExamens || []).filter(ex => {
                      const nomAFiltrer = ex.nom_exam || ex.nom_examen || "";
                      return !searchExamen || nomAFiltrer.toLowerCase().includes(searchExamen.toLowerCase());
                    }).length === 0 ? (
                      <tr><td colSpan="4" className="no-entries">Aucun examen enregistré ne correspond à votre recherche.</td></tr>
                    ) : (
                      (listeExamens || [])
                        .filter(ex => {
                          const nomAFiltrer = ex.nom_exam || ex.nom_examen || "";
                          return !searchExamen || nomAFiltrer.toLowerCase().includes(searchExamen.toLowerCase());
                        })
                        .map((ex, index) => {
                          const idActuel = ex.id_examen ?? ex.id ?? index;                         
                          const nomAffichage = ex.nom_exam || ex.nom_examen || "INTITULÉ INCONNU";

                          return (
                            <tr key={idActuel}>
                              <td><strong>EXAM-{idActuel}</strong></td>
                              
                              <td style={{ color: '#002f6c', fontWeight: '600' }}>{nomAffichage}</td>
                              
                              <td style={{ color: '#5f6368', fontStyle: 'italic', fontSize: '0.88rem' }}>
                                {ex.description_exam || ex.description || "Aucune description enregistrée pour ce diplôme."}
                              </td>
                              
                              <td style={{ position: 'relative', textAlign: 'center' }}>
                                <span 
                                  style={{ cursor: 'pointer', fontSize: '1.2rem', padding: '4px 10px', fontWeight: 'bold', color: '#5f6368', display: 'inline-block' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenExamenMenuId(openExamenMenuId === idActuel ? null : idActuel);
                                  }}
                                >
                                  ⋮
                                </span>

                                {openExamenMenuId === idActuel && (
                                  <div className="dropdown-action-menu" style={{
                                    position: 'absolute', right: '10px', top: '30px', backgroundColor: '#ffffff',
                                    border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                    zIndex: 110, minWidth: '130px', padding: '4px 0'
                                  }}>
                                    <button 
                                      type="button" 
                                      className="dropdown-action-item"
                                      onClick={() => {
                                        setSelectedExamen(ex);
                                        setExamenModalMode('modifier');
                                        setShowExamenModal(true);
                                        setOpenExamenMenuId(null);
                                      }}
                                    >
                                      ✏️ Modifier
                                    </button>
                                    <button 
                                      type="button" 
                                      className="dropdown-action-item btn-item-delete"
                                      onClick={() => {
                                        handleSupprimerExamen(idActuel);
                                        setOpenExamenMenuId(null);
                                      }}
                                    >
                                      🗑️ Supprimer
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          )}
         
          {activeMenu === 'liste_secteurs' && (
            <div>
              <div className="section-title">Nomenclature des Secteurs d'Enseignement Technique</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '20px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher par Code ID, Nom ou Établissement..." 
                  className="search-input"
                  style={{ width: '400px', height: '38px', padding: '0 12px', borderRadius: '4px', border: '1px solid #dadce0' }}
                  value={searchSecteur}
                  onChange={(e) => setSearchSecteur(e.target.value)}
                />
                <button 
                  className="btn-action-top" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px' }}
                  onClick={() => { setSecteurModalMode('ajouter'); setSelectedSecteur(null); setShowSecteurModal(true); }}
                >
                  ➕ Ajouter un Secteur
                </button>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code Secteur (ID)</th>
                      <th>Nom du Secteur</th>
                      <th>Établissement de Rattachement</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secteursVisualises.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="no-entries">
                          Aucun secteur ne correspond à tes critères de recherche.
                        </td>
                      </tr>
                    ) : (
                      secteursVisualises.map((sec, index) => {
                        const idActuel = sec.id_secteur ?? sec.id ?? index;

                        const etablissementTrouve = (listeEtablissements || []).find(e => {
                          const idBddEtab = e.id_etablissement ?? e.id ?? e.id_centre ?? e.centre_id;
                          const idTargetSecteur = sec.etablissement_id ?? sec.centre_id;
                          
                          return idBddEtab?.toString() === idTargetSecteur?.toString();
                        });

                        const nomEtab = etablissementTrouve 
                          ? (etablissementTrouve.nom_etablissement || etablissementTrouve.nom || etablissementTrouve.nom_centre) 
                          : `Établissement N° ${sec.etablissement_id || 'Inconnu'}`;

                        return (
                          <tr key={idActuel}>
                            <td><strong>SEC-{idActuel}</strong></td>
                            <td style={{ color: '#002f6c', fontWeight: '600' }}>{sec.nom_secteur}</td>
                            
                            <td style={{ fontWeight: '500', color: '#3c4043' }}>{nomEtab}</td>
                            
                            <td>
                              <span style={{ fontSize: '0.85rem', color: '#5f6368', fontStyle: 'italic' }}>
                                {sec.description_sec || "Aucune description."}
                              </span>
                            </td>
                            
                            <td style={{ position: 'relative', textAlign: 'center' }}>
                              <span 
                                style={{ cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px', fontWeight: 'bold', color: '#5f6368', display: 'inline-block' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenSecteurMenuId(openSecteurMenuId === idActuel ? null : idActuel);
                                }}
                              >
                                ⋮
                              </span>

                              {openSecteurMenuId === idActuel && (
                                <div className="dropdown-action-menu" style={{
                                  position: 'absolute', right: '40%', top: '30px', backgroundColor: '#ffffff',
                                  border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                  zIndex: 110, minWidth: '130px', padding: '4px 0'
                                }}>
                                  <button 
                                    type="button"
                                    className="dropdown-action-item" 
                                    style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#3c4043' }}
                                    onClick={() => {
                                      setSelectedSecteur(sec);
                                      setSecteurModalMode('modifier');
                                      setShowSecteurModal(true);
                                      setOpenSecteurMenuId(null);
                                    }}
                                  >
                                    ✏️ Modifier
                                  </button>
                                  <button 
                                    type="button"
                                    className="dropdown-action-item btn-item-delete" 
                                    style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#d93025' }}
                                    onClick={() => { 
                                      handleSupprimerSecteur(idActuel); 
                                      setOpenSecteurMenuId(null); 
                                    }}
                                  >
                                    🗑️ Supprimer
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeMenu === 'liste_filieres' && (
            <div>
              <div className="section-title">Nomenclature des Filières d'Enseignement Technique</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '20px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher par ID, Filière ou Secteur rattaché..." 
                  className="search-input"
                  style={{ width: '400px', height: '38px', padding: '0 12px', borderRadius: '4px', border: '1px solid #dadce0' }}
                  value={searchFiliere}
                  onChange={(e) => setSearchFiliere(e.target.value)}
                />
                <button 
                  className="btn-action-top" 
                  style={{ height: '38px', padding: '0 16px' }}
                  onClick={() => { setFiliereModalMode('ajouter'); setSelectedFiliere(null); setShowFiliereModal(true); }}
                >
                  ➕ Ajouter une Filière
                </button>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code Filière</th>
                      <th>Nom de la Filière</th>
                      <th>Secteur Technologique Affilié</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listeFilieres || [])
                      .filter(f => {
                        const nomSecteur = listeSecteurs.find(s => (s.id_secteur || s.id)?.toString() === f.secteur_id?.toString())?.nom_secteur || "";
                        const saisie = searchFiliere.toLowerCase();
                        return `FIL-${f.id_filiere || f.id}`.toLowerCase().includes(saisie) || f.nom_filiere?.toLowerCase().includes(saisie) || nomSecteur.toLowerCase().includes(saisie);
                      })
                      .map((fil, index) => {
                        const idFil = fil.id_filiere || fil.id;
                        const nomSec = listeSecteurs.find(s => (s.id_secteur || s.id)?.toString() === fil.secteur_id?.toString())?.nom_secteur || `${fil.secteur_id}`;

                        return (
                          <tr key={idFil || index}>
                            <td><strong>FIL-{idFil}</strong></td>
                            <td style={{ color: '#002f6c', fontWeight: '600' }}>{fil.nom_filiere}</td>
                            <td style={{ fontWeight: '500', color: '#202124' }}>{nomSec}</td>
                            <td><span style={{ fontSize: '0.85rem', color: '#5f6368', fontStyle: 'italic' }}>{fil.description_fil || "Aucune description."}</span></td>
                            <td style={{ position: 'relative', textAlign: 'center' }}>
                              <span 
                                style={{ cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px', fontWeight: 'bold', color: '#5f6368' }}
                                onClick={(e) => { e.stopPropagation(); setOpenFiliereMenuId(openFiliereMenuId === idFil ? null : idFil); }}
                              >
                                ⋮
                              </span>
                              {openFiliereMenuId === idFil && (
                                <div className="dropdown-action-menu" style={{ position: 'absolute', right: '40%', top: '30px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 110, minWidth: '130px', padding: '4px 0' }}>
                                  <button className="dropdown-action-item" style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#3c4043' }}
                                    onClick={() => { setSelectedFiliere(fil); setFiliereModalMode('modifier'); setShowFiliereModal(true); setOpenFiliereMenuId(null); }}
                                  >✏️ Modifier</button>
                                  <button className="dropdown-action-item btn-item-delete" style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#d93025' }}
                                    onClick={() => { handleSupprimerFiliere(idFil); setOpenFiliereMenuId(null); }}
                                  >🗑️ Supprimer</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'liste_metiers' && (
            <div>
              <div className="section-title">Nomenclature des Métiers d'Enseignement Technique</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '20px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher par ID, Métier ou Filière affiliée..." 
                  className="search-input"
                  style={{ width: '400px', height: '38px', padding: '0 12px', borderRadius: '4px', border: '1px solid #dadce0' }}
                  value={searchMetier}
                  onChange={(e) => setSearchMetier(e.target.value)}
                />
                <button 
                  className="btn-action-top" 
                  style={{ height: '38px', padding: '0 16px' }}
                  onClick={() => { setMetierModalMode('ajouter'); setSelectedMetier(null); setShowMetierModal(true); }}
                >
                  ➕ Ajouter un Métier
                </button>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code Métier</th>
                      <th>Nom du Métier</th>
                      <th>Filière Technique Affiliée</th>
                      <th>Description / Débouchés</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listeMetiers || [])
                      .filter(m => {
                        const nomFiliere = listeFilieres.find(f => (f.id_filiere || f.id)?.toString() === m.filiere_id?.toString())?.nom_filiere || "";
                        const saisie = searchMetier.toLowerCase();
                        return `MET-${m.id_metier || m.id}`.toLowerCase().includes(saisie) || m.nom_metier?.toLowerCase().includes(saisie) || nomFiliere.toLowerCase().includes(saisie);
                      })
                      .map((met, index) => {
                        const idMet = met.id_metier || met.id;
                        const nomFil = listeFilieres.find(f => (f.id_filiere || f.id)?.toString() === met.filiere_id?.toString())?.nom_filiere || `Filière N° ${met.filiere_id}`;

                        return (
                          <tr key={idMet || index}>
                            <td><strong>MET-{idMet}</strong></td>
                            <td style={{ color: '#002f6c', fontWeight: '600' }}>{met.nom_metier}</td>
                            <td style={{ fontWeight: '500', color: '#202124' }}>{nomFil}</td>
                            <td><span style={{ fontSize: '0.85rem', color: '#5f6368', fontStyle: 'italic' }}>{met.description_met || "Aucune description."}</span></td>
                            <td style={{ position: 'relative', textAlign: 'center' }}>
                              <span 
                                style={{ cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px', fontWeight: 'bold', color: '#5f6368' }}
                                onClick={(e) => { e.stopPropagation(); setOpenMetierMenuId(openMetierMenuId === idMet ? null : idMet); }}
                              >
                                ⋮
                              </span>
                              {openMetierMenuId === idMet && (
                                <div className="dropdown-action-menu" style={{ position: 'absolute', right: '40%', top: '30px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 110, minWidth: '130px', padding: '4px 0' }}>
                                  <button className="dropdown-action-item" style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#3c4043' }}
                                    onClick={() => { setSelectedMetier(met); setMetierModalMode('modifier'); setShowMetierModal(true); setOpenMetierMenuId(null); }}
                                  >✏️ Modifier</button>
                                  <button className="dropdown-action-item btn-item-delete" style={{ width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#d93025' }}
                                    onClick={() => { handleSupprimerMetier(idMet); setOpenMetierMenuId(null); }}
                                  >🗑️ Supprimer</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'resultat_etablissement' && (
            <div>
              <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '10px', 
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#002f6c', fontSize: '1.05rem', fontWeight: '700' }}>
                      Toutes les Chefs de centre déjà occupés
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#5f6368' }}>
                      Liste officielle des responsables habilités par établissement ({(chefsCentre || []).length} actif{(chefsCentre || []).length > 1 ? 's' : ''})
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof setShowAddChefModal === 'function') {
                        setShowAddChefModal(true);
                      } else if (typeof setShowModalChef === 'function') {
                        setShowModalChef(true);
                      } else {
                        alert("Formulaire d'ajout prêt à être lié à votre modale !");
                      }
                    }}
                    style={{
                      backgroundColor: '#1a73e8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 5px rgba(26, 115, 232, 0.25)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1557b0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1a73e8'; }}
                  >
                    <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>+</span>
                    <span>Ajouter un Chef de Centre</span>
                  </button>
                </div>
              {!selectedChefView ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginTop: '15px' }}>               
                    {(chefsCentre || []).map((chef, index) => {
                      const idChefUnique = chef.id_chef ?? chef.id ?? chef.username ?? `carte_chef_${index}`;
                      const isMenuOpen = openCardMenuId === idChefUnique;
                      const initiale = (chef.nom_complet || chef.nom || chef.username || 'C').charAt(0).toUpperCase();

                      const tousLesEtab = typeof etablissements !== 'undefined' ? etablissements : (typeof listeEtablissements !== 'undefined' ? listeEtablissements : []);
                      const idEtabChef = (chef.id_etablissement ?? chef.etablissement_id)?.toString();
                      
                      const etabTrouve = tousLesEtab.find(
                        (et) => (et.id_centre ?? et.id_etablissement ?? et.id)?.toString() === idEtabChef
                      );

                      const nomReelCentre = etabTrouve?.nom_etablissement || chef.nom_etablissement || chef.etablissement || `Centre ${idEtabChef || ''}`;

                    return (
                      <div 
                        key={idChefUnique} 
                        style={{ 
                          backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0', 
                          overflow: 'visible', position: 'relative', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' 
                        }}
                      >
                        <div style={{ backgroundColor: '#e8eff7', height: '105px', borderRadius: '8px 8px 0 0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenCardMenuId(isMenuOpen ? null : idChefUnique);
                            }}
                            style={{
                              position: 'absolute', top: '12px', left: '12px',
                              background: isMenuOpen ? '#002f6c' : 'transparent',
                              color: isMenuOpen ? '#ffffff' : '#1f1f1f',
                              border: 'none', borderRadius: '4px', width: '30px', height: '30px',
                              fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Options du Chef de Centre"
                          >
                            ☰
                          </button>

                          {isMenuOpen && (
                            <div style={{
                              position: 'absolute', top: '45px', left: '12px', zIndex: 50,
                              backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '195px', overflow: 'hidden'
                            }}>
                              <div
                                onClick={() => ouvrirInterfaceChef(chef, 'profil')}
                                style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#202124', cursor: 'pointer', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f3f4'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                <span>👤</span> Profil complet
                              </div>

                              <div
                                onClick={() => ouvrirInterfaceChef(chef, 'documents')}
                                style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#202124', cursor: 'pointer', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f3f4'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                <span>📂</span> Liste des documents
                              </div>

                              <div
                                onClick={() => ouvrirInterfaceChef(chef, 'parametres')}
                                style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#202124', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f3f4'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                <span>⚙️</span> Paramètres
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (chef.a_envoye_donnees) {
                                ouvrirInterfaceChef(chef, 'documents');
                              } else {
                                alert(`⏳ Aucune liste ni rapport n'a encore été transmis par ${chef.nom_chefcentre} pour cet établissement.`);
                              }
                            }}
                            title={
                              chef.a_envoye_donnees
                                ? `🔔 Transmission reçue : ${chef.nb_apprenants_envoyes} apprenant(s) envoyé(s). Cliquez pour consulter.`
                                : "🔕 En attente de transmission des listes / rapports"
                            }
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: chef.a_envoye_donnees ? '#ffffff' : 'transparent',
                              border: chef.a_envoye_donnees ? '1px solid #d2e3fc' : 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: chef.a_envoye_donnees ? '0 2px 5px rgba(26, 115, 232, 0.2)' : 'none',
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="17"
                              height="17"
                              stroke={chef.a_envoye_donnees ? '#1a73e8' : '#80868b'}
                              strokeWidth="2.2"
                              fill={chef.a_envoye_donnees ? '#e8f0fe' : 'none'}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>

                            {chef.a_envoye_donnees && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  backgroundColor: '#ea4335',
                                  color: '#ffffff',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  minWidth: '16px',
                                  height: '16px',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 4px',
                                  border: '1.5px solid #ffffff'
                                }}
                              >
                                {chef.nb_apprenants_envoyes}
                              </span>
                            )}
                          </button>


                          <div style={{ position: 'relative', width: '54px', height: '54px' }}>
                            <div style={{ 
                              width: '54px', 
                              height: '54px', 
                              borderRadius: '50%', 
                              backgroundColor: '#9ab9e8', 
                              color: '#ffffff', 
                              fontSize: '1.3rem', 
                              fontWeight: 'bold', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              {initiale}
                            </div>

                            <span
                              title={chef.est_connecte ? " Compte activé et connecté sur le Chef de Centre" : " Pas encore connecté / Non activé"}
                              style={{
                                position: 'absolute',
                                bottom: '1px',
                                right: '1px',
                                width: '13px',
                                height: '13px',
                                borderRadius: '50%',
                                backgroundColor: chef.est_connecte ? '#22c55e' : '#ffffff',
                                border: '2px solid #ffffff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                              }}
                            />
                          </div>

                        </div>

                        <div style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontWeight: '700', color: '#202124', fontSize: '0.95rem', textTransform: 'uppercase' }}>
                            {chef.nom_complet || chef.nom || chef.username || 'Responsable'}
                          </div>
                          <div style={{ color: '#5f6368', fontSize: '0.85rem', marginTop: '2px' }}>
                            {chef.prenom || chef.email || ''}
                          </div>
                          <div style={{ marginTop: '12px', display: 'inline-block', backgroundColor: '#f1f3f4', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600', color: '#3c4043' }}>
                            🏛️  {nomReelCentre}
                          </div>

                          {(() => {
                            const cleStatut = (chef.id_chefcentre ?? chef.id ?? chef.username)?.toString();
                            const statutEnvoi = statutsEnvoiChefs[cleStatut] || { email: false, whatsapp: false };

                            let texteLegende = "Aucun accès envoyé";
                            let couleurFond = "#fef7e0";
                            let couleurTexte = "#b06000";
                            let couleurBordure = "#fde293";
                            let iconeLegende = "⏳";

                            if (statutEnvoi.email && statutEnvoi.whatsapp) {
                              texteLegende = "Accès envoyé (E-mail & WhatsApp)";
                              couleurFond = "#e6f4ea";
                              couleurTexte = "#137333";
                              couleurBordure = "#ceead6";
                              iconeLegende = "✅";
                            } else if (statutEnvoi.email) {
                              texteLegende = "Accès envoyé sur Email";
                              couleurFond = "#e8f0fe";
                              couleurTexte = "#1a73e8";
                              couleurBordure = "#d2e3fc";
                              iconeLegende = "✉️";
                            } else if (statutEnvoi.whatsapp) {
                              texteLegende = "Accès envoyé sur WhatsApp";
                              couleurFond = "#e6f4ea";
                              couleurTexte = "#137333";
                              couleurBordure = "#ceead6";
                              iconeLegende = "💬";
                            }

                            return (
                              <div style={{ marginTop: '10px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backgroundColor: couleurFond,
                                  color: couleurTexte,
                                  border: `1px solid ${couleurBordure}`,
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.73rem',
                                  fontWeight: '600'
                                }}>
                                  <span>{iconeLegende}</span>
                                  <span>{texteLegende}</span>
                                </span>
                              </div>
                            );
                          })()}


                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0', padding: '24px', marginTop: '15px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedChefView(null)}
                        style={{ padding: '8px 14px', backgroundColor: '#f1f3f4', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', color: '#333' }}
                      >
                        ← 
                      </button>
                      <div>
                        <h3 style={{ margin: 0, color: '#002f6c', fontSize: '1.1rem' }}>
                          {selectedChefView.chef.nom} {selectedChefView.chef.prenom}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#5f6368' }}>
                           {selectedChefView.chef.nom_etablissement || 'Établissement'} • Identifiant : <strong>{selectedChefView.chef.username}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedChefView({ ...selectedChefView, tab: 'profil' })}
                        style={{
                          padding: '8px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                          backgroundColor: selectedChefView.tab === 'profil' ? '#1a73e8' : '#f1f3f4',
                          color: selectedChefView.tab === 'profil' ? '#ffffff' : '#333'
                        }}
                      >
                        👤 Profil
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChefView({ ...selectedChefView, tab: 'documents' })}
                        style={{
                          padding: '8px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                          backgroundColor: selectedChefView.tab === 'documents' ? '#1a73e8' : '#f1f3f4',
                          color: selectedChefView.tab === 'documents' ? '#ffffff' : '#333'
                        }}
                      >
                        📋 Liste des documents
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChefView({ ...selectedChefView, tab: 'parametres' })}
                        style={{
                          padding: '8px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                          backgroundColor: selectedChefView.tab === 'parametres' ? '#1a73e8' : '#f1f3f4',
                          color: selectedChefView.tab === 'parametres' ? '#ffffff' : '#333'
                        }}
                      >
                        ⚙️ Paramètres
                      </button>
                    </div>
                  </div>

                    {selectedChefView.tab === 'profil' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <form onSubmit={handleUpdateChefDetails} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                          <h4 style={{ margin: '0 0 16px 0', color: '#002f6c' }}>Renseignements du Responsable</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Nom</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="text" 
                                  value={chefEditForm.nom} 
                                  readOnly={!editingChefFields.nom}
                                  onChange={(e) => setChefEditForm({ ...chefEditForm, nom: e.target.value })} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '4px', boxSizing: 'border-box',
                                    border: editingChefFields.nom ? '1px solid #1a73e8' : '1px solid #ccc',
                                    backgroundColor: editingChefFields.nom ? '#ffffff' : '#eef1f5',
                                    color: '#202124', fontWeight: '500'
                                  }} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingChefFields({ ...editingChefFields, nom: !editingChefFields.nom })}
                                  title="Modifier le nom"
                                  style={{
                                    padding: '7px 10px', borderRadius: '4px', cursor: 'pointer',
                                    border: '1px solid #dadce0',
                                    backgroundColor: editingChefFields.nom ? '#e8f0fe' : '#ffffff'
                                  }}
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Prénom</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="text" 
                                  value={chefEditForm.prenom} 
                                  readOnly={!editingChefFields.prenom}
                                  onChange={(e) => setChefEditForm({ ...chefEditForm, prenom: e.target.value })} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '4px', boxSizing: 'border-box',
                                    border: editingChefFields.prenom ? '1px solid #1a73e8' : '1px solid #ccc',
                                    backgroundColor: editingChefFields.prenom ? '#ffffff' : '#eef1f5',
                                    color: '#202124', fontWeight: '500'
                                  }} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingChefFields({ ...editingChefFields, prenom: !editingChefFields.prenom })}
                                  title="Modifier le prénom"
                                  style={{
                                    padding: '7px 10px', borderRadius: '4px', cursor: 'pointer',
                                    border: '1px solid #dadce0',
                                    backgroundColor: editingChefFields.prenom ? '#e8f0fe' : '#ffffff'
                                  }}
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Adresse E-mail</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="email" 
                                  value={chefEditForm.email} 
                                  readOnly={!editingChefFields.email}
                                  onChange={(e) => setChefEditForm({ ...chefEditForm, email: e.target.value })} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '4px', boxSizing: 'border-box',
                                    border: editingChefFields.email ? '1px solid #1a73e8' : '1px solid #ccc',
                                    backgroundColor: editingChefFields.email ? '#ffffff' : '#eef1f5',
                                    color: '#202124', fontWeight: '500'
                                  }} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingChefFields({ ...editingChefFields, email: !editingChefFields.email })}
                                  title="Modifier l'e-mail"
                                  style={{
                                    padding: '7px 10px', borderRadius: '4px', cursor: 'pointer',
                                    border: '1px solid #dadce0',
                                    backgroundColor: editingChefFields.email ? '#e8f0fe' : '#ffffff'
                                  }}
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Téléphone / WhatsApp</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="text" 
                                  value={chefEditForm.telephone} 
                                  readOnly={!editingChefFields.telephone}
                                  onChange={(e) => setChefEditForm({ ...chefEditForm, telephone: e.target.value })} 
                                  style={{ 
                                    flex: 1, padding: '8px', borderRadius: '4px', boxSizing: 'border-box',
                                    border: editingChefFields.telephone ? '1px solid #1a73e8' : '1px solid #ccc',
                                    backgroundColor: editingChefFields.telephone ? '#ffffff' : '#eef1f5',
                                    color: '#202124', fontWeight: '500'
                                  }} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingChefFields({ ...editingChefFields, telephone: !editingChefFields.telephone })}
                                  title="Modifier le numéro"
                                  style={{
                                    padding: '7px 10px', borderRadius: '4px', cursor: 'pointer',
                                    border: '1px solid #dadce0',
                                    backgroundColor: editingChefFields.telephone ? '#e8f0fe' : '#ffffff'
                                  }}
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>

                          </div>

                          <button 
                            type="submit" 
                            style={{ marginTop: '18px', backgroundColor: '#002f6c', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            💾 Enregistrer les modifications
                          </button>
                        </form>
                        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#002f6c' }}>Actions Rapides</h4>
                          
                           <button
                              type="button"
                              onClick={async () => {
                                const emailDest = (chefEditForm.email || selectedChefView.chef.mail_chefcentre || '').trim();
                                const nomDest = `${chefEditForm.nom || selectedChefView.chef.nom_chefcentre || ''} ${chefEditForm.prenom || selectedChefView.chef.prenom_chefcentre || ''}`.trim();
                                const userDest = chefEditForm.username || selectedChefView.chef.username || '';

                                if (!emailDest) {
                                  alert("⚠️ Aucune adresse e-mail renseignée pour ce responsable.");
                                  return;
                                }

                                try {
                                  await API.post('/chefs-centre/envoyer-acces-email', {
                                    destinataire: emailDest,
                                    nom_complet: nomDest,
                                    username: userDest
                                  });
                                  marquerAccesEnvoye(selectedChefView.chef, 'email');
      
                                  alert(`✅ E-mail d'accès envoyé automatiquement à ${emailDest} !`);
                                } catch (err) {
                                  alert(err.response?.data?.detail || "❌ Erreur lors de l'envoi automatique de l'e-mail.");
                                }
                              }}
                              style={{
                                backgroundColor: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '4px',
                                padding: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '8px'
                              }}
                            >
                              <span>✉️</span> Envoyer ses accès par E-mail
                           </button>

                           <button
                              type="button"
                              onClick={async () => {
                                const telDest = (chefEditForm.telephone || selectedChefView.chef.tel_chefcentre || '').trim();
                                const emailDest = (chefEditForm.email || selectedChefView.chef.mail_chefcentre || 'chef@dretfp.mg').trim();
                                const nomDest = `${chefEditForm.nom || selectedChefView.chef.nom_chefcentre || ''} ${chefEditForm.prenom || selectedChefView.chef.prenom_chefcentre || ''}`.trim();
                                const userDest = chefEditForm.username || selectedChefView.chef.username || '';

                                if (!telDest) {
                                  alert("⚠️ Aucun numéro de téléphone renseigné pour ce responsable.");
                                  return;
                                }

                                try {
                                  await API.post('/chefs-centre/envoyer-acces-whatsapp', {
                                    destinataire: emailDest,
                                    nom_complet: nomDest,
                                    username: userDest,
                                    telephone: telDest
                                  });
                                  marquerAccesEnvoye(selectedChefView.chef, 'whatsapp');
                                  alert(`✅ Message WhatsApp envoyé automatiquement au ${telDest} !`);
                                } catch (err) {
                                  alert(err.response?.data?.detail || "❌ Erreur lors de l'envoi WhatsApp (vérifiez la configuration API).");
                                }
                              }}
                              style={{
                                backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '4px',
                                padding: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '8px'
                              }}
                            >
                              <span>💬</span> Envoyer ses accès par WhatsApp
                           </button>

                           <button
                              type="button"
                              onClick={async () => {
                                const userACopier = chefEditForm.username || selectedChefView.chef.username || '';
                                if (!userACopier) {
                                  alert("⚠️ Aucun identifiant disponible.");
                                  return;
                                }
                                try {
                                  await navigator.clipboard.writeText(userACopier);
                                  alert(`📋 Identifiant "${userACopier}" copié dans le presse-papiers !`);
                                } catch (err) {
                                  const tempInput = document.createElement('input');
                                  tempInput.value = userACopier;
                                  document.body.appendChild(tempInput);
                                  tempInput.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(tempInput);
                                  alert(`📋 Identifiant "${userACopier}" copié !`);
                                }
                              }}
                              style={{
                                backgroundColor: '#ffffff',
                                color: '#333333',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f4'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                            >
                              <span>📋</span> Copier son identifiant
                           </button>

                           <button
                              type="button"
                              onClick={async () => {
                                const idChef = selectedChefView.chef.id_chefcentre ?? selectedChefView.chef.id;
                                const nomComplet = `${chefEditForm.nom || selectedChefView.chef.nom_chefcentre || ''} ${chefEditForm.prenom || selectedChefView.chef.prenom_chefcentre || ''}`.trim();

                                if (!window.confirm(`⚠️ ATTENTION : Voulez-vous vraiment révoquer et supprimer définitivement ${nomComplet} ?\n\nSon accès au portail terrain sera immédiatement coupé.`)) {
                                  return;
                                }

                                try {
                                  await API.delete(`/chefs-centre/${idChef}`);
                                  alert(`✅ Le responsable ${nomComplet} a été révoqué avec succès.`);
                                  
                                  setSelectedChefView(null);
                                  if (typeof chargerChefsCentre === 'function') {
                                    await chargerChefsCentre();
                                  }
                                } catch (err) {
                                  console.error("Erreur lors de la révocation :", err);
                                  alert(err.response?.data?.detail || "❌ Impossible de révoquer ce chef de centre sur le serveur.");
                                }
                              }}
                              style={{
                                backgroundColor: '#fce8e6',
                                color: '#c5221f',
                                border: '1px solid #fad2cf',
                                borderRadius: '4px',
                                padding: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fad2cf'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fce8e6'; }}
                            >
                              <span>🗑️</span> Révoquer ce Chef de Centre
                           </button>

                        </div>
                      </div>
                    )}

                  {selectedChefView.tab === 'documents' && (() => {
                    const baseUrlServeur = API.defaults.baseURL.replace('/api', '');

                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div>
                            <h4 style={{ margin: 0, color: '#002f6c' }}>
                              📂 Documents transmis par {selectedChefView.chef.nom_chefcentre} ({documentsChef.length})
                            </h4>
                            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#5f6368' }}>
                              Fichiers officiels reçus depuis le terrain (Excel, Word, PDF)
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => chargerDocumentsDuChef(selectedChefView.chef.id_etablissement)}
                            style={{ padding: '7px 12px', backgroundColor: '#f1f3f4', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}
                          >
                            🔄 Actualiser
                          </button>
                        </div>

                        {loadingDocsChef ? (
                          <div style={{ textAlign: 'center', padding: '30px', color: '#5f6368' }}>Chargement des documents...</div>
                        ) : (
                          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th style={{ width: '110px' }}>Format</th>
                                <th>Nom du fichier</th>
                                <th style={{ width: '180px' }}>Date de transmission</th>
                                <th style={{ width: '160px', textAlign: 'center' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {documentsChef.length === 0 ? (
                                <tr>
                                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#70757a', fontStyle: 'italic' }}>
                                    📭 Aucun document (Excel, Word ou PDF) n'a encore été envoyé par ce chef de centre.
                                  </td>
                                </tr>
                              ) : (
                                documentsChef.map((doc) => {
                                  const estExcel = ['XLSX', 'XLS'].includes(doc.type_fichier);
                                  const estPdf = doc.type_fichier === 'PDF';
                                  const badgeBg = estExcel ? '#e6f4ea' : (estPdf ? '#fce8e6' : '#e8f0fe');
                                  const badgeColor = estExcel ? '#137333' : (estPdf ? '#c5221f' : '#1a73e8');
                                  const iconeDoc = estExcel ? '📊' : (estPdf ? '📕' : '📘');

                                  return (
                                    <tr key={doc.id_document}>
                                      <td>
                                        <span style={{
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          fontSize: '0.75rem',
                                          fontWeight: 'bold',
                                          backgroundColor: badgeBg,
                                          color: badgeColor,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          <span>{iconeDoc}</span> {doc.type_fichier}
                                        </span>
                                      </td>
                                      <td><strong>{doc.nom_fichier}</strong></td>
                                      <td style={{ fontSize: '0.85rem', color: '#5f6368' }}>
                                        {new Date(doc.date_envoi).toLocaleString('fr-FR', {
                                          day: '2-digit', month: '2-digit', year: 'numeric',
                                          hour: '2-digit', minute: '2-digit'
                                        })}
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <a
                                          href={`${baseUrlServeur}${doc.chemin_stockage}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          download={doc.nom_fichier}
                                          style={{
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            backgroundColor: '#002f6c',
                                            color: '#ffffff',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          📥 Télécharger
                                        </a>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })()}


                  {selectedChefView.tab === 'parametres' && (
                    <div style={{ maxWidth: '550px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                      <h4 style={{ margin: '0 0 14px 0', color: '#002f6c' }}>⚙️ Paramètres d'Accès & Permissions du Centre</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Identifiant de connexion officiel (Username)</label>
                          <input
                            type="text"
                            value={chefEditForm.username}
                            onChange={(e) => setChefEditForm({ ...chefEditForm, username: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontWeight: 'bold' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>État du compte sur le terrain</label>
                          <select
                            value={chefEditForm.statut}
                            onChange={(e) => setChefEditForm({ ...chefEditForm, statut: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                          >
                            <option value="ACTIF">🟢 ACTIF (Autorisé à transmettre les fiches et notes)</option>
                            <option value="SUSPENDU">🔴 SUSPENDU (Accès bloqué temporairement)</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={handleUpdateChefDetails}
                            style={{ backgroundColor: '#002f6c', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            ✅ Appliquer les paramètres
                          </button>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {activeMenu === 'historique' && (
            <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '8px', border: '1px solid #dadce0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#002f6c' }}>🕒 Journal d'Audit & Historique des Événements</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#5f6368' }}>
                    Conservation réglementaire : purge automatique des entrées de plus de 3 mois (90 jours).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {selectedHistoriqueIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSupprimerHistoriqueSelection}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#c5221f',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(197, 34, 31, 0.2)'
                      }}
                    >
                      🗑️ Supprimer ({selectedHistoriqueIds.length})
                    </button>
                  )}

                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedHistoriqueIds([]);
                      chargerHistorique();
                    }}
                    style={{ padding: '8px 14px', backgroundColor: '#f1f3f4', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    🔄 Actualiser
                  </button>
                </div>
              </div>

              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={listeHistorique.length > 0 && selectedHistoriqueIds.length === listeHistorique.length}
                        onChange={handleSelectAllHistorique}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        title="Tout sélectionner"
                      />
                    </th>
                    <th style={{ width: '180px' }}>Date & Heure</th>
                    <th>Acteur / Utilisateur</th>
                    <th>Profil</th>
                    <th>Action effectuée</th>
                    <th>Détails de l'opération</th>
                  </tr>
                </thead>
                <tbody>
                  {listeHistorique.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#70757a', fontStyle: 'italic' }}>
                        📭 Aucun événement enregistré dans le journal d'audit.
                      </td>
                    </tr>
                  ) : (
                    listeHistorique.map((item) => {
                      const isChecked = selectedHistoriqueIds.includes(item.id_historique);
                      return (
                        <tr 
                          key={item.id_historique}
                          style={{ backgroundColor: isChecked ? '#fce8e6' : 'transparent', transition: 'background-color 0.15s' }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectHistorique(item.id_historique)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#3c4043', fontWeight: '500' }}>
                            {new Date(item.date_evenement).toLocaleString('fr-FR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td><strong>{item.acteur}</strong></td>
                          <td>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              backgroundColor: item.role_acteur === 'ADMIN_DRETFP' ? '#e8f0fe' : '#e6f4ea',
                              color: item.role_acteur === 'ADMIN_DRETFP' ? '#1a73e8' : '#137333'
                            }}>
                              {item.role_acteur === 'ADMIN_DRETFP' ? 'Bureau Admin' : 'Chef Terrain'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: '#202124' }}>{item.action_effectuee}</td>
                          <td style={{ fontSize: '0.85rem', color: '#5f6368' }}>{item.details || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeMenu === 'parametres' && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #dadce0', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#002f6c', fontSize: '1.2rem' }}>⚙️ Paramètres Généraux du Système</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#5f6368' }}>
                    Configuration institutionnelle, règles d'examens, sécurité et maintenance — DRETFP Amoron'i Mania
                  </p>
                </div>
                
              </div>

              <form onSubmit={handleSaveParametres}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#002f6c', fontSize: '0.95rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>
                      🏛️ 1. Identité & Signataire des Titres
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Intitulé de la Direction</label>
                        <input
                          type="text"
                          value={parametresSysteme.nomDirection}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, nomDirection: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Adresse du Bureau Central</label>
                        <input
                          type="text"
                          value={parametresSysteme.adresseBureau}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, adresseBureau: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Nom & Titre du Signataire (PDF Attestations)</label>
                        <input
                          type="text"
                          value={parametresSysteme.nomSignataire}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, nomSignataire: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#002f6c', fontSize: '0.95rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>
                      📅 2. Session Active & Contrôle des Portails
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Année / Session d'Examen en cours</label>
                        <select
                          value={parametresSysteme.sessionActive}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, sessionActive: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        >
                          <option value="2025">Session 2025</option>
                          <option value="2026">Session 2026</option>
                          <option value="2027">Session 2027</option>
                        </select>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '6px' }}>
                        <input
                          type="checkbox"
                          checked={parametresSysteme.portailDemandesOuvert}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, portailDemandesOuvert: e.target.checked })}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <span>Autoriser les nouvelles demandes de diplômes en ligne (Public)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={parametresSysteme.saisieTerrainOuverte}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, saisieTerrainOuverte: e.target.checked })}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <span>Autoriser la transmission des notes par les Chefs de Centre</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#002f6c', fontSize: '0.95rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>
                      🎓 3. Règles de Délibération & Mentions (/20)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Seuil d'Admission</label>
                        <input
                          type="number"
                          step="0.5"
                          value={parametresSysteme.moyenneAdmission}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, moyenneAdmission: Number(e.target.value) })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Mention Assez Bien</label>
                        <input
                          type="number"
                          step="0.5"
                          value={parametresSysteme.seuilAssezBien}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, seuilAssezBien: Number(e.target.value) })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Mention Bien</label>
                        <input
                          type="number"
                          step="0.5"
                          value={parametresSysteme.seuilBien}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, seuilBien: Number(e.target.value) })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Mention Très Bien</label>
                        <input
                          type="number"
                          step="0.5"
                          value={parametresSysteme.seuilTresBien}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, seuilTresBien: Number(e.target.value) })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#002f6c', fontSize: '0.95rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>
                      🔔 4. Notifications & Journal d'Audit
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>E-mail Expéditeur Officiel (SMTP)</label>
                        <input
                          type="email"
                          value={parametresSysteme.emailNotification}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, emailNotification: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Modèle SMS / WhatsApp de Validation</label>
                        <textarea
                          rows="2"
                          value={parametresSysteme.modeleMessageWhatsApp}
                          onChange={(e) => setParametresSysteme({ ...parametresSysteme, modeleMessageWhatsApp: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #e0e0e0', borderTop: '3px solid #c5221f' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#c5221f', fontSize: '0.95rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>
                      🛡️ 5. Sécurité & Gestion des Accès Direction
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e8eaed' }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#002f6c', fontSize: '0.88rem' }}>
                          🔑 Modification du Mot de Passe Administrateur
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '3px' }}>E-mail du compte connecté *</label>
                            <input
                              type="email"
                              placeholder="admin@dretfp.mg"
                              value={pwdForm.email}
                              onChange={(e) => setPwdForm({ ...pwdForm, email: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '3px' }}>Ancien mot de passe *</label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={pwdForm.ancienPassword}
                              onChange={(e) => setPwdForm({ ...pwdForm, ancienPassword: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '3px' }}>Nouveau mot de passe *</label>
                              <input
                                type="password"
                                placeholder="Min. 6 caractères"
                                value={pwdForm.nouveauPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, nouveauPassword: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '3px' }}>Confirmer *</label>
                              <input
                                type="password"
                                placeholder="••••••••"
                                value={pwdForm.confirmerPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, confirmerPassword: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleUpdateAdminPassword}
                            disabled={pwdLoading}
                            style={{
                              marginTop: '6px', backgroundColor: '#c5221f', color: '#ffffff', border: 'none',
                              borderRadius: '4px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem'
                            }}
                          >
                            {pwdLoading ? 'Mise à jour en cours...' : '🔒 Mettre à jour mon mot de passe'}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                        <div style={{ backgroundColor: '#fff9e6', padding: '15px', borderRadius: '6px', border: '1px solid #fde293' }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#b06000', marginBottom: '6px' }}>
                            🗝️ Clé Secrète d'Enregistrement Direction
                          </label>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#666' }}>
                            Requise pour initialiser un nouveau compte administrateur ou réinitialiser un accès.
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type={showSecretKey ? 'text' : 'password'}
                              value={parametresSysteme.cleSecreteDirection}
                              onChange={(e) => setParametresSysteme({ ...parametresSysteme, cleSecreteDirection: e.target.value })}
                              style={{ flex: 1, padding: '7px 10px', borderRadius: '4px', border: '1px solid #b06000', backgroundColor: '#ffffff', fontWeight: 'bold', boxSizing: 'border-box' }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecretKey(!showSecretKey)}
                              style={{ padding: '0 12px', backgroundColor: '#ffffff', border: '1px solid #b06000', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', color: '#b06000' }}
                            >
                              {showSecretKey ? '🙈 Masquer' : '👁️ Afficher'}
                            </button>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e8eaed' }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#002f6c', marginBottom: '6px' }}>
                            ⏳ Durée de conservation de l'Historique (Audit)
                          </label>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#666' }}>
                            Délai avant la suppression automatique des anciens journaux d'événements.
                          </p>
                          <select
                            value={parametresSysteme.retentionHistoriqueJours}
                            onChange={(e) => setParametresSysteme({ ...parametresSysteme, retentionHistoriqueJours: Number(e.target.value) })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#ffffff', fontWeight: '600' }}
                          >
                            <option value={30}>30 jours (1 mois)</option>
                            <option value={60}>60 jours (2 mois)</option>
                            <option value={90}>90 jours (3 mois — Recommandé)</option>
                            <option value={180}>180 jours (6 mois)</option>
                            <option value={365}>365 jours (1 an)</option>
                          </select>
                        </div>

                      </div>
                    </div>
                  </div>


                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #dadce0' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const backupData = JSON.stringify({
                        date: new Date().toISOString(),
                        parametres: parametresSysteme,
                        apprenants: typeof apprenants !== 'undefined' ? apprenants : [],
                        demandes: typeof demandes !== 'undefined' ? demandes : []
                      }, null, 2);
                      const blob = new Blob([backupData], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Sauvegarde_DRETFP_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                    }}
                    style={{
                      backgroundColor: '#f1f3f4', color: '#333', border: '1px solid #ccc',
                      borderRadius: '4px', padding: '10px 16px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    💾 Télécharger une Sauvegarde de Sécurité
                  </button>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#002f6c', color: '#ffffff', border: 'none',
                      borderRadius: '4px', padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.92rem'
                    }}
                  >
                    ✅ Enregistrer les Paramètres
                  </button>
                </div>
              </form>
            </div>
          )}



        </div> 
      </div> 


      {showAddChefModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', width: '450px', padding: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', boxSizing: 'border-box', position: 'relative' }}>
            
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#002f6c', fontSize: '1.2rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
              ➕ Enregistrer un Chef de Centre
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const payload = {
                nom_chefcentre: form.nom.value,
                prenom_chefcentre: form.prenom.value,
                username: form.username.value,
                tel_chefcentre: form.tel.value,
                mail_chefcentre: form.mail.value,
                id_etablissement: parseInt(form.etablissement.value, 10)
              };

              try {
                const response = await API.post('/chefs-centre/enregistrer', payload);
                
                if (response.data.status === 'success' || response.data) {
                  alert("🎉 Chef de centre enregistré avec succès dans MySQL (WampServer) !");
                  form.reset();
                  setShowAddChefModal(false); 
                  
                  if (typeof chargerChefsCentre === 'function') {
                    await chargerChefsCentre();
                  }
                  setPreselectedEtabId('');
                  setSelectedChefView(null);
                  setActiveMenu('resultat_etablissement');  


                  
                }
              } catch (err) {
                console.error("❌ Échec d'écriture du Chef de centre :", err);
                alert(`❌ Erreur : ${err.response?.data?.detail || "Impossible de sauvegarder sur le serveur central."}`);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Nom :</label>
                <input name="nom" type="text" required placeholder="EX: RAKOTO" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Prénom :</label>
                <input name="prenom" type="text" placeholder="EX: Jean" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Nom d'utilisateur (Username) :</label>
                <input name="username" type="text" required placeholder="EX: chef_ambositra" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Téléphone :</label>
                <input name="tel" type="text" placeholder="EX: +261 34 00 000 00" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Adresse Email :</label>
                <input name="mail" type="email" placeholder="EX: chef@gmail.com" style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Établissement d'Affectation :</label>
                <select 
                  name="etablissement" 
                  defaultValue={preselectedEtabId} 
                  required 
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                >
                  <option value="">-- Sélectionner l'établissement --</option>
                  {(listeEtablissements || etablissementsOptions || [
                    { id_centre: 1, nom_etablissement: "LTP AMBOSITRA" },
                    { id_centre: 2, nom_etablissement: "LTP FANDRIANA" },
                    { id_centre: 3, nom_etablissement: "CFP AMBOSITRA" },
                    { id_centre: 4, nom_etablissement: "LTP AMBATOFINANDRAHANA" }
                  ]).map(etab => {
                    const idEtab = etab.id_centre ?? etab.id_etablissement ?? etab.id;
                    return (
                      <option key={idEtab} value={idEtab}>
                        {etab.nom_etablissement || etab.nom}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddChefModal(false)} 
                  style={{ flex: 1, height: '42px', backgroundColor: '#f1f3f4', color: '#3c4043', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 2, height: '42px', backgroundColor: '#002f6c', color: '#ffffff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  💾 Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

                  
      {showAddEtablissement && (
        <div className="modal-overlay" onClick={() => setShowAddEtablissement(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            
            <div className="modal-header">
              <h2>🏢 Ajouter un nouvel Établissement</h2>
              <button className="btn-close-modal" onClick={() => setShowAddEtablissement(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <form className="modal-form-grid">
                <div className="modal-field">
                  <label>Centre de codage (Code unique)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: CENTRE-FIANAR-03" 
                    value={codeCentre} 
                    onChange={(e) => setCodeCentre(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="modal-field">
                  <label>Localisation / District</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Fianarantsoa I" 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)} 
                    required 
                  />
                </div>

                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Nom complet de l'Établissement</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Lycée Technique Ihosy" 
                    value={nomEtab} 
                    onChange={(e) => setNomEtab(e.target.value)} 
                    required 
                  />
                </div>

                <div className="modal-field">
                  <label>Téléphone / Contact</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dadce0', borderRadius: '4px', overflow: 'hidden', background: '#f8f9fa' }}>
                    
                    <span style={{ padding: '0.65rem', color: '#5f6368', fontWeight: 'bold', borderRight: '1px solid #dadce0', fontSize: '0.95rem', userSelect: 'none' }}>
                      +261
                    </span>
                    
                    <input 
                      type="text" 
                      placeholder="Ex: 345214587" 
                      maxLength={9} 
                      value={contactEtab} 
                      onChange={(e) => setContactEtab(e.target.value.replace(/\D/g, ''))} 
                      style={{ border: 'none', padding: '0.65rem', flex: 1, outline: 'none', background: '#ffffff', fontSize: '0.95rem' }}
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>Adresse E-mail Officielle</label>
                  <input 
                    type="email" 
                    placeholder="Ex: etablissement@dretfp.mg" 
                    value={emailEtab} 
                    onChange={(e) => setEmailEtab(e.target.value)} 
                    required 
                  />
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-table-action" onClick={() => setShowAddEtablissement(false)}>
                Annuler
              </button>
              <button 
                className="btn-action-top" 
                onClick={handleEnregistrerEtablissement}
              >
                💾 Enregistrer le centre
              </button>
            </div>

          </div>
        </div>
      )}
         
      {showEditEtablissement && selectedEtablissement && (
        <div className="modal-overlay" onClick={() => { setShowEditEtablissement(false); setSelectedEtablissement(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#6ebe73' }}>
              <h2>✏️ Modifier l'Établissement : {selectedEtablissement.nom_etablissement}</h2>
              <button className="btn-close-modal" onClick={() => { setShowEditEtablissement(false); setSelectedEtablissement(null); }}>&times;</button>
            </div>

            <div className="modal-body">
              <form className="modal-form-grid" onSubmit={handleModifierEtablissement}>
                <div className="modal-field">
                  <label>Centre de codage</label>
                  <input type="text" id="edit-code-centre" defaultValue={selectedEtablissement.code_centre} required />
                </div>
                
                <div className="modal-field">
                  <label>Localisation / District</label>
                  <input type="text" id="edit-localisation" defaultValue={selectedEtablissement.localisation_district} required />
                </div>

                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Nom complet de l'Établissement</label>
                  <input type="text" id="edit-nom-etablissement" defaultValue={selectedEtablissement.nom_etablissement} required />
                </div>

                <div className="modal-field">
                  <label>Téléphone / Contact</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dadce0', borderRadius: '4px', overflow: 'hidden', background: '#f8f9fa' }}>
                    <span style={{ padding: '0.65rem', color: '#5f6368', fontWeight: 'bold', borderRight: '1px solid #dadce0', fontSize: '0.95rem', userSelect: 'none' }}>+261</span>
                    <input 
                      type="text" 
                      maxLength={9}
                      value={contactEtab} 
                      onChange={(e) => setContactEtab(e.target.value.replace(/\D/g, ''))}
                      style={{ border: 'none', padding: '0.65rem', flex: 1, outline: 'none', background: '#ffffff', fontSize: '0.95rem' }}
                      required 
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>Adresse E-mail Officielle</label>
                  <input type="email" id="edit-email" defaultValue={selectedEtablissement.email} required />
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-table-action" onClick={() => { setShowEditEtablissement(false); setSelectedEtablissement(null); }}>
                Annuler
              </button>
              <button className="btn-action-top" style={{ backgroundColor: '#6ebe73' }} onClick={handleModifierEtablissement}>
                💾 Enregistrer les modifications
              </button>
            </div>

          </div>
        </div>
      )}
     
      {showDetailsEtablissement && selectedEtablissement && (
        <div className="modal-overlay" onClick={() => { setShowDetailsEtablissement(false); setSelectedEtablissement(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#6ebe73' }}>
              <h2>📄 Fiche d'Information de: {selectedEtablissement.nom_etablissement}</h2>
              <button className="btn-close-modal" onClick={() => { setShowDetailsEtablissement(false); setSelectedEtablissement(null); }}>&times;</button>
            </div>

            <div className="modal-body">
              <form className="modal-form-grid">
                <div className="modal-field">
                  <label>Centre de codage</label>
                  <input type="text" value={selectedEtablissement.code_centre} readOnly />
                </div>
                
                <div className="modal-field">
                  <label>Localisation / District</label>
                  <input type="text" value={selectedEtablissement.localisation_district} readOnly />
                </div>

                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Nom complet de l'Établissement</label>
                  <input type="text" value={selectedEtablissement.nom_etablissement} readOnly />
                </div>

                <div className="modal-field">
                  <label>Téléphone / Contact</label>
                  <input type="text" value={selectedEtablissement.contact} readOnly />
                </div>

                <div className="modal-field">
                  <label>Adresse E-mail Officielle</label>
                  <input type="email" value={selectedEtablissement.email} readOnly />
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-table-action" onClick={() => { setShowDetailsEtablissement(false); setSelectedEtablissement(null); }}>
                Fermer la fiche
              </button>
            </div>

          </div>
        </div>
      )}
      
      {selectedApprenant === null && modalMode === 'ajouter' && (
        <div className="modal-overlay" onClick={() => setModalMode('')}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#1a73e8' }}>
              <h2>➕ Ajouter un Nouvel Apprenant au Registre</h2>
              <button className="btn-close-modal" onClick={() => setModalMode('')}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form className="modal-form-grid" id="form_ajout_apprenant" onSubmit={(e) => e.preventDefault()}>
                
                <div className="modal-field">
                  <label>N° IM (Matricule)</label>
                  <input type="text" id="add_im" placeholder="Ex: 2026503" required />
                </div>
                <div className="modal-field">
                  <label>Nom de l'Apprenant</label>
                  <input type="text" id="add_nom" placeholder="Saisir le nom..." required />
                </div>
                <div className="modal-field">
                  <label>Prénoms</label>
                  <input type="text" id="add_prenom" placeholder="Saisir les prénoms..." />
                </div>
                <div className="modal-field">
                  <label>Date de Naissance</label>
                  <input type="date" id="add_date_naiss" required />
                </div>
                <div className="modal-field">
                  <label>Lieu de Naissance</label>
                  <input type="text" id="add_lieu_naiss" placeholder="Ex: AMBOSITRA" required />
                </div>

                <div className="modal-field" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Examen</label>
                  <select 
                    value={nouvelApprenantExamen || ''} 
                    onChange={(e) => setNouvelApprenantExamen(e.target.value)}
                    style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0' }}
                  >
                    <option value="">-- Sélectionner l'examen --</option>
                    {(listeExamens || []).map(ex => {
                      if (!ex) return null;
                      const idEx = ex.id_examen ?? ex.id;
                      const nomEx = ex.nom_exam || ex.nom_examen || "Inconnu";
                      return <option key={idEx} value={nomEx}>{nomEx}</option>;
                    })}
                  </select>
                </div>

                <div className="modal-field">
                  <label>Session Examen (Année)</label>
                  <input type="number" id="add_session" defaultValue="2026" />
                </div>
                <div className="modal-field">
                  <label>Mention</label>
                  <select id="add_mention" className="filter-select" style={{ width: '100%', height: '36px' }}>
                    <option value="Passable">Passable</option>
                    <option value="Assez Bien">Assez Bien</option>
                    <option value="Bien">Bien</option>
                    <option value="Très Bien">Très Bien</option>
                  </select>
                </div>

                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Établissement d'Origine</label>
                  <select 
                    id="add_etablissement_id" 
                    value={modalEtabId} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalEtabId(val);
                      setModalSecteurId(''); 
                      setModalFiliereId('');
                      setModalMetierId('');
                    }}
                    className="filter-select" style={{ width: '100%', height: '36px' }}
                  >
                    <option value="">-- Choisir un Établissement --</option>
                    {(listeEtablissements || []).map((e, i) => {
                      const idNum = e.id_etablissement || e.id;
                      const nomTexte = e.nom_etablissement || e.nom;
                      return <option key={i} value={idNum}>{nomTexte}</option>;
                    })}
                  </select>
                </div>

               <div className="modal-field" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Secteur</label>
                <select 
                  value={nouvelApprenantSecteur || ''} 
                  onChange={(e) => {
                    setNouvelApprenantSecteur(e.target.value);
                    setNouvelApprenantFiliere(''); 
                    setNouvelApprenantMetier('');
                  }}
                  style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0' }}
                >
                  <option value="">-- Sélectionner le secteur --</option>
                  {(listeSecteurs || []).map(sec => {
                    if (!sec) return null;
                    const idSec = sec.id_secteur ?? sec.id;
                    return <option key={idSec} value={idSec || ''}>{sec.nom_secteur || "Secteur sans nom"}</option>;
                  })}
                </select>
              </div>

              <div className="modal-field" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Filière</label>
                <select 
                  value={nouvelApprenantFiliere || ''} 
                  onChange={(e) => {
                    setNouvelApprenantFiliere(e.target.value);
                    setNouvelApprenantMetier(''); 
                  }}
                  disabled={!nouvelApprenantSecteur}
                  style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0' }}
                >
                  <option value="">-- Sélectionner la filière --</option>
                  {(listeFilieres || [])
                    .filter(f => {
                      if (!f || !f.secteur_id) return false;
                      return f.secteur_id.toString() === (nouvelApprenantSecteur || "").toString();
                    })
                    .map(fil => {
                      const idFil = fil.id_filiere ?? fil.id;
                      return <option key={idFil} value={idFil || ''}>{fil.nom_filiere || "Filière sans nom"}</option>;
                    })}
                </select>
              </div>

              <div className="modal-field" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Métier</label>
                <select 
                  value={nouvelApprenantMetier || ''} 
                  onChange={(e) => setNouvelApprenantMetier(e.target.value)}
                  disabled={!nouvelApprenantFiliere}
                  style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0' }}
                >
                  <option value="">-- Sélectionner le métier --</option>
                  {(listeMetiers || [])
                    .filter(m => {
                      if (!m || !m.filiere_id) return false;
                      return m.filiere_id.toString() === (nouvelApprenantFiliere || "").toString();
                    })
                    .map(met => {
                      const idMet = met.id_metier ?? met.id;
                      return <option key={idMet} value={idMet || ''}>{met.nom_metier || "Métier sans nom"}</option>;
                    })}
                </select>
              </div> 

              </form>
            </div>
            
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn-table-action" onClick={() => setModalMode('')}>Annuler</button>
              
             <button 
                className="btn-action-top" 
                style={{ backgroundColor: '#1a73e8' }}
                onClick={async () => {
                  try {
                    const imSaisi = document.getElementById('add_im')?.value?.trim()?.toUpperCase();
                    const nomSaisi = document.getElementById('add_nom')?.value?.trim();
                    const prenomSaisi = document.getElementById('add_prenom')?.value?.trim() || "";
                    const dateNaissSaisie = document.getElementById('add_date_naiss')?.value;
                    const lieuNaissSaisi = document.getElementById('add_lieu_naiss')?.value?.trim();
                    const examenIdSaisi = document.getElementById('add_examen_id')?.value?.trim() || "CAP";
                    const sessionSaisie = document.getElementById('add_session')?.value;
                    const mentionSaisie = document.getElementById('add_mention')?.value;
                    const etabIdSaisi = document.getElementById('add_etablissement_id')?.value;
                    const secteurIdSaisi = document.getElementById('add_secteur_id')?.value;
                    const filiereIdSaisi = document.getElementById('add_filiere_id')?.value;
                    const metierIdSaisi = document.getElementById('add_metier_id')?.value;

                    if (!imSaisi || !nomSaisi || !dateNaissSaisie || !lieuNaissSaisi) {
                      alert("⚠️ Veuillez renseigner au moins le Matricule (IM), le Nom, la Date et le Lieu de naissance.");
                      return;
                    }

                    const imPropre = String(imSaisi).trim();
                    let structureValide = true;

                    if (imPropre.length !== 12) {
                      structureValide = false;
                    }
                    else if (imPropre.charAt(3) !== '-' || imPropre.charAt(8) !== '-') {
                      structureValide = false;
                    }
                    else {
                      const caracteresDuMilieu = imPropre.substring(4, 8); 
                      if (isNaN(caracteresDuMilieu) || caracteresDuMilieu.includes(' ')) {
                        structureValide = false;
                      }
                    }

                    if (!structureValide) {
                      alert(`🚨 FORMAT DE MATRICULE INVALIDE :\n\nLe matricule saisi "${imPropre}" ne respecte pas la structure réglementaire.\n\nStructure exigée : XXX-0000-XXX (Ex: 1HG-0001-DRT)\n👉 Les 4 caractères du milieu doivent être STRICTEMENT des CHIFFRES.\n👉 Longueur exacte : 12 caractères.`);
                      return; 
                    }

                    const nouvelApprenant = {
                      im_apprenant: String(imPropre),
                      nom_apprenant: String(nomSaisi).toUpperCase(),
                      prenom_apprenant: String(prenomSaisi),
                      date_naiss: String(dateNaissSaisie),
                      lieu_naiss: String(lieuNaissSaisi).toUpperCase(),
                      examen_id: String(examenIdSaisi).toUpperCase(),
                      session: parseInt(sessionSaisie, 10) || 2026,
                      mention: String(mentionSaisie || "Passable"),
                      etablissement_id: parseInt(etabIdSaisi, 10) || 1,
                      secteur_id: parseInt(secteurIdSaisi, 10) || 1,
                      filiere_id: parseInt(filiereIdSaisi, 10) || 1,
                      metier_id: parseInt(metierIdSaisi, 10) || 1,
                      progression: "AUCUNE_DEMANDE"
                    };

                    await API.post('http://localhost:8000/api/apprenants/creer', nouvelApprenant);
                    
                    alert("✅ Apprenant enregistré avec succès !");
                    
                    if (typeof chargerApprenants === 'function') {
                      await chargerApprenants();
                    }
                    
                    setModalMode('');
                  } catch (err) {
                    console.error(err);
                    alert("⚠️ Échec d'enregistrement : Le format de certaines données est incorrect ou la passerelle réseau de l'administration est hors ligne.");
                  }
                }}
              >
                 Enregistrer l'Apprenant
              </button>


            </div>
          </div>
        </div>
      )}

      {selectedApprenant && modalMode && (
        <div className="modal-overlay" onClick={() => { setSelectedApprenant(null); setModalMode(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
            
            <div className="modal-header" style={{ backgroundColor: modalMode === 'details' ? '#002f6c' : '#137333', color: '#ffffff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                {modalMode === 'details' ? '📄 Fiche d\'Information de l\'Apprenant' : '✏️ Modifier les Renseignements'}
              </h2>
              <button className="btn-close-modal" onClick={() => { setSelectedApprenant(null); setModalMode(''); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <form className="modal-form-grid" onSubmit={(e) => e.preventDefault()}>
                
                <div className="modal-field">
                  <label>N° IM (Matricule)</label>
                  <input type="text" value={selectedApprenant.im_apprenant || ''} readOnly style={{ background: '#f1f3f4', fontWeight: 'bold' }} />
                </div>

                <div className="modal-field">
                  <label>Nom de l'Apprenant</label>
                  <input 
                    type="text" 
                    defaultValue={selectedApprenant.nom_apprenant || ''} 
                    readOnly={modalMode === 'details'} 
                    id="edit_nom"
                    style={{ background: modalMode === 'details' ? '#f1f3f4' : '#fff' }}
                  />
                </div>

                <div className="modal-field">
                  <label>Prénoms</label>
                  <input 
                    type="text" 
                    defaultValue={selectedApprenant.prenom_apprenant || ''} 
                    readOnly={modalMode === 'details'} 
                    id="edit_prenom"
                    style={{ background: modalMode === 'details' ? '#f1f3f4' : '#fff' }}
                  />
                </div>

                <div className="modal-field">
                  <label>Date de Naissance</label>
                  <input 
                    type={modalMode === 'details' ? 'text' : 'date'} 
                    defaultValue={selectedApprenant.date_naiss || ''} 
                    readOnly={modalMode === 'details'} 
                    id="edit_date_naiss"
                    style={{ background: modalMode === 'details' ? '#f1f3f4' : '#fff' }}
                  />
                </div>

                <div className="modal-field">
                  <label>Lieu de Naissance</label>
                  <input 
                    type="text" 
                    defaultValue={selectedApprenant.lieu_naiss || ''} 
                    readOnly={modalMode === 'details'} 
                    id="edit_lieu_naiss"
                    style={{ background: modalMode === 'details' ? '#f1f3f4' : '#fff' }}
                  />
                </div>

                <div className="modal-field">
                  <label>Type d'Examen</label>
                  <input 
                    type="text" 
                    defaultValue={selectedApprenant.examen_id || ''} 
                    readOnly={modalMode === 'details'} 
                    id="edit_examen_id"
                    style={{ background: modalMode === 'details' ? '#f1f3f4' : '#fff' }}
                  />
                </div>

                <div className="modal-field">
                  <label>Session Examen (Année)</label>
                  <input 
                    type="number" 
                    defaultValue={selectedApprenant.session || 2026} 
                    readOnly={modalMode === 'details'} 
                    id="edit_session"
                    style={{ background: modalMode === 'details' ? '#f1f3f4' : '#fff' }}
                  />
                </div>

                <div className="modal-field">
                  <label>Mention obtenue</label>
                  {modalMode === 'details' ? (
                    <input type="text" value={selectedApprenant.mention || 'Passable'} readOnly style={{ background: '#f1f3f4' }} />
                  ) : (
                    <select id="edit_mention" defaultValue={selectedApprenant.mention || 'Passable'} className="filter-select" style={{ width: '100%', height: '36px' }}>
                      <option value="Très Bien">Très Bien</option>
                      <option value="Bien">Bien</option>
                      <option value="Assez Bien">Assez Bien</option>
                      <option value="Passable">Passable</option>
                    </select>
                  )}
                </div>

                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Établissement d'Origine</label>
                  {modalMode === 'details' ? (
                    <input type="text" value={listeEtablissements.find(e => (e.id_etablissement || e.id)?.toString() === selectedApprenant.etablissement_id?.toString())?.nom_etablissement || ''} readOnly style={{ background: '#f1f3f4' }} />
                  ) : (
                    <select 
                      id="edit_etablissement_id" 
                      value={modalEtabId} 
                      onChange={(e) => {
                        setModalEtabId(e.target.value);
                        setModalSecteurId(''); 
                        setModalFiliereId('');
                        setModalMetierId('');
                      }}
                      className="filter-select" style={{ width: '100%', height: '36px' }}
                    >
                      {listeEtablissements.map((e, i) => <option key={i} value={e.id_etablissement || e.id}>{e.nom_etablissement || e.nom}</option>)}
                    </select>
                  )}
                </div>

                <div className="modal-field">
                  <label>Secteur Technologique</label>
                  {modalMode === 'details' ? (
                    <input type="text" value={listeSecteurs.find(s => (s.id_secteur || s.id)?.toString() === selectedApprenant.secteur_id?.toString())?.nom_secteur || ''} readOnly style={{ background: '#f1f3f4' }} />
                  ) : (
                    <select 
                      id="edit_secteur_id" 
                      value={modalSecteurId} 
                      onChange={(e) => {
                        setModalSecteurId(e.target.value);
                        setModalFiliereId(''); 
                        setModalMetierId('');
                      }}
                      disabled={!modalEtabId}
                      className="filter-select" style={{ width: '100%', height: '36px' }}
                    >
                      <option value="">-- Choisir un Secteur --</option>
                      {secteursModaleFiltrés.map((s, i) => <option key={i} value={s.id_secteur || s.id}>{s.nom_secteur || s.nom}</option>)}
                    </select>
                  )}
                </div>

                <div className="modal-field">
                  <label>Filière Technique</label>
                  {modalMode === 'details' ? (
                    <input type="text" value={listeFilieres.find(f => (f.id_filiere || f.id)?.toString() === selectedApprenant.filiere_id?.toString())?.nom_filiere || ''} readOnly style={{ background: '#f1f3f4' }} />
                  ) : (
                    <select 
                      id="edit_filiere_id" 
                      value={modalFiliereId} 
                      onChange={(e) => {
                        setModalFiliereId(e.target.value);
                        setModalMetierId(''); 
                      }}
                      disabled={!modalSecteurId}
                      className="filter-select" style={{ width: '100%', height: '36px' }}
                    >
                      <option value="">-- Choisir une Filière --</option>
                      {filieresModaleFiltrées.map((f, i) => <option key={i} value={f.id_filiere || f.id}>{f.nom_filiere || f.nom}</option>)}
                    </select>
                  )}
                </div>

                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Métier Spécifique</label>
                  {modalMode === 'details' ? (
                    <input type="text" value={listeMetiers.find(m => (m.id_metier || m.id)?.toString() === selectedApprenant.metier_id?.toString())?.nom_metier || ''} readOnly style={{ background: '#f1f3f4' }} />
                  ) : (
                    <select 
                      id="edit_metier_id" 
                      value={modalMetierId} 
                      onChange={(e) => setModalMetierId(e.target.value)}
                      disabled={!modalFiliereId}
                      className="filter-select" style={{ width: '100%', height: '36px' }}
                    >
                      <option value="">-- Choisir un Métier --</option>
                      {metiersModaleFiltrés.map((m, i) => <option key={i} value={m.id_metier || m.id}>{m.nom_metier || m.nom}</option>)}
                    </select>
                  )}
                </div>


              </form>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid #dadce0' }}>
              <button 
                type="button" 
                className="btn-table-action" 
                onClick={() => { setSelectedApprenant(null); setModalMode(''); }}
              >
                Fermer
              </button>

               {modalMode === 'modifier' && (
                <button 
                  type="button" 
                  className="btn-action-top" 
                  style={{ backgroundColor: '#137333', color: '#ffffff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px', border: 'none', fontWeight: '600' }}
                  onClick={async () => {
                    try {
                      const matriculeCible = selectedApprenant?.im_apprenant;
                      
                      if (!matriculeCible) {
                        alert("⚠️ Erreur interne : Impossible de récupérer le numéro de matricule (IM) de cet élève.");
                        return;
                      }

                      const nomSaisi = document.getElementById('edit_nom')?.value?.trim();
                      const prenomSaisi = document.getElementById('edit_prenom')?.value?.trim() || "";
                      const dateNaissSaisie = document.getElementById('edit_date_naiss')?.value;
                      const lieuNaissSaisi = document.getElementById('edit_lieu_naiss')?.value?.trim();
                      const examenIdSaisi = document.getElementById('edit_examen_id')?.value?.trim();
                      const sessionSaisie = document.getElementById('edit_session')?.value;
                      const mentionSaisie = document.getElementById('edit_mention')?.value;
                      const etabIdSaisi = document.getElementById('edit_etablissement_id')?.value;
                      const secteurIdSaisi = document.getElementById('edit_secteur_id')?.value;
                      const filiereIdSaisi = document.getElementById('edit_filiere_id')?.value;
                      const metierIdSaisi = document.getElementById('edit_metier_id')?.value;

                      if (!nomSaisi || !dateNaissSaisie || !lieuNaissSaisi || !examenIdSaisi) {
                        alert("⚠️ Veuillez remplir tous les champs obligatoires avant d'enregistrer.");
                        return;
                      }

                      const donneesModifiees = {
                        im_apprenant: String(matriculeCible),
                        nom_apprenant: String(nomSaisi).toUpperCase(),
                        prenom_apprenant: String(prenomSaisi),
                        date_naiss: String(dateNaissSaisie),
                        lieu_naiss: String(lieuNaissSaisi),
                        examen_id: String(examenIdSaisi).toUpperCase(),
                        session: parseInt(sessionSaisie, 10) || 2026,
                        mention: String(mentionSaisie),
                        etablissement_id: parseInt(etabIdSaisi, 10) || 1,
                        secteur_id: parseInt(secteurIdSaisi, 10) || 1,
                        filiere_id: parseInt(filiereIdSaisi, 10) || 1,
                        metier_id: parseInt(metierIdSaisi, 10) || 1,
                        progression: selectedApprenant?.progression || "AUCUNE_DEMANDE"
                      };

                      await API.put(`http://localhost:8000/api/apprenants/modifier/${matriculeCible}`, donneesModifiees);

                      alert("✅ Les renseignements de l'apprenant ont été enregistrés avec succès !");
                      
                      if (typeof chargerApprenants === 'function') {
                        await chargerApprenants();
                      }
                      
                      setSelectedApprenant(null);
                      setModalMode('');
                    } catch (err) {
                      console.error(err);
                      const msgErreur = err.response?.data?.detail;
                      alert("⚠️ Échec de l'enregistrement : " + (typeof msgErreur === 'string' ? msgErreur : "Vérifiez que votre serveur FastAPI sur le port 8000 est bien actif."));
                    }
                  }}
                >
                  💾 Enregistrer les modifications
                </button>
              )}

            </div>

          </div>
        </div>
      )}
    
      {showTraiteModal && selectedDemande && (
        <div className="modal-overlay" onClick={() => { setShowTraiteModal(false); setSelectedDemande(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header" style={{ backgroundColor: '#137333' }}>
              <h2> Décision du Titre</h2>
              <button className="btn-close-modal" onClick={() => { setShowTraiteModal(false); setSelectedDemande(null); }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', margin: '0 0 1rem 0' }}>
                Voulez-vous valider et accorder cette demande ?
              </p>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', textAlign: 'left', border: '1px dashed #dadce0', fontSize: '0.9rem' }}>
                 <strong>Candidat :</strong> {selectedDemande.nom_complet}<br/>
                 <strong>Matricule :</strong> {selectedDemande.im_apprenant}<br/>
                 <strong>Document Acté :</strong> {selectedDemande.type_document}<br/>
                 <strong>Établissement d'examen :</strong> {selectedDemande.centre_examen}
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn-table-action" onClick={() => { setShowTraiteModal(false); setSelectedDemande(null); }}>Annuler</button>
              <button 
                className="btn-action-top" 
                style={{ backgroundColor: '#96b9e7' }} 
                onClick={handleEnvoyerAuTraitement}
              >
                Envoyer à la Liste de Traitement
              </button>
            </div>
          </div>
        </div>
      )}

      {showSecteurModal && (
        <div className="modal-overlay" onClick={() => { setShowSecteurModal(false); setSelectedSecteur(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#002f6c' }}>
              <h2>{secteurModalMode === 'ajouter' ? '📂 Enregistrer un Nouveau Secteur' : '✏️ Modifier le Secteur'}</h2>
              <button className="btn-close-modal" onClick={() => { setShowSecteurModal(false); setSelectedSecteur(null); }}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form className="modal-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleEnregistrerSecteur}>
                
                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Nom du Secteur Technologique</label>
                  <input 
                    type="text" 
                    id="sec_nom" 
                    defaultValue={selectedSecteur ? selectedSecteur.nom_secteur : ''} 
                    placeholder="Ex: Génie Civil, Génie Mécanique..."
                    style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Établissement d'Accueil</label>
                  <select 
                    id="sec_etab_id" 
                    defaultValue={selectedSecteur ? (selectedSecteur.etablissement_id) : ''} 
                    className="filter-select"
                    style={{ width: '100%', height: '36px', borderRadius: '4px', border: '1px solid #ccc', padding: '0 6px' }}
                  >
                    <option value="">-- Sélectionner un Centre --</option>
                    {listeEtablissements.map((e, i) => {
                      const idNum = e.id_etablissement || e.id;
                      const nomTexte = e.nom_etablissement || e.nom;
                      
                      return (
                        <option key={i} value={idNum}>
                          {nomTexte}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Description Complémentaire</label>
                  <textarea 
                    id="sec_desc" 
                    defaultValue={selectedSecteur ? selectedSecteur.description_sec : ''} 
                    placeholder="Saisir les détails optionnels du secteur..."
                    style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0 0', marginTop: '10px' }}>
                  <button type="button" className="btn-table-action" onClick={() => { setShowSecteurModal(false); setSelectedSecteur(null); }}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-action-top" style={{ backgroundColor: '#137333' }}>
                    💾 Sauvegarder
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {showFiliereModal && (
        <div className="modal-overlay" onClick={() => { setShowFiliereModal(false); setSelectedFiliere(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#002f6c' }}>
              <h2>{filiereModalMode === 'ajouter' ? '📜 Enregistrer une Nouvelle Filière' : '✏️ Modifier la Filière'}</h2>
              <button className="btn-close-modal" onClick={() => { setShowFiliereModal(false); setSelectedFiliere(null); }}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form className="modal-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleEnregistrerFiliere}>
                
                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Nom de la Filière Technique</label>
                  <input 
                    type="text" 
                    id="fil_nom" 
                    defaultValue={selectedFiliere ? selectedFiliere.nom_filiere : ''} 
                    placeholder="Ex: Génie Logiciel, Ouvrage Bois, Ouvrages Métalliques..."
                    style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Secteur Technologique de Rattachement</label>
                  <select 
                    id="fil_sec_id" 
                    defaultValue={selectedFiliere ? selectedFiliere.secteur_id : ''} 
                    className="filter-select"
                    style={{ width: '100%', height: '36px', borderRadius: '4px', border: '1px solid #ccc', padding: '0 6px' }}
                  >
                    <option value="">-- Sélectionner un Secteur --</option>
                    {(listeSecteurs || []).map((s, i) => {
                      const idNum = s.id_secteur || s.id;
                      const nomTexte = s.nom_secteur || s.nom;
                      return <option key={i} value={idNum}>{nomTexte}</option>;
                    })}
                  </select>
                </div>

                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Description</label>
                  <textarea 
                    id="fil_desc" 
                    defaultValue={selectedFiliere ? selectedFiliere.description_fil : ''} 
                    placeholder="Saisir les détails de la filière..."
                    style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0 0', marginTop: '10px' }}>
                  <button type="button" className="btn-table-action" onClick={() => { setShowFiliereModal(false); setSelectedFiliere(null); }}>Annuler</button>
                  <button type="submit" className="btn-action-top" style={{ backgroundColor: '#137333' }}>💾 Sauvegarder dans SQLite</button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {showMetierModal && (
        <div className="modal-overlay" onClick={() => { setShowMetierModal(false); setSelectedMetier(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#002f6c' }}>
              <h2>{metierModalMode === 'ajouter' ? '🛠️ Enregistrer un Nouveau Métier' : '✏️ Modifier le Métier'}</h2>
              <button className="btn-close-modal" onClick={() => { setShowMetierModal(false); setSelectedMetier(null); }}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form className="modal-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleEnregistrerMetier}>
                
                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Nom du Métier Spécifique</label>
                  <input 
                    type="text" 
                    id="met_nom" 
                    defaultValue={selectedMetier ? selectedMetier.nom_metier : ''} 
                    placeholder="Ex: Chef de chantier, Électricien d'équipement, Ouvrier qualifié..."
                    style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Filière d'Affiliation</label>
                  <select 
                    id="met_fil_id" 
                    defaultValue={selectedMetier ? selectedMetier.filiere_id : ''} 
                    className="filter-select"
                    style={{ width: '100%', height: '36px', borderRadius: '4px', border: '1px solid #ccc', padding: '0 6px' }}
                  >
                    <option value="">-- Sélectionner une Filière --</option>
                    {(listeFilieres || []).map((f, i) => {
                      const idNum = f.id_filiere || f.id;
                      const nomTexte = f.nom_filiere || f.nom;
                      return <option key={i} value={idNum}>{nomTexte}</option>;
                    })}
                  </select>
                </div>

                <div className="modal-field" style={{ width: '100%' }}>
                  <label style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Description / Débouchés</label>
                  <textarea 
                    id="met_desc" 
                    defaultValue={selectedMetier ? selectedMetier.description_met : ''} 
                    placeholder="Saisir les détails ou débouchés du métier..."
                    style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0 0', marginTop: '10px' }}>
                  <button type="button" className="btn-table-action" onClick={() => { setShowMetierModal(false); setSelectedMetier(null); }}>Annuler</button>
                  <button type="submit" className="btn-action-top" style={{ backgroundColor: '#137333' }}>💾 Sauvegarder </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {showExamenModal && (
        <div className="modal-overlay" onClick={() => { setShowExamenModal(false); setSelectedExamen(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ backgroundColor: examenModalMode === 'ajouter' ? '#1a73e8' : '#137333' }}>
              <h2>{examenModalMode === 'ajouter' ? '🏅 Enregistrer un Nouvel Examen' : '✏️ Modifier l\'Examen'}</h2>
              <button className="btn-close-modal" onClick={() => { setShowExamenModal(false); setSelectedExamen(null); }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="modal-field" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Intitulé / Nom de l'Examen</label>
                  <input 
                    type="text" 
                    id="exam_nom" 
                    placeholder="Ex: CAP, BT, DTS..." 
                    defaultValue={selectedExamen ? selectedExamen.nom_exam : ''}
                    style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '4px', border: '1px solid #dadce0' }}
                  />
                </div>
                <div className="modal-field">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Description ou Remarques</label>
                  <textarea 
                    id="exam_desc" 
                    rows="4"
                    placeholder="Saisir les détails concernant cet examen officiel..."
                    defaultValue={selectedExamen ? selectedExamen.description_exam : ''}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dadce0', resize: 'vertical' }}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid #dadce0' }}>
              <button type="button" className="btn-table-action" onClick={() => { setShowExamenModal(false); setSelectedExamen(null); }}>Annuler</button>
              <button 
                type="button" 
                className="btn-action-top" 
                style={{ backgroundColor: examenModalMode === 'ajouter' ? '#1a73e8' : '#137333' }}
                onClick={async () => {
                  const nom = document.getElementById('exam_nom')?.value?.trim();
                  const desc = document.getElementById('exam_desc')?.value?.trim() || "";

                  if (!nom) {
                    alert("⚠️ Veuillez saisir le nom de l'examen.");
                    return;
                  }

                  const payload = { nom_exam: nom, description_exam: desc };

                  try {
                    if (examenModalMode === 'ajouter') {
                      await API.post('http://localhost:8000/api/examens/creer', payload);
                      alert("✅ Examen enregistré avec succès !");
                    } else {
                      const idCible = selectedExamen.id_examen ?? selectedExamen.id;
                      await API.put(`http://localhost:8000/api/examens/modifier/${idCible}`, payload);
                      alert("✅ Les modifications ont été enregistrées dans la base MySQL !");
                    }
                    
                    await chargerExamens(); 
                    
                    setShowExamenModal(false);
                    setSelectedExamen(null);
                  } catch (err) {
                    alert("⚠️ Erreur lors de la communication réseau avec l'API.");
                  }
                }}

              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showEnLigneModal && (
        <div className="modal-overlay" onClick={() => { setShowEnLigneModal(false); setDemandesCochees([]); }} style={{ zIndex: 1200 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '950px', width: '95%' }}>
            
            <div className="modal-header" style={{ backgroundColor: '#1a73e8', color: '#ffffff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌐</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Flux des Demandes Apprenants soumises en Ligne</h2>
              </div>
              <button className="btn-close-modal" onClick={() => { setShowEnLigneModal(false); setDemandesCochees([]); }}>&times;</button>
            </div>

            <div style={{ 
              padding: '1rem 1.5rem 0 1.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                
                <div style={{ 
                  backgroundColor: '#e8f0fe', 
                  color: '#1a73e8', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #d2e3fc'
                }}>
                  📜 Attestations : <strong>{(demandes || []).filter(d => d.type_document === 'ATTESTATION').length}</strong>
                </div>

                <div style={{ 
                  backgroundColor: '#fef7e0', 
                  color: '#b06000', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #feefc3'
                }}>
                  🎓 Diplômes : <strong>{(demandes || []).filter(d => d.type_document === 'DIPLOME').length}</strong>
                </div>

              </div>

              <button
                type="button"
                disabled={demandesCochees.length === 0}
                onClick={async () => {
                  if (window.confirm(`📥 Voulez-vous vraiment transférer et actionner les ${demandesCochees.length} demande(s) sélectionnée(s) vers la Liste des Demandes ?`)) {
                    try {
                      for (const idDem of demandesCochees) {
                        const demandeObj = demandes.find(d => (d.id_demande || d.id) === idDem);
                        if (demandeObj) {
                          const payloadTransfert = {
                            im_apprenant: demandeObj.im_apprenant,
                            nom_apprenant: demandeObj.nom_apprenant,
                            prenom_apprenant: demandeObj.prenom_apprenant || "",
                            session: parseInt(demandeObj.session, 10),
                            type_document: demandeObj.type_document,
                            statut: "EN_COURS"
                          };
                          await API.post('http://localhost:8000/api/demandes/creer-depuis-enligne', payloadTransfert);
                        }
                      }

                      alert("✅ Transfert et actionnement réussis au Guichet unique !");
                      setDemandesCochees([]);
                      if (typeof chargerDemandes === 'function') await chargerDemandes();
                      if (typeof chargerApprenants === 'function') await chargerApprenants();
                      setShowEnLigneModal(false);
                    } catch (err) {
                      console.error(err);
                      alert("⚠️ Erreur lors du transfert des données vers MySQL.");
                    }
                  }
                }}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: demandesCochees.length > 0 ? '#137333' : '#e0e0e0',
                  color: demandesCochees.length > 0 ? '#ffffff' : '#9aa0a6',
                  fontWeight: 'bold',
                  cursor: demandesCochees.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ⚙️ Traiter {demandesCochees.length > 0 && `(${demandesCochees.length})`}
              </button>
            </div>


            <div className="modal-body" style={{ padding: '1rem 1.5rem 1.5rem 1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="data-table-container" style={{ boxShadow: 'none', border: '1px solid #dadce0' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={demandes.length > 0 && demandesCochees.length === demandes.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const tousLesIds = demandes.map(d => d.id_demande || d.id);
                              setDemandesCochees(tousLesIds);
                            } else {
                              setDemandesCochees([]);
                            }
                          }}
                          style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                        />
                      </th>
                      <th>Matricule (IM)</th>
                      <th>Candidat En ligne</th>
                      <th>Type de Pièce</th>
                      <th>Session</th>
                      <th style={{ textAlign: 'center' }}>Origine</th>
                      <th>Statut Actuel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(demandes || []).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-entries" style={{ padding: '2rem' }}>
                           Aucune démarche en ligne en attente dans le système central.
                        </td>
                      </tr>
                    ) : (
                      (demandes || []).map((dem, index) => {
                        const idDemandeUnic = dem.id_demande || dem.id;
                        const statutBrut = (dem.statut || "EN_ATTENTE").toUpperCase();
                        const estCoche = demandesCochees.includes(idDemandeUnic);
                        
                        return (
                          <tr key={idDemandeUnic || index} style={{ backgroundColor: estCoche ? '#f1f8e9' : 'transparent' }}>
                            
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox"
                                checked={estCoche}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDemandesCochees([...demandesCochees, idDemandeUnic]);
                                  } else {
                                    setDemandesCochees(demandesCochees.filter(id => id !== idDemandeUnic));
                                  }
                                }}
                                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                              />
                            </td>

                            <td><strong>{dem.im_apprenant}</strong></td>
                            <td style={{ fontWeight: '500' }}>
                              {dem.nom_apprenant || "Apprenant"} {dem.prenom_apprenant || ""}
                            </td>
                            <td>
                              {dem.type_document === 'ATTESTATION' ? (
                                <span style={{ color: '#1a73e8', fontWeight: '600' }}>📜 Attestation</span>
                              ) : (
                                <span style={{ color: '#b06000', fontWeight: '600' }}>🎓 Diplôme</span>
                              )}
                            </td>
                            <td>{dem.session || "N/A"}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                PORTAIL_WEB
                              </span>
                            </td>
                            <td>
                              {statutBrut === 'TERMINER' && <span className="status-badge valide">✅ Signé & Délivré</span>}
                              {statutBrut === 'EN_COURS' && <span className="status-badge en-cours" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>⏳ En traitement</span>}
                              {statutBrut === 'EN_ATTENTE' && <span className="status-badge en-attente" style={{ backgroundColor: '#fef7e0', color: '#b06000' }}>⏳ En attente</span>}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #dadce0' }}>
              <button 
                type="button" 
                className="btn-table-action" 
                onClick={() => { setShowEnLigneModal(false); setDemandesCochees([]); }}
                style={{ padding: '8px 20px' }}
              >
                Fermer la vue en ligne
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
};

export default DashboardAdmin;
