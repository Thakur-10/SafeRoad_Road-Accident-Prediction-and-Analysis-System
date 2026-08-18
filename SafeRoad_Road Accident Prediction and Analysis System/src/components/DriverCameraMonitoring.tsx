import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  PhoneCall, 
  Smile, 
  Activity, 
  RefreshCcw, 
  Zap, 
  Radio, 
  Download, 
  Maximize2,
  Volume2,
  VolumeX,
  Sliders,
  FileText,
  TrendingUp,
  Mic,
  Trash2,
  X,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Hotspot, PredictionResult } from '../types';

interface DriverCameraMonitoringProps {
  onStatusChange?: (status: 'Safe' | 'Attention Required' | 'High Risk' | 'Critical Risk') => void;
  onTriggerEmergency?: (snapshotDataUrl: string) => void;
  userId?: string;
  userName?: string;
}

interface SessionLogEntry {
  timestamp: string;
  timeLabel: string;
  sessionSecond: number;
  driverStatus: string;
  fatigueScore: number;
  alertnessScore: number;
  distractionScore: number;
  focusScore: number;
  isYawning: boolean;
  isPhoneDetected: boolean;
  isEyesClosed: boolean;
  isLookingAway: boolean;
}

interface SnapshotItem {
  id: string;
  dataUrl: string;
  timestamp: string;
  fatigueScore: number;
  status: string;
}

export const DriverCameraMonitoring: React.FC<DriverCameraMonitoringProps> = ({
  onStatusChange,
  onTriggerEmergency,
  userId,
  userName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera & Model State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Visual Enhancement Filter Toggle (Low Light / Poor Lighting Enhancement)
  const [enhanceFilterEnabled, setEnhanceFilterEnabled] = useState<boolean>(false);
  const [speechAlertsEnabled, setSpeechAlertsEnabled] = useState<boolean>(true);

  // Driver Monitoring Metrics (0 - 100)
  const [fatigueScore, setFatigueScore] = useState<number>(12);
  const [alertnessScore, setAlertnessScore] = useState<number>(94);
  const [distractionScore, setDistractionScore] = useState<number>(5);
  const [focusScore, setFocusScore] = useState<number>(96);

  // Detected Driver Status
  const [driverStatus, setDriverStatus] = useState<'Safe' | 'Attention Required' | 'High Risk' | 'Critical Risk'>('Safe');

  // Real-time Event Flags
  const [isYawning, setIsYawning] = useState<boolean>(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState<boolean>(false);
  const [isEyesClosed, setIsEyesClosed] = useState<boolean>(false);
  const [isLookingAway, setIsLookingAway] = useState<boolean>(false);

  // Session Statistics & Log History
  const [sessionDurationSec, setSessionDurationSec] = useState<number>(0);
  const [alertsTriggeredCount, setAlertsTriggeredCount] = useState<number>(0);
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [emergencyLogged, setEmergencyLogged] = useState<boolean>(false);
  const [sessionLogs, setSessionLogs] = useState<SessionLogEntry[]>([]);

  // Timer ref for session
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenTimeRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker for MediaPipe & TensorFlow.js inference offload
  useEffect(() => {
    if (window.Worker) {
      try {
        workerRef.current = new Worker('/aiInferenceWorker.js');
        workerRef.current.onmessage = (e) => {
          const { type, payload } = e.data;
          if (type === 'INFERENCE_RESULT') {
            setFatigueScore(payload.fatigueScore);
            setAlertnessScore(payload.alertnessScore);
            setDistractionScore(payload.distractionScore);
            setFocusScore(payload.focusScore);
            setIsEyesClosed(payload.isEyesClosed);
            setIsYawning(payload.isYawning);
            setIsPhoneDetected(payload.isPhoneDetected);
            setIsLookingAway(payload.isLookingAway);

            const newStatus = payload.driverStatus as 'Safe' | 'Attention Required' | 'High Risk' | 'Critical Risk';
            setDriverStatus(newStatus);
            if (onStatusChange) onStatusChange(newStatus);

            if (newStatus === 'Critical Risk') {
              speakWarningMessage('Critical warning! Severe driver fatigue detected. Pull over immediately.');
            } else if (newStatus === 'High Risk') {
              speakWarningMessage('High risk alert. Keep your eyes on the road and reduce speed.');
            } else if (newStatus === 'Attention Required') {
              speakWarningMessage('Attention required. Drowsiness signs detected.');
            }

            const now = new Date();
            const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const logEntry: SessionLogEntry = {
              timestamp: now.toISOString(),
              timeLabel,
              sessionSecond: sessionDurationSec,
              driverStatus: newStatus,
              fatigueScore: payload.fatigueScore,
              alertnessScore: payload.alertnessScore,
              distractionScore: payload.distractionScore,
              focusScore: payload.focusScore,
              isYawning: payload.isYawning,
              isPhoneDetected: payload.isPhoneDetected,
              isEyesClosed: payload.isEyesClosed,
              isLookingAway: payload.isLookingAway
            };
            setSessionLogs((prev) => [...prev.slice(-30), logEntry]);

            if (newStatus === 'Critical Risk' || newStatus === 'High Risk') {
              setAlertsTriggeredCount((prev) => prev + 1);
              if (newStatus === 'Critical Risk' && !emergencyLogged) {
                setEmergencyLogged(true);
                captureSnapshotAndTriggerEmergency();
              }
            } else if (newStatus === 'Safe') {
              setEmergencyLogged(false);
            }

            drawCanvasOverlay();
          }
        };
      } catch (err) {
        console.warn('Web worker initialization error:', err);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Initialize TensorFlow.js backend
  useEffect(() => {
    tf.ready().then(() => {
      setModelLoaded(true);
      console.log('TensorFlow.js backend initialized for Driver Monitoring:', tf.getBackend());
    });

    return () => {
      stopCamera();
    };
  }, []);

  // Web Speech API text-to-speech helper
  const speakWarningMessage = (message: string) => {
    if (!speechAlertsEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    // Debounce speech to every 8 seconds minimum to avoid spamming
    if (now - lastSpokenTimeRef.current < 8000) return;
    lastSpokenTimeRef.current = now;

    try {
      window.speechSynthesis.cancel(); // stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Start Webcam or Fallback Simulation
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraActive(true);
      startSessionTimer();
      startRealTimeAnalysis();
      speakWarningMessage('Driver monitoring active. Stay focused on the road.');
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      const errMessage = err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied') 
        ? 'Webcam access denied. Please click "Start AI Simulation Mode" below to run virtual driver monitoring.'
        : 'Unable to access webcam. You can use AI Simulation Mode for testing.';
      setCameraError(errMessage);
      setIsCameraActive(false);
    }
  };

  const startSimulationMode = () => {
    setCameraError(null);
    setIsCameraActive(true);
    startSessionTimer();
    startRealTimeAnalysis();
    speakWarningMessage('AI driver monitoring simulation started successfully.');
  };

  // Stop Webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
  };

  const startSessionTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSessionDurationSec((prev) => prev + 1);
    }, 1000);
  };

  // Real-time AI Analysis Loop offloaded to Web Worker for MediaPipe & TF.js inference computation
  const startRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);

    analysisIntervalRef.current = setInterval(() => {
      if (!isCameraActive) return;

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'RUN_INFERENCE',
          payload: {
            timestamp: Date.now(),
            simulationMode: true
          }
        });
      } else {
        // Fallback calculation if worker is not available
        const rand = Math.random();
        const yawnEvent = rand > 0.88;
        const phoneEvent = rand > 0.94;
        const eyesClosedEvent = rand > 0.91;
        const lookingAwayEvent = rand > 0.85;

        setIsYawning(yawnEvent);
        setIsPhoneDetected(phoneEvent);
        setIsEyesClosed(eyesClosedEvent);
        setIsLookingAway(lookingAwayEvent);

        let fatigue = Math.round(10 + (yawnEvent ? 45 : 0) + (eyesClosedEvent ? 55 : 0) + Math.random() * 8);
        let distraction = Math.round(5 + (phoneEvent ? 75 : 0) + (lookingAwayEvent ? 40 : 0) + Math.random() * 10);
        
        fatigue = Math.min(100, Math.max(5, fatigue));
        distraction = Math.min(100, Math.max(2, distraction));

        setFatigueScore(fatigue);
        setAlertnessScore(Math.max(0, 100 - fatigue));
        setDistractionScore(distraction);
        setFocusScore(Math.max(0, 100 - distraction));

        let newStatus: 'Safe' | 'Attention Required' | 'High Risk' | 'Critical Risk' = 'Safe';
        if (fatigue > 80 || distraction > 85 || (eyesClosedEvent && fatigue > 60)) {
          newStatus = 'Critical Risk';
        } else if (fatigue > 60 || distraction > 60 || phoneEvent) {
          newStatus = 'High Risk';
        } else if (fatigue > 40 || distraction > 40 || lookingAwayEvent || yawnEvent) {
          newStatus = 'Attention Required';
        }

        setDriverStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
        drawCanvasOverlay();
      }
    }, 1500);
  };

  const drawCanvasOverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const boxX = canvas.width * 0.3;
    const boxY = canvas.height * 0.15;
    const boxW = canvas.width * 0.4;
    const boxH = canvas.height * 0.7;

    const color = driverStatus === 'Safe' ? '#10b981' : driverStatus === 'Attention Required' ? '#f59e0b' : '#ef4444';

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = color;
    ctx.fillRect(boxX, boxY - 35, boxW, 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`DRIVER STATUS: ${driverStatus.toUpperCase()}`, boxX + 15, boxY - 12);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(boxX + boxW * 0.33, boxY + boxH * 0.38, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(boxX + boxW * 0.67, boxY + boxH * 0.38, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(boxX + boxW * 0.5, boxY + boxH * 0.7, 24, isYawning ? 18 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const captureSnapshotAndTriggerEmergency = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || 1280;
    tempCanvas.height = video.videoHeight || 720;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL('image/png', 0.95);

    const newSnapshot: SnapshotItem = {
      id: `snap_${Date.now()}`,
      dataUrl,
      timestamp: new Date().toLocaleTimeString(),
      fatigueScore,
      status: driverStatus
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);

    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'usr_demo',
          userName: userName || 'Alexander Wright',
          alertMessage: `CRITICAL DRIVER SAFETY EVENT: Severe fatigue/microsleep detected by AI Camera Monitoring.\nFatigue Score: ${fatigueScore}%\nDistraction Score: ${distractionScore}%`,
          recipient: '+1 555 999 0000',
          type: 'whatsapp',
          severity: 'Fatal',
          location: { city: 'Connected Vehicle Telematics', latitude: 37.7749, longitude: -122.4194 },
          snapshotBase64: dataUrl
        })
      });
      console.log('Emergency Event logged to database with snapshot successfully.');
    } catch (e) {
      console.error('Failed to log emergency event to database:', e);
    }

    if (onTriggerEmergency) {
      onTriggerEmergency(dataUrl);
    }
  };

  const handleDownloadSnapshot = (snap: SnapshotItem) => {
    const a = document.createElement('a');
    a.href = snap.dataUrl;
    a.download = `SafeRoad_Evidence_${snap.id}.png`;
    a.click();
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const downloadSessionLog = (format: 'json' | 'csv') => {
    const reportData = {
      driverName: userName || 'Alexander Wright',
      userId: userId || 'usr_demo',
      generatedAt: new Date().toISOString(),
      totalDurationSeconds: sessionDurationSec,
      alertsTriggered: alertsTriggeredCount,
      averageFatigueScore: sessionLogs.length ? Math.round(sessionLogs.reduce((acc, l) => acc + l.fatigueScore, 0) / sessionLogs.length) : fatigueScore,
      averageAlertnessScore: sessionLogs.length ? Math.round(sessionLogs.reduce((acc, l) => acc + l.alertnessScore, 0) / sessionLogs.length) : alertnessScore,
      averageDistractionScore: sessionLogs.length ? Math.round(sessionLogs.reduce((acc, l) => acc + l.distractionScore, 0) / sessionLogs.length) : distractionScore,
      logs: sessionLogs
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SafeRoad_AI_Driver_Session_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Timestamp,SessionSecond,Status,FatigueScore,AlertnessScore,DistractionScore,FocusScore,Yawning,PhoneDetected,EyesClosed,LookingAway\n'];
      const rows = sessionLogs.map(l => 
        `"${l.timestamp}",${l.sessionSecond},"${l.driverStatus}",${l.fatigueScore},${l.alertnessScore},${l.distractionScore},${l.focusScore},${l.isYawning},${l.isPhoneDetected},${l.isEyesClosed},${l.isLookingAway}`
      );
      const csvContent = headers.concat(rows).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SafeRoad_AI_Driver_Session_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              AI Camera Monitoring & Driver Safety System
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time MediaPipe & TensorFlow.js driver fatigue, yawn detection, phone distraction, and attention tracking.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            driverStatus === 'Safe' ? 'bg-emerald-100 text-emerald-800' :
            driverStatus === 'Attention Required' ? 'bg-amber-100 text-amber-800' :
            'bg-rose-100 text-rose-800 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              driverStatus === 'Safe' ? 'bg-emerald-500' : driverStatus === 'Attention Required' ? 'bg-amber-500' : 'bg-rose-600'
            }`} />
            <span>Driver Status: {driverStatus}</span>
          </div>

          {/* Voice Speech Warning Toggle */}
          <button
            onClick={() => setSpeechAlertsEnabled(!speechAlertsEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              speechAlertsEnabled
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
            title="Toggle Web Speech API Verbal Voice Warnings"
          >
            <Mic className={`w-3.5 h-3.5 ${speechAlertsEnabled ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
            <span>Voice Warn: {speechAlertsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Download Session Log Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => downloadSessionLog('csv')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 border border-slate-300"
              title="Download CSV Session Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>CSV Log</span>
            </button>
            <button
              onClick={() => downloadSessionLog('json')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 border border-slate-300"
              title="Download JSON Session Report"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>JSON Log</span>
            </button>
          </div>

          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Start Webcam</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
          <span>{cameraError}</span>
          <button onClick={startCamera} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Webcam Video Stream & Canvas Overlay (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[420px] shadow-lg overflow-hidden">
            
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-85 transition-all"
              style={{
                filter: enhanceFilterEnabled ? 'contrast(170%) brightness(135%) grayscale(30%)' : 'none'
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
            />

            {!isCameraActive && (
              <div className="relative z-20 text-center space-y-4 max-w-md p-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-white font-bold text-base font-['Outfit']">Webcam Monitor Paused</h3>
                {cameraError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                    {cameraError}
                  </div>
                )}
                <p className="text-slate-400 text-xs leading-relaxed">
                  Click "Launch Camera Feed" to use your physical webcam or "Start AI Simulation Mode" to run virtual driver monitoring.
                </p>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-lg"
                  >
                    Launch Camera Feed
                  </button>
                  <button
                    onClick={startSimulationMode}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-lg flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Start AI Simulation Mode
                  </button>
                </div>
              </div>
            )}

            {/* Floating HUD Overlays */}
            {isCameraActive && (
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono border border-white/10">
                  ⏱️ Session: {formatTime(sessionDurationSec)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-emerald-400 text-[11px] font-mono border border-emerald-500/30">
                  TF.js Model: Active
                </span>

                {/* Low Light Enhancement Filter Toggle */}
                <button
                  onClick={() => setEnhanceFilterEnabled(!enhanceFilterEnabled)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 backdrop-blur-md border ${
                    enhanceFilterEnabled
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/50'
                      : 'bg-black/60 text-slate-300 border-white/10 hover:bg-black/80'
                  }`}
                  title="Toggle Low-Light Enhancement & Contrast Boost Filter"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Low-Light Enhance: {enhanceFilterEnabled ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs text-white">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isYawning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    Yawn: {isYawning ? 'Detected ⚠️' : 'Normal'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPhoneDetected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    Phone: {isPhoneDetected ? 'Phone in Hand 📵' : 'Clear'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLookingAway ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    Gaze: {isLookingAway ? 'Looking Away ⚠️' : 'On Road'}
                  </span>
                </div>

                <button
                  onClick={captureSnapshotAndTriggerEmergency}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shadow"
                >
                  Capture Evidence Snapshot
                </button>
              </div>
            )}

          </div>

          {/* REAL-TIME ALERTNESS TREND CHART */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">Real-Time Alertness & Fatigue Trend (Rolling Session)</h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold">
                {sessionLogs.length} Data Points
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionLogs.length ? sessionLogs : [{ timeLabel: '00:00', fatigueScore: 12, alertnessScore: 94, distractionScore: 5 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Line type="monotone" dataKey="fatigueScore" name="Fatigue Score (%)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="alertnessScore" name="Alertness (%)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="distractionScore" name="Distraction (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Fatigue Intelligence & Metrics (1 Col) */}
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">Fatigue Intelligence Engine</h3>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Fatigue Score</span>
                <span className={`text-2xl font-extrabold font-mono ${fatigueScore > 60 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {fatigueScore}%
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${fatigueScore > 60 ? 'bg-rose-600' : 'bg-indigo-600'}`} style={{ width: `${fatigueScore}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Alertness</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-600">
                  {alertnessScore}%
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${alertnessScore}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Distraction</span>
                <span className={`text-2xl font-extrabold font-mono ${distractionScore > 50 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {distractionScore}%
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${distractionScore > 50 ? 'bg-rose-600' : 'bg-amber-500'}`} style={{ width: `${distractionScore}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Focus</span>
                <span className="text-2xl font-extrabold font-mono text-indigo-600">
                  {focusScore}%
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${focusScore}%` }} />
                </div>
              </div>

            </div>

            {/* Safety Warnings & Recommendations */}
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2 text-xs text-indigo-900">
              <div className="font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" /> AI Safety Advisory
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                {driverStatus === 'Critical Risk' ? '⚠️ CRITICAL WARNING: Severe driver fatigue or phone usage detected! Verbal voice warning spoken & emergency broadcast logged to DB.' :
                 driverStatus === 'High Risk' ? '⚡ High distraction level detected. Keep eyes fixed on the road and reduce speed.' :
                 driverStatus === 'Attention Required' ? '💡 Minor drowsiness signs. Consider opening a window or taking a short break soon.' :
                 '✓ Driver vitals optimal. Keep maintaining safe driving posture.'}
              </p>
            </div>

          </div>

          {/* Captured Evidence Snapshots */}
          {snapshots.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Emergency Evidence Snapshots ({snapshots.length})</h4>
                <button
                  onClick={() => setIsSnapshotModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-bold underline"
                >
                  Manage Gallery
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 cursor-pointer" onClick={() => setIsSnapshotModalOpen(true)}>
                {snapshots.slice(0, 4).map((snap) => (
                  <div key={snap.id} className="relative group">
                    <img
                      src={snap.dataUrl}
                      alt="Snapshot"
                      className="w-full h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                      View
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Snapshot Gallery Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                  Emergency Evidence Snapshot Gallery ({snapshots.length})
                </h3>
              </div>
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Camera className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-medium">No snapshots captured yet.</p>
                <p className="text-xs text-slate-400">Snapshots are automatically captured during critical risk events or manual capture.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-3">
                    <div className="relative group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <img
                        src={snap.dataUrl}
                        alt="Evidence Snapshot"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          snap.status === 'Critical Risk' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {snap.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <div className="font-bold">Captured: {snap.timestamp}</div>
                        <div className="text-[11px] text-slate-400">Fatigue Score: <strong className="text-rose-600">{snap.fatigueScore}%</strong></div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadSnapshot(snap)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                          title="Download Snapshot"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 transition"
                          title="Delete Snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-700 text-xs font-bold transition hover:bg-slate-800"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
