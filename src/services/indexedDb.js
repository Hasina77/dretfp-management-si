const DB_NAME = 'DRETFP_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'exam_notes_queue';

// 1. Initialisation et ouverture de la base IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Création de la table locale si elle n'existe pas encore
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.objectStoreStoreNames = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject("Erreur d'ouverture d'IndexedDB : " + event.target.error);
  });
};

// 2. Sauvegarder une note localement en attendant la connexion
export const saveNoteOffline = async (noteData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // On ajoute un horodatage pour le suivi dans le mémoire
    const dataWithTimestamp = {
      ...noteData,
      timestamp: new Date().toISOString(),
      synced: false
    };

    const request = store.add(dataWithTimestamp);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject("Échec du stockage local : " + e.target.error);
  });
};

// 3. Récupérer toutes les notes stockées hors-ligne pour la synchronisation
export const getOfflineNotes = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject("Impossible de lire le stockage local : " + e.target.error);
  });
};

// 4. Vider la file d'attente locale après une synchronisation réussie sur le serveur Python
export const clearOfflineNotes = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject("Erreur lors du nettoyage local : " + e.target.error);
  });
};
