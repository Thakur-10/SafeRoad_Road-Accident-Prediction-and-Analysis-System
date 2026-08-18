import React from 'react';
import { GeofenceAlertNotification, Hotspot } from '../types';
import { AlertTriangle, ShieldAlert, X, Radio, Volume2, VolumeX, Bell, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';

interface NotificationToastContainerProps {
  notifications: GeofenceAlertNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onInspectHotspot: (hotspot: Hotspot) => void;
  onOpenEmergencyAlert: (hotspot: Hotspot) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pushGranted: boolean;
  onRequestPush: () => void;
  isHistoryOpen: boolean;
  onCloseHistory: () => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  notifications,
  onDismiss,
  onClearAll,
  onInspectHotspot,
  onOpenEmergencyAlert,
  soundEnabled,
  onToggleSound,
  pushGranted,
  onRequestPush,
  isHistoryOpen,
  onCloseHistory
}) => {
  // Un-dismissed live toasts (e.g. latest 3 active ones)
  const activeToasts = notifications.slice(0, 3);

  return (
    <>
      {/* FLOATING TOAST OVERLAY (TOP-RIGHT) */}
      <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
        {activeToasts.map((toast) => {
          const hs = toast.hotspot;
          const isFatal = hs.severity === 'Fatal';
          const distanceText = toast.distanceKm < 0.5 
            ? 'Inside Zone (< 500m)' 
            : `${toast.distanceKm.toFixed(1)} km away`;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white/95 backdrop-blur-md border border-rose-200 rounded-2xl p-4 shadow-2xl ring-1 ring-rose-500/10 flex flex-col gap-3 animate-slide-in relative overflow-hidden transition-all hover:scale-[1.01]"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${isFatal ? 'bg-rose-600' : 'bg-amber-500'}`} />

              {/* Toast Header */}
              <div className="flex items-start justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl shrink-0 ${isFatal ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-xs text-slate-900 font-['Outfit']">
                        High-Risk Zone Entered!
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-800">
                        {hs.severity}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Navigation className="w-3 h-3 text-indigo-600 inline" /> {distanceText}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Toast Body */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{hs.name}</span>
                  <span className="font-mono text-rose-600">{hs.riskScore}/100 Risk</span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">
                  <strong>Risk Driver:</strong> {hs.primaryCause}
                </p>
              </div>

              {/* Toast Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5 text-xs font-bold">
                <button
                  onClick={() => {
                    onInspectHotspot(hs);
                    onDismiss(toast.id);
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Map</span>
                </button>

                <button
                  onClick={() => {
                    onOpenEmergencyAlert(hs);
                    onDismiss(toast.id);
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Radio className="w-3.5 h-3.5 animate-ping shrink-0" />
                  <span>Broadcast Alert</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* NOTIFICATION HISTORY MODAL / DRAWER */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Real-Time Geofence Alert Log</h3>
                  <p className="text-xs text-slate-500">Live proximity triggers for high-risk accident hotspots.</p>
                </div>
              </div>

              <button
                onClick={onCloseHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleSound}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition ${
                    soundEnabled 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Audio Chime: {soundEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={onRequestPush}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition ${
                    pushGranted 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Desktop Push: {pushGranted ? 'Granted' : 'Enable'}</span>
                </button>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-slate-500 hover:text-rose-600 font-semibold underline text-[11px]"
                >
                  Clear History ({notifications.length})
                </button>
              )}
            </div>

            {/* History List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No high-risk area entries recorded yet.</p>
                  <p className="text-[11px] text-slate-500">Go to the Live Map tab to simulate driving into a high-risk accident zone!</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 hover:bg-white hover:border-indigo-200 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          item.hotspot.severity === 'Fatal' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.hotspot.severity} ZONE
                        </span>
                        <span className="font-bold text-slate-900">{item.hotspot.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">
                      Triggered at <strong className="text-slate-800">{item.distanceKm.toFixed(2)} km</strong> proximity. Primary cause: {item.hotspot.primaryCause}.
                    </p>

                    <div className="flex justify-end gap-2 pt-1 font-bold">
                      <button
                        onClick={() => {
                          onInspectHotspot(item.hotspot);
                          onCloseHistory();
                        }}
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 transition text-[11px]"
                      >
                        Inspect Hotspot
                      </button>
                      <button
                        onClick={() => {
                          onOpenEmergencyAlert(item.hotspot);
                          onCloseHistory();
                        }}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition text-[11px]"
                      >
                        Broadcast Emergency Alert
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
