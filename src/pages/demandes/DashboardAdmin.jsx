import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDretfp from '/src/assets/images/logo.jpeg';
import Sidebar from '/src/components/Sidebar';
import * as XLSX from 'xlsx';
import API from '../../services/api'; 
import './DashboardAdmin.css';
import { 
  LuUserPlus      
} from 'react-icons/lu';


import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const DashboardAdmin = () => {



  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedApprenant, setSelectedApprenant] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');

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


  const effectifTotalApprenants = 2500;
  const effectifDiplomesRégion = 1800;
  const totalGlobalDemandes = 515;
  const partDiplomesAyantDemande = ((totalGlobalDemandes / effectifDiplomesRégion) * 100).toFixed(1);
  const partGlobaleDemandeurs = ((totalGlobalDemandes / effectifTotalApprenants) * 100).toFixed(1);

 

   

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

      let statutTexte = "Aucune démarche";
      const statutBrut = String(item.progression || "").toUpperCase();
      if (statutBrut === 'TERMINER') statutTexte = "Terminé / Signé";
      else if (statutBrut === 'EN_COURS') statutTexte = "En traitement";
      else if (statutBrut === 'EN_ATTENTE') statutTexte = "En attente";

      return {
        'Matricule (IM)': item.im_apprenant,
        'Nom': String(item.nom_apprenant || "").toUpperCase(),
        'Prénoms': item.prenom_apprenant || "",
        'Date de Naissance': datePropre,
        'Lieu de Naissance': String(item.lieu_naiss || "").toUpperCase(),
        'Examen': String(item.examen_id || "").toUpperCase(),
        'Session': item.session || 2026,
        'Mention': item.mention || "Passable",
        'Établissement': nomEtab, 
        'Secteur': nomSec,        
        'Filière': nomFil,         
        'Métier': nomMet,           
        'Statut Parcours': statutTexte
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

        const apprenantsFormates = listeImportee.map((row) => {
          
          const etabTexte = row['Établissement'] || row['etablissement_id'] || "";
          const secteurTexte = row['Secteur'] || row['secteur_id'] || "";
          const filiereTexte = row['Filière'] || row['filiere_id'] || "";
          const metierTexte = row['Métier'] || row['metier_id'] || "";

          const etabTrouve = (listeEtablissements || []).find(e => 
            (e.nom_etablissement || e.nom)?.toString().trim().toLowerCase() === etabTexte.toString().trim().toLowerCase()
          );
          const secteurTrouve = (listeSecteurs || []).find(s => 
            (s.nom_secteur || s.nom)?.toString().trim().toLowerCase() === secteurTexte.toString().trim().toLowerCase()
          );
          const filiereTrouve = (listeFilieres || []).find(f => 
            (f.nom_filiere || f.nom)?.toString().trim().toLowerCase() === filiereTexte.toString().trim().toLowerCase()
          );
          const metierTrouve = (listeMetiers || []).find(m => 
            (m.nom_metier || m.nom)?.toString().trim().toLowerCase() === metierTexte.toString().trim().toLowerCase()
          );

          return {
            im_apprenant: String(row['Matricule (IM)'] || row['im_apprenant'] || "").trim(),
            nom_apprenant: String(row['Nom'] || row['nom_apprenant'] || 'INCONNU').toUpperCase().trim(),
            prenom_apprenant: String(row['Prénoms'] || row['prenom_apprenant'] || "").trim(),
            date_naiss: String(row['Date de Naissance'] || row['date_naiss'] || '2000-01-01').trim(),
            lieu_naiss: String(row['Lieu de Naissance'] || row['lieu_naiss'] || 'INCONNU').toUpperCase().trim(),
            examen_id: String(row['Examen'] || row['examen_id'] || 'CAP').toUpperCase().trim(),
            session: parseInt(row['Session'] || row['session'], 10) || 2026,
            mention: String(row['Mention'] || row['mention'] || 'Passable').trim(),           
            etablissement_id: etabTrouve ? (etabTrouve.id_etablissement || etabTrouve.id) : 1,
            secteur_id: secteurTrouve ? (secteurTrouve.id_secteur || secteurTrouve.id) : 1,
            filiere_id: filiereTrouve ? (filiereTrouve.id_filiere || filiereTrouve.id) : 1,
            metier_id: metierTrouve ? (metierTrouve.id_metier || metierTrouve.id) : 1,
            
            progression: String(row['Statut Parcours'] || row['Statut Demande'] || row['progression'] || 'AUCUNE_DEMANDE').trim()
          };
        });

        try {
          await API.post('http://localhost:8000/api/apprenants/import-bulk', { apprenants: apprenantsFormates });
          alert(`✅ Importation en masse réussie ! ${apprenantsFormates.length} apprenants ont été synchronisés et enregistrés dans MySQL.`);
          
          if (typeof chargerApprenants === 'function') {
            await chargerApprenants();
          }
        } catch (apiErr) {
          console.error(apiErr);
          alert("⚠️ Échec d'enregistrement de masse : Le serveur FastAPI ou la base de données WampServer ne répond pas.");
        }

      } catch (parseErr) {
        console.error(parseErr);
        alert("⚠️ Le format ou l'arborescence structurelle du fichier Excel n'est pas lisible par le composant.");
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

  
 

  const demandesFiltrees = (demandes || []).filter(item => {
    if (!item) return false;
    const nomAchercher = (item.nom_complet || item.nom || "").toString().toLowerCase();
    const imAchercher = (item.im_apprenant || item.matricule || "").toString().toLowerCase();
    const saisie = searchNomIm.toLowerCase();
    const matchSearch = nomAchercher.includes(saisie) || imAchercher.includes(saisie);
    const docItem = (item.type_document || item.type || "").toString().toUpperCase();
    const matchDoc = filterDoc === 'Tous' || docItem === filterDoc.toUpperCase();
    const centreItem = (item.centre_examen || item.centre || "").toString().toLowerCase();
    const matchCentre = filterCentre === 'Tous' || centreItem === filterCentre.toLowerCase();
    const statutItem = (item.statut || "").toString().toUpperCase();
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
    try {
      await API.put(`/demandes/envoyer-au-traitement/${selectedDemande.id_demande}`);
      alert(`✅ Dossier transféré avec succès dans la "Liste des Traitements" (${selectedDemande.type_document.toLowerCase()}) !`);
      await chargerDemandes(); 
      setShowTraiteModal(false);
      setSelectedDemande(null);
    } catch (err) {
      alert("Erreur lors du transfert du dossier au traitement.");
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
    if (activeMenu === 'liste_examens') {
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
        centre_examen: String(nomCentreExamen).trim()
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





  return (
    <div className="dashboard-container">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} notifCount={notifCount} setNotifCount={setNotifCount} filterType={filterType} setFilterType={setFilterType} demandes={demandes} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="main-content">
        <div className="header-bar">
          <div className="header-title">
            <h1>Direction Régionale de l'Enseignement Technique</h1>
          </div>
                <button 
                  type="button"
                  title="Consulter les demandes soumises en ligne"
                  onClick={() => setShowEnLigneModal(true)} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '4px',
                    border: '1px solid #1a73e8',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1557b0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
                >
                  🌐 Demandes en Ligne
                </button>

        </div>

        <div className="content-body">

          
          {activeMenu === 'dashboard' && (
            <div className="dashboard-layout-main" style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <h4>Taux de démarche des diplômés</h4>
                  <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
                    <Pie data={{ labels: ['Fait', 'Aucune'], datasets: [{ data: [partDiplomesAyantDemande, 100 - partDiplomesAyantDemande], backgroundColor: ['#002f6c', '#dadce0'] }] }} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <h4>Évolution Annuelle</h4>
                  <div style={{ height: '180px' }}>
                    <Line data={{ labels: ['2024', '2025', '2026'], datasets: [{ label: 'Taux (%)', data: [18.1, 24.5, partDiplomesAyantDemande], borderColor: '#002f6c', fill: true }] }} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="indicator-box-tile" style={{ background: 'white', color: 'black', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600 }}>Diplômés</p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#002f6c' }}>{effectifDiplomesRégion}</h3>
                </div>

                <div className="indicator-box-tile" style={{ background: 'white', color: 'black', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600 }}>Total de Demande Diplôme(s)</p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#137333' }}>{totalGlobalDemandes}</h3>
                </div>

                <div className="indicator-box-tile" style={{ background: 'white', color: 'black', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600 }}>Total de Demande Attestation(s)</p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#002f6c' }}>{totalGlobalDemandes}</h3>
                </div>
              </div>
            </div>
          )}
                  
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
                    .sort((a, b) => b - a) // Trie du plus récent au plus ancien
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
                            <td><span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{item.examen_id || "B.E.P"}</span> ({item.session || "N/A"})</td>
                            
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
                              {statutDemande === 'TERMINER' && <span className="status-badge valide">✅ Terminé / Signé</span>}
                              {statutDemande === 'EN_COURS' && <span className="status-badge en-cours" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>⏳ En traitement</span>}
                              {statutDemande === 'EN_ATTENTE' && <span className="status-badge en-attente" style={{ backgroundColor: '#fef7e0', color: '#b06000' }}>⏳ En attente</span>}
                              {statutDemande === 'AUCUNE_DEMANDE' && <span className="status-badge offline" style={{ backgroundColor: '#f1f3f4', color: '#5f6368' }}>❌ Aucune démarche</span>}
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
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom</th>
                      <th>Document</th>
                      <th>Centre</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!demandesFiltrees || demandesFiltrees.length === 0) ? (
                      <tr><td colSpan="7" className="no-entries">Aucune demande de titre dans le registre.</td></tr>
                    ) : (
                      demandesFiltrees.map((dem, index) => {
                        const matriculeAffiche = dem.im_apprenant || dem.matricule || "N/A";
                        const nomAffiche = dem.nom_complet || dem.nom || "Candidat Anonyme";
                        const docAffiche = dem.type_document || dem.type || "NON SPÉCIFIÉ";
                        const centreAffiche = dem.centre_examen || dem.centre || "Bureau Central";
                        const dateAffiche = dem.date_depot || dem.date_demande || "En cours";
                        const statutAffiche = (dem.statut || "EN_ATTENTE").toString().toUpperCase();

                        return (
                          <tr key={dem.id_demande || dem.id || index}>
                            <td><strong>{matriculeAffiche}</strong></td>
                            <td>{nomAffiche}</td>
                            <td><span style={{ fontWeight: 600, color: '#002f6c' }}>{docAffiche}</span></td>
                            <td>{centreAffiche}</td>
                            <td>{dateAffiche}</td>
                            <td>
                              <span className={`status-badge ${statutAffiche === 'TERMINER' ? 'valide' : statutAffiche === 'EN_COURS' ? 'en-cours' : 'en-attente'}`} style={{
                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                                backgroundColor: statutAffiche === 'TERMINER' ? '#e6f4ea' : statutAffiche === 'EN_COURS' ? '#e8f0fe' : '#fef7e0',
                                color: statutAffiche === 'TERMINER' ? '#137333' : statutAffiche === 'EN_COURS' ? '#1a73e8' : '#b06000'
                              }}>
                                {statutAffiche === 'TERMINER' ? '✅ Terminer' : statutAffiche === 'EN_COURS' ? '⏳ En traitement' : '⏳ En attente'}
                              </span>
                            </td>
                            
                            <td style={{ position: 'relative' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button 
                                  className="btn-table-action" 
                                  style={{ 
                                    padding: '4px 10px', 
                                    cursor: (statutAffiche === 'TERMINER' || statutAffiche === 'EN_COURS') ? 'not-allowed' : 'pointer',
                                    opacity: (statutAffiche === 'TERMINER' || statutAffiche === 'EN_COURS') ? 0.4 : 1
                                  }} 
                                  disabled={statutAffiche === 'TERMINER' || statutAffiche === 'EN_COURS'}
                                  onClick={() => { setSelectedDemande(dem); setShowTraiteModal(true); }}
                                >
                                  {statutAffiche === 'TERMINER' ? 'Traité' : statutAffiche === 'EN_COURS' ? 'En cours' : 'Traître'}
                                </button>

                                <span 
                                  style={{ cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', fontWeight: 'bold', color: '#5f6368' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDemandeMenuId(openDemandeMenuId === dem.id_demande ? null : dem.id_demande);
                                  }}
                                >
                                  ⋮
                                </span>
                              </div>

                              {openDemandeMenuId === dem.id_demande && (
                                <div className="dropdown-action-menu" style={{
                                  position: 'absolute', right: '10px', top: '35px', backgroundColor: '#ffffff',
                                  border: '1px solid #dadce0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                  zIndex: 100, minWidth: '160px', padding: '4px 0'
                                }}>
                                  
                                  <button
                                    className="dropdown-action-item"
                                    disabled={statutAffiche === 'VALIDE'} 
                                    style={{
                                      width: '100%', border: 'none', background: 'none', padding: '8px 12px',
                                      textAlign: 'left', fontSize: '0.85rem', cursor: statutAffiche === 'VALIDE' ? 'not-allowed' : 'pointer',
                                      color: statutAffiche === 'VALIDE' ? '#c0c0c0' : '#3c4043', opacity: statutAffiche === 'VALIDE' ? 0.5 : 1
                                    }}
                                    onClick={async () => {
                                      if (window.confirm(`Voulez-vous annuler le traitement de la demande de ${nomAffiche} ?`)) {
                                        try {
                                          await API.put(`/demandes/annuler/${dem.id_demande}`);
                                          await chargerDemandes();
                                        } catch (err) {
                                          alert(err.response?.data?.detail);
                                        }
                                      }
                                      setOpenDemandeMenuId(null);
                                    }}
                                  >
                                    ❌ Annuler la demande
                                  </button>

                                  <button
                                    className="dropdown-action-item"
                                    disabled={statutAffiche === 'EN_ATTENTE'} 
                                    style={{
                                      width: '100%', border: 'none', background: 'none', padding: '8px 12px',
                                      textAlign: 'left', fontSize: '0.85rem', cursor: statutAffiche === 'EN_ATTENTE' ? 'not-allowed' : 'pointer',
                                      color: statutAffiche === 'EN_ATTENTE' ? '#c0c0c0' : '#d93025', opacity: statutAffiche === 'EN_ATTENTE' ? 0.5 : 1
                                    }}
                                    onClick={async () => {
                                      if (window.confirm(`⚠️ ATTENTION : Supprimer définitivement la demande de ${nomAffiche} du registre ?`)) {
                                        try {
                                          await API.delete(`/demandes/supprimer/${dem.id_demande}`);
                                          await chargerDemandes();
                                        } catch (err) {
                                          alert(err.response?.data?.detail);
                                        }
                                      }
                                      setOpenDemandeMenuId(null);
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
                      const fluxFiltre = typeof attestationsTraiteesFiltrees !== 'undefined' ? attestationsTraiteesFiltrees : [];

                      if (fluxFiltre.length === 0) {
                        return (
                          <tr>
                            <td colSpan="8" className="no-entries" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>
                              🔍 Aucun dossier dans ce registre ne correspond à vos critères de recherche.
                            </td>
                          </tr>
                        );
                      }

                      return fluxFiltre.map((dem, index) => {
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
                <table className="data-table">
                  <thead>
                    <tr><th>Matrice</th><th>Nom complet</th><th>Document</th><th>Centre d'Examen</th><th>Date Dépôt</th><th>Statut</th><th>Décision Final</th></tr>
                  </thead>
                  <tbody>
                    {demandes.filter(d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'DIPLOME').length === 0 ? (
                      <tr><td colSpan="7" className="no-entries">🎓 Aucun diplôme national en cours de traitement.</td></tr>
                    ) : (
                      demandes.filter(d => (d.statut || "").toUpperCase() === 'EN_COURS' && (d.type_document || "").toUpperCase() === 'DIPLOME').map((dem, index) => (
                        <tr key={dem.id_demande || index}>
                          <td><strong>{dem.im_apprenant}</strong></td><td>{dem.nom_complet}</td><td>{dem.type_document}</td><td>{dem.centre_examen}</td><td>{dem.date_depot}</td>
                          <td><span className="status-badge" style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e8f0fe', color: '#1a73e8', fontWeight: 600 }}>En traitement</span></td>
                          <td><button className="btn-action-top" style={{ padding: '6px 14px', height: 'auto', backgroundColor: '#137333', cursor: 'pointer' }} onClick={() => handleSignerDocumentDefinitif(dem.id_demande)}>✒️ Signer</button></td>
                        </tr>
                      ))
                    )}
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
                                    <button className="dropdown-action-item" onClick={() => { setSelectedEtablissement(centre); setShowDetailsEtablissement(true); setOpenEtabMenuId(null); }}>👁️ Details</button>
                                    <button className="dropdown-action-item" onClick={() => { setSelectedEtablissement(centre); setContactEtab(centre.contact.replace('+261 ', '').replace(/\s+/g, '')); setShowEditEtablissement(true); setOpenEtabMenuId(null); }}>✏️ Modificateur</button>
                                              
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
                  placeholder="Rechercher un examen par son nom (Ex: CAP, BT)..." 
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

        </div> 
      </div> 

                  
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
                  <input type="text" id="add_lieu_naiss" placeholder="Ex: FIANARANTSOA" required />
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
                    const imSaisi = document.getElementById('add_im')?.value?.trim();
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

                    const nouvelApprenant = {
                      im_apprenant: String(imSaisi),
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
                    alert("⚠️ Erreur 422 du serveur central : Le format ou le type de certaines données est incorrect.");
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
                          📭 Aucune démarche en ligne en attente dans le système central.
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
