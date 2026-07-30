/**
 * IndexedDB Local Storage Service for Offline Calamity Resilience
 */
const DB_NAME = 'PanchayatConnectDB';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store 1: Emergency Alerts cache
      if (!db.objectStoreNames.contains('emergencyAlerts')) {
        const alertStore = db.createObjectStore('emergencyAlerts', { keyPath: '_id' });
        alertStore.createIndex('severity', 'severity', { unique: false });
        alertStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Store 2: Offline pre-booking queue when offline
      if (!db.objectStoreNames.contains('offlineBookingsQueue')) {
        db.createObjectStore('offlineBookingsQueue', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveAlertsOffline = async (alerts) => {
  const db = await initDB();
  const tx = db.transaction('emergencyAlerts', 'readwrite');
  const store = tx.objectStore('emergencyAlerts');

  alerts.forEach((alert) => {
    store.put(alert);
  });

  return tx.complete;
};

export const getCachedAlerts = async () => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('emergencyAlerts', 'readonly');
    const store = tx.objectStore('emergencyAlerts');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
  });
};

export const queueOfflineBooking = async (bookingData) => {
  const db = await initDB();
  const tx = db.transaction('offlineBookingsQueue', 'readwrite');
  const store = tx.objectStore('offlineBookingsQueue');
  store.add({ ...bookingData, timestamp: new Date().toISOString() });
};
