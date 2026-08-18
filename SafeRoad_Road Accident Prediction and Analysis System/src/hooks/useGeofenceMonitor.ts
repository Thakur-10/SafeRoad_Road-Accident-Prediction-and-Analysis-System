import { useState, useEffect, useRef, useCallback } from 'react';
import { Hotspot, GeofenceAlertNotification, LocationData } from '../types';
import { calculateDistanceKm, playWarningChime, requestPushPermission, sendNativePushNotification } from '../utils/geofence';

export function useGeofenceMonitor(hotspots: Hotspot[], initialLocation?: LocationData) {
  // Current user / driver coordinates
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLocation?.latitude || 37.7749,
    longitude: initialLocation?.longitude || -122.4194
  });

  // Settings
  const [geofenceRadiusKm, setGeofenceRadiusKm] = useState<number>(3.0); // 3 km default threshold
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pushGranted, setPushGranted] = useState<boolean>(false);
  const [isLiveGps, setIsLiveGps] = useState<boolean>(false);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState<boolean>(false);

  // Notifications history & active toasts
  const [notifications, setNotifications] = useState<GeofenceAlertNotification[]>([]);
  const [triggeredHotspotIds, setTriggeredHotspotIds] = useState<Set<string>>(new Set());

  // Watch position ID ref & interval ref
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check initial Push Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPushGranted(true);
    }
  }, []);

  // Request Desktop Push Permission
  const handleRequestPush = async () => {
    const permission = await requestPushPermission();
    setPushGranted(permission === 'granted');
  };

  // Check proximity whenever driverLocation or hotspots or geofenceRadiusKm changes
  const checkProximity = useCallback(
    (currentLat: number, currentLng: number) => {
      if (!hotspots || hotspots.length === 0) return;

      hotspots.forEach((hs) => {
        // Only trigger for High-Risk areas (Fatal, Severe, or riskScore >= 70)
        const isHighRisk = hs.severity === 'Fatal' || hs.severity === 'Severe' || hs.riskScore >= 70;
        if (!isHighRisk) return;

        const distanceKm = calculateDistanceKm(currentLat, currentLng, hs.latitude, hs.longitude);

        // Check if within geofence threshold
        if (distanceKm <= geofenceRadiusKm) {
          // Check if already notified for this hotspot recently
          if (!triggeredHotspotIds.has(hs.id)) {
            // Trigger new Alert!
            const newNotification: GeofenceAlertNotification = {
              id: `notif-${Date.now()}-${hs.id}`,
              hotspot: hs,
              distanceKm,
              timestamp: new Date().toISOString(),
              isRead: false
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setTriggeredHotspotIds((prev) => new Set(prev).add(hs.id));

            // Sound Chime
            if (soundEnabled) {
              playWarningChime();
            }

            // Desktop Push Notification
            if (pushGranted) {
              const bodyText = `Entered ${hs.severity} Risk Zone: ${hs.name} (${distanceKm.toFixed(1)} km away). Risk Score: ${hs.riskScore}/100. Primary Cause: ${hs.primaryCause}.`;
              sendNativePushNotification(`⚠️ High-Risk Accident Zone Alert!`, bodyText, hs.id);
            }
          }
        }
      });
    },
    [hotspots, geofenceRadiusKm, triggeredHotspotIds, soundEnabled, pushGranted]
  );

  // Monitor location changes
  useEffect(() => {
    checkProximity(driverLocation.latitude, driverLocation.longitude);
  }, [driverLocation, checkProximity]);

  // Toggle Live GPS Geolocation
  const toggleLiveGps = () => {
    if (isLiveGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveGps(false);
    } else {
      if (!('geolocation' in navigator)) {
        alert('Geolocation is not supported by your browser.');
        return;
      }

      setIsLiveGps(true);
      if (isSimulatingDrive) stopSimulatedDrive();

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.error('GPS Watch Error:', err);
          setIsLiveGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
  };

  // Move driver location manually (e.g. click on map or select preset)
  const setManualLocation = (lat: number, lng: number) => {
    if (isSimulatingDrive) stopSimulatedDrive();
    if (isLiveGps && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLiveGps(false);
    }
    setDriverLocation({ latitude: lat, longitude: lng });
  };

  // Simulate Drive Towards a High-Risk Hotspot
  const startSimulatedDrive = (targetHotspot: Hotspot) => {
    if (isSimulatingDrive) stopSimulatedDrive();
    if (isLiveGps && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLiveGps(false);
    }

    setIsSimulatingDrive(true);

    // Start from a point slightly away from the target hotspot
    const startLat = targetHotspot.latitude - 0.08; // ~8-9 km south
    const startLng = targetHotspot.longitude - 0.08; // ~8-9 km west
    const totalSteps = 25;
    let step = 0;

    setDriverLocation({ latitude: startLat, longitude: startLng });

    simIntervalRef.current = setInterval(() => {
      step++;
      const currentLat = startLat + ((targetHotspot.latitude - startLat) * step) / totalSteps;
      const currentLng = startLng + ((targetHotspot.longitude - startLng) * step) / totalSteps;

      setDriverLocation({ latitude: currentLat, longitude: currentLng });

      if (step >= totalSteps) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setIsSimulatingDrive(false);
      }
    }, 600); // Step every 600ms
  };

  const stopSimulatedDrive = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSimulatingDrive(false);
  };

  // Dismiss Toast
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear All
  const clearAllNotifications = () => {
    setNotifications([]);
    setTriggeredHotspotIds(new Set());
  };

  // Reset triggered hotspot memory so alerts can be re-tested
  const resetTriggeredGeofences = () => {
    setTriggeredHotspotIds(new Set());
  };

  return {
    driverLocation,
    setManualLocation,
    geofenceRadiusKm,
    setGeofenceRadiusKm,
    soundEnabled,
    toggleSound: () => setSoundEnabled((prev) => !prev),
    pushGranted,
    requestPush: handleRequestPush,
    isLiveGps,
    toggleLiveGps,
    isSimulatingDrive,
    startSimulatedDrive,
    stopSimulatedDrive,
    notifications,
    dismissNotification,
    clearAllNotifications,
    resetTriggeredGeofences
  };
}
