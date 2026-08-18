import React, { useEffect, useState } from 'react';
import { User, PredictionResult, Alert } from '../types';
import { User as UserIcon, ShieldAlert, History, Bell, Mail, Phone, Calendar, Key, CheckCircle2, Package } from 'lucide-react';
import { InventoryManagement } from './InventoryManagement';

interface UserProfileProps {
  user: User;
  onViewPrediction: (p: PredictionResult) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onViewPrediction }) => {
  const [userPredictions, setUserPredictions] = useState<PredictionResult[]>([]);
  const [userAlerts, setUserAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'inventory'>('profile');

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch(`/api/predictions?userId=${user.id}`),
        fetch(`/api/alerts?userId=${user.id}`)
      ]);

      if (pRes.ok) setUserPredictions(await pRes.json());
      if (aRes.ok) setUserAlerts(await aRes.json());
    } catch (e) {
      console.error('User profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold font-['Outfit'] shadow-md">
          {user.name.charAt(0)}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone || '+1 (555) 012-3456'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 dark:text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 space-y-1">
          <div>Member Since: <span className="text-slate-800 dark:text-slate-200 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></div>
          <div>Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user.status.toUpperCase()}</span></div>
        </div>
      </div>

      {/* Settings Section Navigation Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSettingsTab('profile')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            settingsTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Account Profile & History
        </button>
        <button
          onClick={() => setSettingsTab('inventory')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            settingsTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Package className="w-4 h-4" /> Inventory & Equipment Management
        </button>
      </div>

      {settingsTab === 'profile' ? (
        <div className="space-y-8 animate-fade-in">
          {/* Prediction History Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>My Prediction History ({userPredictions.length})</span>
            </div>

            {userPredictions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5">Severity</th>
                      <th className="p-3.5">Risk Score</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Vehicle</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {userPredictions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.severity === 'Fatal' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400' :
                            p.severity === 'Severe' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}>
                            {p.severity}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-indigo-600">{p.riskScore}/100</td>
                        <td className="p-3.5">{p.input.location.city}, {p.input.location.region}</td>
                        <td className="p-3.5">{p.input.vehicleType}</td>
                        <td className="p-3.5 text-slate-500 text-[11px]">{new Date(p.timestamp).toLocaleString()}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onViewPrediction(p)}
                            className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white font-bold transition text-[11px]"
                          >
                            View Results
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No prediction history recorded yet. Run a prediction test from the AI Predictor tab!
              </div>
            )}
          </div>

          {/* Emergency Alert Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-rose-600" />
              <span>My Emergency Risk Alert Logs ({userAlerts.length})</span>
            </div>

            {userAlerts.length > 0 ? (
              <div className="p-4 space-y-3">
                {userAlerts.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-rose-600 uppercase">Alert Channel: {a.type.toUpperCase()}</span>
                      <span className="text-slate-500 font-mono">{new Date(a.sentAt).toLocaleString()}</span>
                    </div>
                    <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px] whitespace-pre-wrap">{a.alertMessage}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No emergency alerts dispatched yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <InventoryManagement currentUser={user} />
        </div>
      )}

    </div>
  );
};
