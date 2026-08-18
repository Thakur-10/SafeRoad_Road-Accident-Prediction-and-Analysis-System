import React, { useEffect, useState } from 'react';
import { User, PredictionResult, Hotspot } from '../types';
import { LayoutDashboard, Users, Database, FileSpreadsheet, Download, Trash2, Ban, CheckCircle2, Upload, FileText, Sparkles } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'predictions' | 'hotspots'>('users');

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<{ importedCount: number; errors: string[] } | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, hRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/predictions'),
        fetch('/api/hotspots')
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (pRes.ok) setPredictions(await pRes.json());
      if (hRes.ok) setHotspots(await hRes.json());
    } catch (e) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      }
    } catch (e) {
      alert('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (e) {
      alert('Failed to delete user.');
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    try {
      const res = await fetch('/api/hotspots/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText })
      });
      if (res.ok) {
        const result = await res.json();
        setImportResult(result);
        if (result.importedCount > 0) {
          const hRes = await fetch('/api/hotspots');
          if (hRes.ok) setHotspots(await hRes.json());
        }
      }
    } catch (e) {
      alert('CSV import failed.');
    }
  };

  const exportPredictionsCsv = () => {
    if (!predictions.length) return;
    const headers = 'ID,User,Severity,RiskScore,Confidence,City,Vehicle,SpeedLimit,RoadType,Timestamp\n';
    const rows = predictions.map((p) => 
      `"${p.id}","${p.userName || 'Anon'}","${p.severity}","${p.riskScore}","${p.confidenceScore}","${p.input.location.city}","${p.input.vehicleType}","${p.input.speedLimit}","${p.input.roadType}","${p.timestamp}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saferoad_predictions_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">SafeRoad Admin Operations</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            System administration, user access governance, historical prediction audits, and hotspot CSV dataset updates.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={exportPredictionsCsv}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Predictions CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`py-3 px-6 transition border-b-2 flex items-center gap-2 ${
            activeSubTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('predictions')}
          className={`py-3 px-6 transition border-b-2 flex items-center gap-2 ${
            activeSubTab === 'predictions' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Prediction History ({predictions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hotspots')}
          className={`py-3 px-6 transition border-b-2 flex items-center gap-2 ${
            activeSubTab === 'hotspots' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Manage Hotspot Datasets ({hotspots.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: USERS */}
      {activeSubTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-sm">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-900">
            Registered Platform Users
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 text-slate-500">{u.email}</td>
                    <td className="p-3.5 text-slate-500">{u.phone || 'N/A'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px]"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PREDICTIONS */}
      {activeSubTab === 'predictions' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-sm">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-900">
            Audit Predictions
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">ID / User</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Speed Limit</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{p.userName || 'Anonymous'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">{p.input.location.city}, {p.input.location.region}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.severity === 'Fatal' ? 'bg-rose-100 text-rose-800' :
                        p.severity === 'Severe' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.severity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{p.riskScore}/100</td>
                    <td className="p-3.5">{p.input.vehicleType}</td>
                    <td className="p-3.5">{p.input.speedLimit} km/h</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{new Date(p.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: HOTSPOTS CSV IMPORT & MANAGEMENT */}
      {activeSubTab === 'hotspots' && (
        <div className="space-y-6">
          
          {/* CSV Import Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Import Accident Hotspot CSV Dataset</h3>
            </div>

            <p className="text-xs text-slate-600">
              Format header: <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded">name, latitude, longitude, city, severity, riskScore, accidentCount, roadType, primaryCause, description</code>
            </p>

            <form onSubmit={handleCsvImport} className="space-y-3">
              <textarea
                rows={4}
                placeholder="Paste CSV text here e.g.:&#10;name,latitude,longitude,city,severity,riskScore,accidentCount,roadType,primaryCause,description&#10;Highway Junction 12,37.7833,-122.4167,San Francisco,Fatal,88,42,Highway,Heavy Fog & Fast Speed,High risk coastal zone"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow-sm"
              >
                Import CSV Hotspots
              </button>
            </form>

            {importResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-800">✓ Successfully imported {importResult.importedCount} hotspot records!</span>
                {importResult.errors.length > 0 && (
                  <div className="text-rose-600 text-[11px] font-mono">
                    {importResult.errors.map((err, i) => <div key={i}>• {err}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Hotspots List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-900">
              Current Hotspots Database ({hotspots.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Coordinates</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Collisions</th>
                    <th className="p-3.5">Road Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {hotspots.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5 font-bold text-slate-900">{h.name}</td>
                      <td className="p-3.5 font-mono text-slate-500">{h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</td>
                      <td className="p-3.5">{h.city}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.severity === 'Fatal' ? 'bg-rose-100 text-rose-800' :
                          h.severity === 'Severe' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {h.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{h.accidentCount}</td>
                      <td className="p-3.5">{h.roadType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
