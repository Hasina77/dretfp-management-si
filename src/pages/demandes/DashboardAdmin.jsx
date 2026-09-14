import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDretfp from '/src/assets/images/logo.jpeg';
import Sidebar from '/src/components/Sidebar';
import * as XLSX from 'xlsx';
import API from '../../services/api'; // Intercepteur Axios configuré avec JWT
import './DashboardAdmin.css';

// Importation des composants Chart.js pour les statistiques
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const DashboardAdmin = () => {
  const navigate = useNavigate();

  // --- 🔒 1. DÉCLARATION DE TOUS LES ÉTATS INTERNES (Obligatoire ici) ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedApprenant, setSelectedApprenant] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [activeMenu, setActiveMenu] = useState('liste_apprenants');

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showTraiteModal, setShowTraiteModal] = useState(false);
  
  // États pour les filtres et la recherche
  const [search, setSearch] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('Tous');
  const [filterFiliere, setFilterFiliere] = useState('Tous');
  const [filterCentre, setFilterCentre] = useState('Tous');
  const [filterType, setFilterType] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

   const [notifCount, setNotifCount] = useState(0);

  // --- 🗄️ 2. ÉTAT DYNAMIQUE POUR LE REGISTRE DES APPRENANTS (Alimenté par FastAPI) ---
  const [apprenantsRégion, setApprenantsRégion] = useState([]);

    // 🏢 MODIFICATION DYNAMIQUE : On initialise à vide car les données viendront de FastAPI (SQLite)
  const [demandes, setDemandes] = useState([]);


  // Constantes de statistiques pour la charte graphique
  const effectifTotalApprenants = 2500;
  const effectifDiplomesRégion = 1800;
  const totalGlobalDemandes = 515;
  const partDiplomesAyantDemande = ((totalGlobalDemandes / effectifDiplomesRégion) * 100).toFixed(1);
  const partGlobaleDemandeurs = ((totalGlobalDemandes / effectifTotalApprenants) * 100).toFixed(1);

 
  // Fonction pour charger la liste filtrée depuis la vraie BDD via FastAPI
  const chargerApprenants = async () => {
    try {
      const response = await API.get('/apprenants/liste', {
        params: {
          search: search,
          annee: filterAnnee !== 'Tous' ? filterAnnee : null,
          filiere: filterFiliere !== 'Tous' ? filterFiliere : null,
          etablissement: filterCentre !== 'Tous' ? filterCentre : null
        }
      });
      setApprenantsRégion(response.data);
    } catch (err) {
      console.error("Erreur lors de la synchronisation BDD. Utilisation des données locales.");
      // Fallback local pour éviter l'écran blanc en développement si FastAPI est éteint
      setApprenantsRégion([
        { id_apprenant: 1, im_apprenant: 2026004, nom_apprenant: 'RAKOTO', prenom_apprenant: 'Jean', date_naiss: '12/04/2004', lieu_naiss: 'Fianarantsoa', examen_id: 'CAP', etablissement_id: 'Lycée Technique Fianarantsoa', secteur_id: 'Industriel', filiere_id: 'Génie Logiciel', metier_id: 'Développeur', session: 2026, mention: 'Très Bien', progression: 'ATTESTATION_VALIDEE' },
        { id_apprenant: 2, im_apprenant: 2026089, nom_apprenant: 'RASOA', prenom_apprenant: 'Marie', date_naiss: '25/08/2005', lieu_naiss: 'Ambalavao', examen_id: 'BEP', etablissement_id: 'CFP Ambalavao', secteur_id: 'Artisanat', filiere_id: 'Ouvrage Bois', metier_id: 'Menuisier', session: 2026, mention: 'Assez Bien', progression: 'DIPLOME_EN_COURS' },
        { id_apprenant: 3, im_apprenant: 2025112, nom_apprenant: 'ANDRIA TOVO', prenom_apprenant: 'Hari', date_naiss: '03/11/2003', lieu_naiss: 'Fianarantsoa', examen_id: 'BT', etablissement_id: 'Lycée Technique Fianarantsoa', secteur_id: 'Industriel', filiere_id: 'Électricité', metier_id: 'Électricien', session: 2025, mention: 'Passable', progression: 'AUCUNE_DEMANDE' }
      ]);
    }
  };

  // Déclenchement automatique des appels réseaux à chaque saisie de filtre
  useEffect(() => {
    chargerApprenants();
  }, [search, filterAnnee, filterFiliere, filterCentre]);

  // Route API PUT : Modifier un apprenant en BDD
  const sauvegarderModification = async (id, donneesModifiees) => {
    try {
      await API.put(`/apprenants/modifier/${id}`, donneesModifiees);
      alert("Données mises à jour avec succès dans la base centrale DRETFP !");
      chargerApprenants();
    } catch (err) {
      alert("Erreur lors de la modification en BDD.");
    }
  };

    // 🗑️ SUPPRESSION COMPLÈTEMENT CORRIGÉE ET SÉCURISÉE
  const supprimerApprenant = async (id) => {
    // 1. Demande de confirmation administrative (Règle d'ingénierie logicielle)
    if (window.confirm("⚠️ Confirmez-vous la radiation définitive de cet apprenant du registre ?")) {
      
      try {
        // 2. Tentative de suppression réelle sur le serveur FastAPI Python
        await API.delete(`/apprenants/supprimer/${id}`);
        
        // Si le serveur répond avec succès, on met à jour l'écran
        setApprenantsRégion(apprenantsRégion.filter(item => item.id_apprenant !== id));
        alert("🗑️ Apprenant supprimé avec succès de la base de données centrale.");
        
      } catch (err) {
        console.warn("FastAPI non connecté. Exécution de la suppression en mode local simulé.");
        
        setApprenantsRégion(apprenantsRégion.filter(item => item.id_apprenant !== id));
        alert("📥 Mode démo : L'apprenant a été retiré localement de l'interface.");
      }
    }
  };


  // --- 📥 LOGIQUE DE MANIPULATION DES FICHIERS EXCEL BIEN PLACÉE ---
  
  const exporterVersExcel = () => {
    const donneesExcel = apprenantsFiltres.map(item => ({
      'Matricule (IM)': item.im_apprenant,
      'Nom': item.nom_apprenant,
      'Prénoms': item.prenom_apprenant,
      'Date de Naissance': item.date_naiss,
      'Lieu de Naissance': item.lieu_naiss,
      'Examen': item.examen_id,
      'Session': item.session,
      'Établissement': item.etablissement_id,
      'Filière': item.filiere_id,
      'Métier': item.metier_id,
      'Mention': item.mention,
      'Statut Demande': item.progression
    }));
    const feuille = XLSX.utils.json_to_sheet(donneesExcel);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, "Registre Apprenants");
    XLSX.writeFile(classeur, `Registre_Apprenants_DRETFP_${filterAnnee}.xlsx`);
  };

    // 📥 IMPORTER DEPUIS EXCEL CORRIGÉ ET ROBUSTE
  const importerDepuisExcel = (e) => {
    const file = e.target.files[0]; // Correction : Récupère le premier fichier sélectionné
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const nombreFeuille = workbook.SheetNames[0];
        const feuille = workbook.Sheets[nombreFeuille];
        
        // 1. Conversion des lignes du fichier Excel en tableau JSON
        const listeImportee = XLSX.utils.sheet_to_json(feuille);
        
        if (listeImportee.length === 0) {
          alert("⚠️ Le fichier Excel sélectionné est vide !");
          return;
        }

        // 2. Mappage intelligent pour adapter les colonnes Excel aux clés UML de ton application
        const apprenantsFormates = listeImportee.map((row, idx) => ({
          id_apprenant: Date.now() + idx,
          im_apprenant: row['Matricule (IM)'] || row['im_apprenant'] || Math.floor(100000 + Math.random() * 900000),
          nom_apprenant: row['Nom'] || row['nom_apprenant'] || 'INCONNU',
          prenom_apprenant: row['Prénoms'] || row['prenom_apprenant'] || '',
          date_naiss: row['Date de Naissance'] || row['date_naiss'] || 'JJ/MM/AAAA',
          lieu_naiss: row['Lieu de Naissance'] || row['lieu_naiss'] || '',
          examen_id: row['Examen'] || row['examen_id'] || 'CAP',
          etablissement_id: row['Établissement'] || row['etablissement_id'] || '',
          filiere_id: row['Filière'] || row['filiere_id'] || '',
          metier_id: row['Métier'] || row['metier_id'] || '',
          mention: row['Mention'] || row['mention'] || 'Passable',
          progression: row['Statut Demande'] || row['progression'] || 'AUCUNE_DEMANDE'
        }));

        // 3. TENTATIVE D'ENVOI AU BACKEND FASTAPI
        try {
          await API.post('/apprenants/import-bulk', { apprenants: apprenantsFormates });
          alert(`✅ Importation réussie : ${apprenantsFormates.length} apprenants enregistrés en BDD !`);
        } catch (apiErr) {
          console.warn("FastAPI non joignable. Chargement des données en mode local simulé.");
          // Fallback : Si le serveur est éteint, on l'affiche quand même localement sur l'écran !
          setApprenantsRégion([...apprenantsFormates, ...apprenantsRégion]);
          alert(`📥 Mode démo : ${apprenantsFormates.length} apprenants chargés localement sur l'interface.`);
        }

      } catch (parseErr) {
        console.error(parseErr);
        alert("⚠️ Le format du dictionnaire ou de la structure du fichier Excel n'est pas valide.");
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Réinitialise le champ d'import pour pouvoir recharger le même fichier si besoin
    e.target.value = "";
  };


  // --- ⚙️ ALGORITHMES DE RECHERCHE FRONTEND ---
  const apprenantsFiltres = apprenantsRégion.filter(item => {
    const nomComplet = `${item.nom_apprenant} ${item.prenom_apprenant}`.toLowerCase();
    const matchSearch = nomComplet.includes(search.toLowerCase()) || item.im_apprenant.toString().includes(search);
    const matchAnnee = filterAnnee === 'Tous' || item.session.toString() === filterAnnee;
    const matchFiliere = filterFiliere === 'Tous' || item.filiere_id === filterFiliere;
    const matchCentre = filterCentre === 'Tous' || item.etablissement_id === filterCentre;
    return matchSearch && matchAnnee && matchFiliere && matchCentre;
  });

    // 🚀 VERSION CORRIGÉE ET BLINDÉE CONTRE LES ERREURS UNDEFINED / TOLOWERCASE
  const demandesFiltrees = demandes.filter(item => {
    // 🔒 1. Extraction sécurisée du Nom (on protège avec une chaîne vide si absent)
    const nomAchercher = (item.nom_complet || item.nom || "").toLowerCase();
    
    // 🔒 2. Extraction sécurisée du Matricule
    const matriculeAchercher = (item.im_apprenant || item.matricule || "").toString();
    
    // 🔍 3. Application du filtre de recherche textuel
    const matchSearch = nomAchercher.includes(search.toLowerCase()) || matriculeAchercher.includes(search);
    
    // 🔒 4. Extraction sécurisée du type de document
    const typeDocument = item.type_document || item.type || "";
    const matchType = filterType === 'Tous' || typeDocument === filterType;
    
    // 🔒 5. Extraction sécurisée du statut
    const statutDocument = item.statut || "";
    const matchStatus = filterStatus === 'Tous' || statutDocument === filterStatus;
    
    return matchSearch && matchType && matchStatus;
  });


    // 🔥 CODE À AJOUTER : Algorithme de copie et de notification
    // 🚀 ALGORITHME DE TRANSFERT CORRIGÉ ET SÉCURISÉ CONTRE LES ERREURS TOLOWERCASE
  const transfererVersDemandes = async (apprenant, typeDoc) => {
    
    // 1️⃣ VÉRIFICATION RATIONNELLE : Contrôle des doublons avec protection optionnelle ?.
    const demandeExisteDeja = demandes.some((demande) => {
      // Extraction sécurisée des matricules (on gère im_apprenant ou matricule)
      const demMatricule = (demande.im_apprenant || demande.matricule || "").toString();
      const appMatricule = (apprenant.im_apprenant || "").toString();
      
      // Extraction sécurisée du type de document (on protège le toLowerCase avec ?. et une valeur par défaut)
      const demType = (demande.type_document || demande.type || "").toLowerCase();
      const appType = (typeDoc || "").toLowerCase();
      
      return demMatricule === appMatricule && demType === appType;
    });

    // 2️⃣ Si la démarche existe déjà, on bloque immédiatement le flux
    if (demandeExisteDeja) {
      alert(`⚠️ Action Interdite : Cet apprenant a déjà soumis une demande de ${typeDoc.toLowerCase()} !`);
      return; // Stoppe l'exécution de la fonction
    }

    // 3️⃣ Envoi réseau vers l'API FastAPI et sauvegarde SQLite
    try {
      const response = await API.post('/demandes/creer', {
        im_apprenant: parseInt(apprenant.im_apprenant), 
        nom_complet: `${apprenant.nom_apprenant} ${apprenant.prenom_apprenant || ''}`.trim(),
        type_document: typeDoc, // 'ATTESTATION' ou 'DIPLOME'
        centre_examen: apprenant.etablissement_id || "Centre Non Spécifié"
      });

      // 4️⃣ Synchronisation visuelle de l'interface en direct
      if (response.data && response.data.data) {
        setDemandes(prevDemandes => [response.data.data, ...prevDemandes]);
      } else {
        const nouvelleDemandeSecours = {
          id_demande: Date.now(),
          im_apprenant: apprenant.im_apprenant,
          nom_complet: `${apprenant.nom_apprenant} ${apprenant.prenom_apprenant || ''}`.trim(),
          type_document: typeDoc, 
          centre_examen: apprenant.etablissement_id,
          date_depot: new Date().toLocaleDateString('fr-FR'),
          statut: 'EN_ATTENTE'
        };
        setDemandes(prevDemandes => [nouvelleDemandeSecours, ...prevDemandes]);
      }

      // Incrémentation sécurisée des notifications
      setNotifCount(prev => prev + 1);

      alert(`✅ Succès : La demande de ${typeDoc.toLowerCase()} pour ${apprenant.nom_apprenant} a été enregistrée en base SQL au statut "En attente".`);
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "⚠️ Erreur lors du transfert des renseignements au serveur central.");
    }
  };


  const [showAddEtablissement, setShowAddEtablissement] = useState(false);
  const [openEtabMenuId, setOpenEtabMenuId] = useState(null); // Pour suivre les 3 points de la table établissements
  // 🔥 CODES À AJOUTER : États pour capturer le Contact et l'E-mail de l'établissement
  const [codeCentre, setCodeCentre] = useState('');
  const [nomEtab, setNomEtab] = useState('');
  const [district, setDistrict] = useState('');
  const [contactEtab, setContactEtab] = useState('');
  const [emailEtab, setEmailEtab] = useState('');

      // 🏢 MODIFICATION : On initialise à vide car les données viendront de la base de données SQL
  const [etablissements, setEtablissements] = useState([]);
    // 🚀 CODE À AJOUTER : Charger le répertoire des centres depuis la base SQL
  const chargerEtablissements = async () => {
    try {
      const response = await API.get('/etablissements/liste');
      setEtablissements(response.data); // Injecte les vrais établissements dans le tableau
    } catch (err) {
      console.error("Erreur lors de la récupération des établissements depuis FastAPI");
    }
  };
  // 🔥 CODES À AJOUTER : États exclusifs pour la modification d'un établissement
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  const [showEditEtablissement, setShowEditEtablissement] = useState(false);

  // Déclenche le chargement dès que l'administrateur clique sur l'onglet correspondant
  useEffect(() => {
    if (activeMenu === 'liste_etablissements') {
      chargerEtablissements();
    }
    if (activeMenu === 'liste_demandes') {
      chargerDemandes(); // 🚀 CORRECTION : Cette fonction est maintenant correctement déclarée !
    }
  }, [activeMenu]);


    // 🚀 ALGORITHME DE TRANSFERT DYNAMIQUE VERS LE REGISTRE DES DEMANDES
  const handleCreerDemandeTitre = async (apprenant, typeDoc) => {
    try {
      // 📡 Envoi des coordonnées exactes requises par le modèle DemandeCreate de ton API
      await API.post('/demandes/creer', {
        im_apprenant: apprenant.im_apprenant,
        nom_complet: `${apprenant.nom_apprenant} ${apprenant.prenom_apprenant}`,
        type_document: typeDoc, // 'ATTESTATION' ou 'DIPLOME'
        centre_examen: apprenant.etablissement_id || "Centre Non Spécifié"
      });

      alert(`📄 La demande de ${typeDoc} pour ${apprenant.nom_apprenant} a été transmise avec succès au registre des demandes !`);
      
      // Si l'administrateur est sur l'onglet des demandes, on rafraîchit la liste
      if (activeMenu === 'liste_demandes') {
        await chargerDemandes();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "⚠️ Erreur lors du transfert des renseignements au serveur central.");
    }
  };


    // 🔥 CODE À AJOUTER : Algorithme d'insertion de l'établissement
    const handleEnregistrerEtablissement = async (e) => {
      e.preventDefault();

    // 🧼 1. Nettoyage : On enlève les espaces s'il y en a
    const resteNumero = contactEtab.replace(/\s+/g, '');

    // 🔬 2. Vérification : Est-ce que l'utilisateur a tapé strictement 9 chiffres ?
    const regex9Chiffres = /^\d{9}$/;

    if (!regex9Chiffres.test(resteNumero)) {
      alert("⚠️ Ce numéro n'existe pas à Madagascar. Vous devez saisir exactement 9 chiffres après le +261 (Ex: 345214587).");
      return; // Bloque l'envoi
    }

    // 🔗 3. Assemblage automatique de l'indicatif officiel
    const contactComplet = `+261 ${resteNumero.substring(0,2)} ${resteNumero.substring(2,5)} ${resteNumero.substring(5,7)} ${resteNumero.substring(7,9)}`;

    try {
      await API.post('/etablissements/creer', {
        code_centre: codeCentre,
        nom_etablissement: nomEtab,
        localisation_district: district,
        contact: contactComplet, // Envoie le numéro complet assemblé (+261 34 521 45 87)
        email: emailEtab
      });
      
      alert(`🏢 L'établissement "${nomEtab}" a été inséré dans la base SQL !`);
      await chargerEtablissements();
      setShowAddEtablissement(false);
      setCodeCentre(''); setNomEtab(''); setDistrict(''); setContactEtab(''); setEmailEtab('');
      
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur de transmission au serveur central.");
    }
  };
    // 🔥 CODE À AJOUTER : Algorithme de mise à jour de l'établissement
  const handleModifierEtablissement = async (e) => {
    e.preventDefault();

    // Récupération des valeurs saisies dans le formulaire modale
    const code = document.getElementById('edit-code-centre').value;
    const nom = document.getElementById('edit-nom-etablissement').value;
    const dist = document.getElementById('edit-localisation').value;
    const email = document.getElementById('edit-email').value;
    const resteNum = contactEtab.replace(/\s+/g, '');

    // Validation du format Malagasy à 9 chiffres
    if (!/^\d{9}$/.test(resteNum)) {
      alert("⚠️ Ce numéro n'existe pas à Madagascar. Saisissez strictement 9 chiffres (Ex: 345214587).");
      return;
    }

    const contactComplet = `+261 ${resteNum.substring(0,2)} ${resteNum.substring(2,5)} ${resteNum.substring(5,7)} ${resteNum.substring(7,9)}`;

    try {
      // Envoi de la modification au serveur central FastAPI Python
      await API.put(`/etablissements/modifier/${selectedEtablissement.id_centre}`, {
        code_centre: code,
        nom_etablissement: nom,
        localisation_district: dist,
        contact: contactComplet,
        email: email
      });

      alert(`✅ L'établissement "${nom}" a été mis à jour avec succès en base de données !`);
      await chargerEtablissements(); // Rafraîchit instantanément ton grand tableau à l'écran
      setShowEditEtablissement(false);
      setSelectedEtablissement(null);
      setContactEtab('');
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la mise à jour sur le serveur central.");
    }
  };
    // 🔥 CODE À AJOUTER : État pour contrôler l'ouverture du pop-up Détails Établissement
  const [showDetailsEtablissement, setShowDetailsEtablissement] = useState(false);

  const [selectedEtabIds, setSelectedEtabIds] = useState([]);

  const handleValiderLeDocument = async () => {
    try {
      // 📡 Appel de la route PUT de mise à jour avec l'ID de la demande
      await API.put(`/demandes/valider/${selectedDemande.id_demande}`);
      
      alert(`✅ Le document (${selectedDemande.type_document}) de ${selectedDemande.nom_complet} est validé !`);
      
      await chargerDemandes(); // Recharge le tableau instantanément depuis la base SQLite
      setShowTraiteModal(false);
      setSelectedDemande(null);
    } catch (err) {
      alert("Erreur lors du traitement de la demande sur le serveur central.");
    }
  };
const chargerDemandes = async () => {
    try {
      const response = await API.get('/demandes/liste');
      setDemandes(response.data); // Injecte le tableau JSON provenant de FastAPI
    } catch (err) {
      console.error("Erreur lors de la récupération des demandes de titres");
    }
  };
  



  return (
    <div className="dashboard-container">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} notifCount={notifCount} setNotifCount={setNotifCount} />

      <div className="main-content">
        <div className="header-bar">
          <div className="header-title">
            <h1>Direction Régionale de l'Enseignement Technique</h1>
          </div>
          <button className="btn-action-top" onClick={() => navigate('/demande-diplome')}>
            + Valider au Guichet
          </button>
        </div>

        <div className="content-body">

          
          {/* CAS 2 : STATISTIQUES (TABLEAU DE BORD INTERACTIF) */}
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
              
              {/* SECTION DES CARTES INDICATEURS RESTRUCTURÉE EN BLANC ET NOIR */}
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
                  Registre Régional des Apprenants Inscrits (Données DRETFP)
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

              <div className="filter-bar">
                <input 
                  type="text" 
                  placeholder="Rechercher par Nom ou N° d'Immatriculation (IM)..." 
                  className="search-input"
                  style={{ width: '280px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                
                <select className="filter-select" value={filterAnnee} onChange={(e) => setFilterAnnee(e.target.value)}>
                  <option value="Tous">Session: Toutes</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>

                <select className="filter-select" value={filterFiliere} onChange={(e) => setFilterFiliere(e.target.value)}>
                  <option value="Tous">Filière: Toutes</option>
                  <option value="Génie Logiciel">Génie Logiciel</option>
                  <option value="Ouvrage Bois">Ouvrage Bois</option>
                  <option value="Électricité">Électricité</option>
                </select>

                <select className="filter-select" value={filterCentre} onChange={(e) => setFilterCentre(e.target.value)}>
                  <option value="Tous">Établissement: Tous</option>
                  <option value="Lycée Technique Fianarantsoa">Lycée Technique Fianarantsoa</option>
                  <option value="CFP Ambalavao">CFP Ambalavao</option>
                </select>
              </div>

              {/* Tableau d'affichage avec les données UML */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>N° IM (Matricule)</th>
                      <th>Nom & Prénoms</th>
                      <th>Date & Lieu Naissance</th>
                      <th>Examen & Session</th>
                      <th>Établissement & Filière</th>
                      <th>Mention</th>
                      <th>Statut Demande</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apprenantsFiltres.length === 0 ? (
                      <tr><td colSpan="8" className="no-entries">Aucun apprenant inscrit ne correspond.</td></tr>
                    ) : (
                      apprenantsFiltres.map((item, index) => (
                        <tr key={item.id_apprenant}>
                          <td><strong>{item.im_apprenant}</strong></td>
                          <td>{item.nom_apprenant} {item.prenom_apprenant}</td>
                          <td>{item.date_naiss} à {item.lieu_naiss}</td>
                          <td><span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{item.examen_id}</span> ({item.session})</td>
                          <td>{item.etablissement_id} <br/><small style={{ color: '#666' }}>{item.filiere_id}</small></td>
                          <td><em style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{item.mention}</em></td>
                          <td>
                            {item.progression === 'DOSSIER_FINALISE' && <span className="status-badge valide">🎓 Diplôme Retiré</span>}
                            {item.progression === 'ATTESTATION_VALIDEE' && <span className="status-badge valide">📜 Attestation Validée</span>}
                            {item.progression === 'DIPLOME_EN_COURS' && <span className="status-badge en_attente">⏳ En traitement</span>}
                            {item.progression === 'AUCUNE_DEMANDE' && <span className="status-badge offline">❌ Aucune démarche</span>}
                          </td>
                          <td>
                            <div className="dropdown-action-container">
                              <button 
                                className="btn-three-dots"
                                onClick={() => setOpenMenuId(openMenuId === item.id_apprenant ? null : item.id_apprenant)}
                              >
                                ⋮
                              </button>

                              {openMenuId === item.id_apprenant && (
                                <div className={`dropdown-action-menu ${index === apprenantsFiltres.length - 1 ? 'open-upward' : ''}`}>
                                  <button className="dropdown-action-item" onClick={() => { setSelectedApprenant(item); setModalMode('details'); setOpenMenuId(null); }}>👁️ Details</button>
                                  <button className="dropdown-action-item" onClick={() => { setSelectedApprenant(item); setModalMode('modifier'); setOpenMenuId(null); }}>✏️ Modifier</button>
                                  <button className="dropdown-action-item" onClick={() => { transfererVersDemandes(item, 'ATTESTATION'); setOpenMenuId(null); }}>📜 Demande Attestation</button>
                                  <button className="dropdown-action-item" onClick={() => { transfererVersDemandes(item, 'DIPLOME'); setOpenMenuId(null); }}>🎓 Demande Diplôme</button>
                                  <button className="dropdown-action-item btn-item-delete" onClick={() => { supprimerApprenant(item.id_apprenant); setOpenMenuId(null); }}>🗑️ Supprimer</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

                    {/* CAS 3 : MODULE DE TRAITEMENT ET ÉVALUATION DES DEMANDES DE TITRES DYNAMIQUE */}
                    {/* CAS 3 : MODULE DE TRAITEMENT ET ÉVALUATION DES DEMANDES DE TITRES FILTRÉES */}
          {activeMenu === 'liste_demandes' && (
            <div>
              <div className="section-title">Évaluation en temps réel des demandes de titres</div>             
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Matrice</th>
                      <th>Nom</th>
                      <th>Document</th>
                      <th>Centre</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 🚀 CORRECTION : Utilisation de demandesFiltrees à la place de demandes */}
                    {demandesFiltrees.length === 0 ? (
                      <tr><td colSpan="7" className="no-entries">Aucune demande de titre ne correspond aux critères.</td></tr>
                    ) : (
                      demandesFiltrees.map((dem, index) => {
                        // 🔒 Extraction sécurisée avec valeur de secours pour éviter les plantages
                        const matriculeAffiche = dem.im_apprenant || dem.matricule || "N/A";
                        const nomAffiche = dem.nom_complet || dem.nom || "Candidat Anonyme";
                        const docAffiche = dem.type_document || dem.type || "NON SPÉCIFIÉ";
                        const centreAffiche = dem.centre_examen || dem.centre || "Bureau Central";
                        const dateAffiche = dem.date_depot || dem.date_demande || dem.date || "En cours";
                        const statutAffiche = dem.statut || "EN_ATTENTE";

                        return (
                          // Utilisation d'une clé d'index unique combinée pour garantir la stabilité de React
                          <tr key={dem.id_demande || dem.id || index}>
                            <td><strong>{matriculeAffiche}</strong></td>
                            <td>{nomAffiche}</td>
                            <td><span style={{ fontWeight: 600, color: '#002f6c' }}>{docAffiche}</span></td>
                            <td>{centreAffiche}</td>
                            <td>{dateAffiche}</td>
                            <td>
                              <span className={`status-badge ${statutAffiche === 'VALIDE' ? 'valide' : 'en-attente'}`} style={{
                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                                backgroundColor: statutAffiche === 'VALIDE' ? '#e6f4ea' : '#fef7e0',
                                color: statutAffiche === 'VALIDE' ? '#137333' : '#b06000'
                              }}>
                                {statutAffiche === 'VALIDE' ? 'Validé' : 'En attente'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-table-action"
                                style={{ padding: '4px 12px', cursor: 'pointer' }}
                                onClick={() => { setSelectedDemande(dem); setShowTraiteModal(true); }}
                              >
                                Traître
                              </button>
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



          {/* CAS 4 : VUE DE FLUX TEMPORAIRE */}
          {activeMenu === 'demandes_entrants' && (
            <div>
              <div className="section-title">Filtre des flux entrants</div>
              <p>Zone de traitement des nouvelles notifications...</p>
            </div>
          )}

                                       {/* CAS 5 : MODULE GESTION DES ÉTABLISSEMENTS AVEC CASES À COCHER */}
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
                      {/* ☑️ 1. Case de sélection globale (Tout cocher / Tout décocher) */}
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          className="table-checkbox"
                          checked={etablissements.length > 0 && selectedEtabIds.length === etablissements.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Tout cocher : on met tous les IDs dans l'état
                              setSelectedEtabIds(etablissements.map(emp => emp.id_centre));
                            } else {
                              // Tout décocher
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
                            
                            {/* ☑️ 2. Case de sélection individuelle sur chaque ligne */}
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox"
                                className="table-checkbox"
                                checked={isCoche}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // On ajoute l'ID à la liste des cochés
                                    setSelectedEtabIds([...selectedEtabIds, centre.id_centre]);
                                  } else {
                                    // On retire l'ID de la liste
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
                                                                      {/* 🗑️ BOUTON SUPPRIMER CONNECTÉ À L'API FASTAPI */}
                                  <button 
                                    className="dropdown-action-item btn-item-delete" 
                                    onClick={async () => { 
                                      if(window.confirm(`⚠️ ATTENTION : Voulez-vous supprimer définitivement l'établissement "${centre.nom_etablissement}" du répertoire officiel ?`)) {
                                        try {
                                          // Envoi de la requête de suppression au serveur FastAPI
                                          await API.delete(`/etablissements/supprimer/${centre.id_centre}`);
                                          
                                          alert(`🗑️ L'établissement "${centre.nom_etablissement}" a été supprimé avec succès de la base SQL !`);
                                          
                                          // Force le rafraîchissement instantané du tableau à l'écran
                                          await chargerEtablissements(); 
                                        } catch (err) {
                                          alert(err.response?.data?.detail || "Erreur lors de la suppression sur le serveur central.");
                                        }
                                      }
                                      setOpenEtabMenuId(null); // Ferme le menu à 3 points
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
              </div>{/* Fin de .data-table-container */}

              {/* 🔴 CODES À AJOUTER : LES DEUX BOUTONS DANS LES CADRES ROUGES EN BAS */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '1.5rem', alignItems: 'center' }}>
                
                               {/* 💬 BOUTON WHATSAPP AVEC URL PERSONNALISÉE FIXE */}
                <button
                  className="btn-action-top"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                  disabled={selectedEtabIds.length === 0}
                   onClick={() => {
                    const centresCoches = etablissements.filter(e => selectedEtabIds.includes(e.id_centre));
                    
                    centresCoches.forEach(centre => {
                      const numNettoye = centre.contact.replace(/\s+/g, '').replace('+', '').replace('(', '').replace(')', '').replace(/-/g, '');
                      
                      // 📝 Texte officiel contenant le sous-domaine fixé
                      const texteBrut = "Bonjour Monsieur le Chef de Centre,\n\nVoici votre lien d'accès sécurisé à distance pour enregistrer les notes :\nhttps://loca.lt\n\n⚠️ *CONSIGNE IMPORTANT AU PREMIER CLIC :*\nUne page bleue de sécurité va s'ouvrir. Descendez un peu, collez le code de sécurité suivant dans la case 'Endpoint IP' : [153.67.85.106] et cliquez sur 'Click to Continue' pour afficher votre formulaire.";
                      
                      const messageCode = encodeURIComponent(texteBrut);
                      window.open("https://wa.me/" + numNettoye + "?text=" + messageCode, "_blank");
                    });
                  }}
                >
                  💬 Envoyer le lien sur WhatsApp ({selectedEtabIds.length})
                </button>



                {/* Bouton E-mail */}
                <button
                  className="btn-action-top"
                  style={{ 
                    backgroundColor: '#002f6c', // Couleur officielle de ton application
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
                    
                    // Déclenche le gestionnaire d'e-mails par défaut (Outlook, Gmail, etc.)
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


        </div> {/* Fermeture de .content-body */}
      </div> {/* Fermeture de .main-content */}

                  {/* 🔲 CODE CORRIGÉ : Utilisation exclusive de showAddEtablissement pour séparer les deux fenêtres */}
            {/* 🔲 FENÊTRE MODALE MODIFIÉE POUR LA CRÉATION D'UN ÉTABLISSEMENT */}
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
                    
                    {/* Zone grise fixe non modifiable */}
                    <span style={{ padding: '0.65rem', color: '#5f6368', fontWeight: 'bold', borderRight: '1px solid #dadce0', fontSize: '0.95rem', userSelect: 'none' }}>
                      +261
                    </span>
                    
                    {/* Zone de saisie pour les 9 chiffres restants */}
                    <input 
                      type="text" 
                      placeholder="Ex: 345214587" 
                      maxLength={9} // Empêche de taper plus de 9 chiffres
                      value={contactEtab} 
                      onChange={(e) => setContactEtab(e.target.value.replace(/\D/g, ''))} // Autorise UNIQUEMENT les chiffres
                      style={{ border: 'none', padding: '0.65rem', flex: 1, outline: 'none', background: '#ffffff', fontSize: '0.95rem' }}
                      required 
                    />
                  </div>
                </div>

                {/* ✉️ NOUVEAU CHAMP : E-MAIL */}
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
            {/* 🔲 FENÊTRE MODALE DE MODIFICATION D'UN ÉTABLISSEMENT */}
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

                {/* Téléphone avec l'indicatif automatique masqué */}
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

      {/* 🔲 FENÊTRE MODALE : FICHE COMPLÈTE EN LECTURE SEULE (DETAILS) */}
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


      {/* 🔲 COMPOSANT FENÊTRE MODALE INTERACTIVE DES RENSEIGNEMENTS COMPLETS (UML DRETFP) */}
      {selectedApprenant && modalMode && (
        <div className="modal-overlay" onClick={() => { setSelectedApprenant(null); setModalMode(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            
            {/* En-tête de la fenêtre */}
            <div className="modal-header">
              <h2>{modalMode === 'details' ? '📄 Fiche d\'Information de l\'Apprenant' : '✏️ Modifier les Renseignements'}</h2>
              <button className="btn-close-modal" onClick={() => { setSelectedApprenant(null); setModalMode(''); }}>&times;</button>
            </div>

            {/* Formulaire contenant l'intégralité des données réelles DRETFP */}
            <div className="modal-body">
              <form className="modal-form-grid">
                <div className="modal-field">
                  <label>N° IM (Matricule)</label>
                  <input type="text" value={selectedApprenant.im_apprenant} readOnly />
                </div>
                <div className="modal-field">
                  <label>Nom de l'Apprenant</label>
                  <input type="text" defaultValue={selectedApprenant.nom_apprenant} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Prénoms</label>
                  <input type="text" defaultValue={selectedApprenant.prenom_apprenant} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Date de Naissance</label>
                  <input type="text" defaultValue={selectedApprenant.date_naiss} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Lieu de Naissance</label>
                  <input type="text" defaultValue={selectedApprenant.lieu_naiss} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Type d'Examen</label>
                  <input type="text" defaultValue={selectedApprenant.examen_id} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Session Examen (Année)</label>
                  <input type="number" defaultValue={selectedApprenant.session} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Mention obtenu</label>
                  <input type="text" defaultValue={selectedApprenant.mention} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                  <label>Établissement d'Origine</label>
                  <input type="text" defaultValue={selectedApprenant.etablissement_id} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Filière Technique</label>
                  <input type="text" defaultValue={selectedApprenant.filiere_id} readOnly={modalMode === 'details'} />
                </div>
                <div className="modal-field">
                  <label>Métier Spécifique</label>
                  <input type="text" defaultValue={selectedApprenant.metier_id} readOnly={modalMode === 'details'} />
                </div>
              </form>
            </div>

            {/* Pied de la fenêtre avec les boutons de contrôle */}
            <div className="modal-footer">
              <button className="btn-table-action" onClick={() => { setSelectedApprenant(null); setModalMode(''); }}>
                Fermer
              </button>
              {modalMode === 'modifier' && (
                <button 
                  className="btn-action-top" 
                  onClick={() => { alert("Modifications enregistrées localement !"); setSelectedApprenant(null); setModalMode(''); }}
                >
                  💾 Enregistrer
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🔲 MODALE DE PRISE DE DÉCISION POUR LE TRAITEMENT DES TITRES */}
      {showTraiteModal && selectedDemande && (
        <div className="modal-overlay" onClick={() => { setShowTraiteModal(false); setSelectedDemande(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header" style={{ backgroundColor: '#002f6c' }}>
              <h2>⚖️ Traitement de la Demande</h2>
              <button className="btn-close-modal" onClick={() => { setShowTraiteModal(false); setSelectedDemande(null); }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', margin: 0 }}>
                Voulez-vous valider officiellement l'impression du document suivant ?
              </p>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginTop: '1rem', textAlign: 'left', border: '1px dashed #dadce0' }}>
                📌 <strong>Candidat :</strong> {selectedDemande.nom_complet}<br/>
                🆔 <strong>Matricule :</strong> {selectedDemande.im_apprenant}<br/>
                🎓 <strong>Titre demandé :</strong> {selectedDemande.type_document}<br/>
                🏢 <strong>Établissement :</strong> {selectedDemande.centre_examen}
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn-table-action" onClick={() => { setShowTraiteModal(false); setSelectedDemande(null); }}>
                Annuler
              </button>
              <button className="btn-action-top" style={{ backgroundColor: '#137333' }} onClick={handleValiderLeDocument}>
                ✔️ Valider et Signer le Titre
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default DashboardAdmin;
