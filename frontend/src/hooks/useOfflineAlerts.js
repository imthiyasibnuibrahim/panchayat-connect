import { useState, useEffect } from 'react';
import { saveAlertsOffline, getCachedAlerts } from '../services/offlineStore';

export const useOfflineAlerts = (userCoords) => {
  const [alerts, setAlerts] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      if (navigator.onLine && userCoords?.lng && userCoords?.lat) {
        try {
          const res = await fetch(
            `/api/v1/alerts/active-at-location?lng=${userCoords.lng}&lat=${userCoords.lat}`
          );
          const data = await res.json();
          if (data.success) {
            setAlerts(data.data);
            // Save fresh emergency alerts to IndexedDB for offline resilience
            await saveAlertsOffline(data.data);
          }
        } catch (error) {
          console.warn('Network request failed. Falling back to local IndexedDB alerts.');
          const cached = await getCachedAlerts();
          setAlerts(cached);
        }
      } else {
        // Offline mode: load directly from IndexedDB
        console.log('Device is offline. Loading cached emergency alerts from IndexedDB...');
        const cached = await getCachedAlerts();
        setAlerts(cached);
      }
      setLoading(false);
    };

    fetchAlerts();
  }, [isOffline, userCoords?.lng, userCoords?.lat]);

  return { alerts, isOffline, loading };
};
