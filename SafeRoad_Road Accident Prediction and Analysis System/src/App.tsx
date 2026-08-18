/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, PredictionResult, Hotspot, Alert } from './types';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { AuthModal } from './components/AuthModal';
import { PredictionForm } from './components/PredictionForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { HotspotAnalysis } from './components/HotspotAnalysis';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { DriverCameraMonitoring } from './components/DriverCameraMonitoring';
import { VoiceCommandAssistant } from './components/VoiceCommandAssistant';
import { useGeofenceMonitor } from './hooks/useGeofenceMonitor';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  
  // User Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Predictions & Emergency Alerts State
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [activeAlertPrediction, setActiveAlertPrediction] = useState<PredictionResult | undefined>(undefined);

  // Hotspots Data
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [inspectHotspot, setInspectHotspot] = useState<Hotspot | null>(null);

  // Notification History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Global Driver Monitoring Status
  const [globalDriverStatus, setGlobalDriverStatus] = useState<'Safe' | 'Attention Required' | 'High Risk' | 'Critical Risk'>('Safe');

  // Theme State with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('saferoad_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('saferoad_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Geofence Proximity Monitor Hook
  const geofence = useGeofenceMonitor(hotspots, currentPrediction?.input.location);

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem('saferoad_token');
    if (savedToken) {
      setToken(savedToken);
      fetch('/api/auth/me', { headers: { Authorization: savedToken } })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => localStorage.removeItem('saferoad_token'));
    }

    // Load hotspots data
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      const res = await fetch('/api/hotspots');
      if (res.ok) {
        const data = await res.json();
        setHotspots(data);
      }
    } catch (e) {
      console.error('Failed to fetch hotspots:', e);
    }
  };

  const handleAuthSuccess = (loggedUser: User, authToken: string) => {
    setUser(loggedUser);
    setToken(authToken);
    localStorage.setItem('saferoad_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('saferoad_token');
    if (activeTab === 'admin' || activeTab === 'profile') {
      setActiveTab('landing');
    }
  };

  const handlePredictionComplete = (result: PredictionResult) => {
    setCurrentPrediction(result);
    if (result.input.location) {
      geofence.setManualLocation(result.input.location.latitude, result.input.location.longitude);
    }
    setActiveTab('results');
  };

  const handleOpenEmergencyAlert = (pred?: PredictionResult) => {
    setActiveAlertPrediction(pred || currentPrediction || undefined);
    setIsAlertOpen(true);
  };

  const handleCameraEmergencyTrigger = (snapshotUrl: string) => {
    const dummyPred: PredictionResult = {
      id: `cam-emerg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'Fatal',
      riskLevel: 'High',
      riskScore: 92,
      confidenceScore: 95.0,
      probabilities: { slight: 5, severe: 25, fatal: 70 },
      keyFactors: [
        { name: 'Driver Fatigue / Microsleep', impact: 'High', contributionPct: 60, description: 'Critical eye closure detected by MediaPipe camera' },
        { name: 'Driver Distraction', impact: 'High', contributionPct: 40, description: 'Unattended gaze or phone usage detected' }
      ],
      recommendations: [
        'PULL OVER IMMEDIATELY in a safe zone',
        'Take a 20-minute restorative rest break',
        'Emergency broadcast dispatched to contacts'
      ],
      input: {
        age: 32,
        gender: 'Male',
        vehicleType: 'Car',
        speedLimit: 75,
        roadType: 'Highway',
        trafficDensity: 'Heavy',
        weatherCondition: 'Clear',
        visibilityKm: 10,
        isRaining: false,
        timeOfDay: '02:30',
        isNight: true,
        location: currentPrediction?.input.location || {
          latitude: 37.7749,
          longitude: -122.4194,
          city: 'San Francisco',
          region: 'California',
          country: 'USA'
        }
      }
    };
    setActiveAlertPrediction(dummyPred);
    setIsAlertOpen(true);
  };

  const handleOpenEmergencyAlertForHotspot = (hs: Hotspot) => {
    const dummyPred: PredictionResult = {
      id: `pred-hs-${hs.id}`,
      timestamp: new Date().toISOString(),
      severity: hs.severity,
      riskLevel: hs.severity === 'Fatal' ? 'High' : 'Medium',
      riskScore: hs.riskScore,
      confidenceScore: 92.5,
      probabilities: { slight: 10, severe: 30, fatal: 60 },
      keyFactors: [
        { name: 'High Incident Density', impact: 'High', contributionPct: 45, description: hs.primaryCause },
        { name: 'Road Geometry Hazard', impact: 'High', contributionPct: 35, description: `${hs.roadType} alignment risk` }
      ],
      recommendations: [
        `Reduce vehicle speed immediately in ${hs.name}`,
        'Maintain double safe stopping distance',
        'Enable high hazard lights if visibility is poor'
      ],
      input: {
        age: 30,
        gender: 'Male',
        vehicleType: 'Car',
        speedLimit: 60,
        roadType: 'Highway',
        trafficDensity: 'Heavy',
        weatherCondition: 'Clear',
        visibilityKm: 8,
        isRaining: false,
        timeOfDay: '14:00',
        isNight: false,
        location: {
          latitude: hs.latitude,
          longitude: hs.longitude,
          city: hs.city,
          region: hs.region,
          country: 'USA'
        }
      }
    };
    setActiveAlertPrediction(dummyPred);
    setIsAlertOpen(true);
  };

  const handleInspectHotspot = (hs: Hotspot) => {
    setInspectHotspot(hs);
    geofence.setManualLocation(hs.latitude, hs.longitude);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] relative transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        notificationCount={geofence.notifications.length}
        onOpenNotifications={() => setIsHistoryOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {activeTab === 'landing' && (
          <LandingHero
            onStartPredict={() => setActiveTab('predict')}
            onExploreMap={() => setActiveTab('map')}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'predict' && (
          <PredictionForm
            onPredictionComplete={handlePredictionComplete}
            userId={user?.id}
            userName={user?.name}
          />
        )}

        {activeTab === 'camera' && (
          <DriverCameraMonitoring
            onStatusChange={(status) => setGlobalDriverStatus(status)}
            onTriggerEmergency={handleCameraEmergencyTrigger}
          />
        )}

        {activeTab === 'results' && currentPrediction && (
          <ResultsDashboard
            prediction={currentPrediction}
            onBackToPredict={() => setActiveTab('predict')}
            onOpenEmergencyAlert={handleOpenEmergencyAlert}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMap
            hotspots={hotspots}
            userLocation={currentPrediction?.input.location}
            driverLocation={geofence.driverLocation}
            onSetManualLocation={geofence.setManualLocation}
            geofenceRadiusKm={geofence.geofenceRadiusKm}
            onSetGeofenceRadiusKm={geofence.setGeofenceRadiusKm}
            isLiveGps={geofence.isLiveGps}
            onToggleLiveGps={geofence.toggleLiveGps}
            isSimulatingDrive={geofence.isSimulatingDrive}
            onStartSimulatedDrive={geofence.startSimulatedDrive}
            onStopSimulatedDrive={geofence.stopSimulatedDrive}
            onResetGeofences={geofence.resetTriggeredGeofences}
            onInspectHotspotFromParent={inspectHotspot}
          />
        )}

        {activeTab === 'hotspots' && (
          <HotspotAnalysis hotspots={hotspots} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <AdminPanel />
        )}

        {activeTab === 'profile' && user && (
          <UserProfile
            user={user}
            onViewPrediction={(pred) => {
              setCurrentPrediction(pred);
              setActiveTab('results');
            }}
          />
        )}

      </main>

      {/* Real-Time Geofence Toast Notifications & History Drawer */}
      <NotificationToastContainer
        notifications={geofence.notifications}
        onDismiss={geofence.dismissNotification}
        onClearAll={geofence.clearAllNotifications}
        onInspectHotspot={handleInspectHotspot}
        onOpenEmergencyAlert={handleOpenEmergencyAlertForHotspot}
        soundEnabled={geofence.soundEnabled}
        onToggleSound={geofence.toggleSound}
        pushGranted={geofence.pushGranted}
        onRequestPush={geofence.requestPush}
        isHistoryOpen={isHistoryOpen}
        onCloseHistory={() => setIsHistoryOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        prediction={activeAlertPrediction}
        userId={user?.id}
        userName={user?.name}
      />

      {/* Hands-Free Voice Command Assistant */}
      <VoiceCommandAssistant
        setActiveTab={setActiveTab}
        onTriggerEmergency={() => {
          setActiveAlertPrediction(currentPrediction || undefined);
          setIsAlertOpen(true);
        }}
      />

    </div>
  );
}
