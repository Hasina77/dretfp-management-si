import axios from 'axios';

const API = axios.create({
  baseURL: 'https://purplish-smother-germicide.ngrok-free.dev/api',  
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dretfp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  async (response) => {
    const method = response.config.method?.toUpperCase();
    const url = response.config.url || '';

    if (['POST', 'PUT', 'DELETE'].includes(method) && !url.includes('/historique/ajouter')) {
      
      let actionLibelle = "Opération système";
      let detailsAction = `Route exécutée : ${method} ${url}`;

      if (url.includes('/auth/login')) {
        actionLibelle = "Connexion au système";
        detailsAction = "Authentification réussie sur le portail";
      } else if (url.includes('/auth/register')) {
        actionLibelle = "Création de compte";
        detailsAction = "Initialisation d'un nouvel accès utilisateur";
      } else if (url.includes('/apprenants/import-bulk')) {
        actionLibelle = "Transmission de liste terrain";
        detailsAction = "Envoi groupé de fiches candidats vers la DRETFP";
      } else if (url.includes('/demandes')) {
        actionLibelle = method === 'POST' ? "Nouvelle demande en ligne" : "Traitement / Validation de demande";
        detailsAction = "Mise à jour du registre des demandes de diplômes";
      } else if (url.includes('/examens/enregistrer-notes')) {
        actionLibelle = "Transmission de Procès-Verbal (PV)";
        detailsAction = "Enregistrement des notes d'examens";
      } else if (method === 'DELETE') {
        actionLibelle = "Suppression d'un enregistrement";
      } else if (method === 'PUT') {
        actionLibelle = "Modification d'une donnée";
      } else if (method === 'POST') {
        actionLibelle = "Ajout d'un nouvel élément";
      }

      const roleActuel = localStorage.getItem('user_role') || 'USAGER_PUBLIC';
      const centreId = localStorage.getItem('centre_affectation');
      const acteurNom = roleActuel === 'ADMIN_DRETFP' 
        ? 'Administration DRETFP' 
        : (centreId ? `Chef de Centre (ID: ${centreId})` : 'Demandeur / Visiteur');

      try {
        await axios.post(`${API.defaults.baseURL}/historique/ajouter`, {
          acteur: acteurNom,
          role_acteur: roleActuel,
          action_effectuee: actionLibelle,
          details: detailsAction
        }, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
      } catch (logErr) {
        console.warn("Journalisation silencieuse ignorée :", logErr);
      }
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;

