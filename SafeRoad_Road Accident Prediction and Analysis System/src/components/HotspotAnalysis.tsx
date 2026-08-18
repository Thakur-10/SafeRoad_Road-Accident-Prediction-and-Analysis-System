import React, { useState } from 'react';
import { Hotspot } from '../types';
import { Flame, AlertTriangle, ShieldCheck, Search, Filter, ArrowUpDown } from 'lucide-react';

interface HotspotAnalysisProps {
  hotspots: Hotspot[];
}

export const HotspotAnalysis: React.FC<HotspotAnalysisProps> = ({ hotspots }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'riskScore' | 'accidentCount'>('riskScore');

  const filtered = hotspots
    .filter((hs) => {
      if (filterSeverity !== 'All' && hs.severity !== filterSeverity) return false;
      if (search.trim() && !hs.name.toLowerCase().includes(search.toLowerCase()) && !hs.city.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const redZones = hotspots.filter((h) => h.severity === 'Fatal').length;
  const orangeZones = hotspots.filter((h) => h.severity === 'Severe').length;
  const greenZones = hotspots.filter((h) => h.severity === 'Slight').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">Accident Hotspot Analysis</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Historical collision density analytics, high-frequency accident zones, and road hazard classification.
          </p>
        </div>

        {/* Quick Zone Metrics */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>{redZones} Red Zones</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>{orangeZones} Orange Zones</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>{greenZones} Green Zones</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hotspot name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterSeverity('All')}
              className={`px-3 py-1.5 rounded-lg border transition font-semibold ${
                filterSeverity === 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity('Fatal')}
              className={`px-3 py-1.5 rounded-lg border transition font-semibold ${
                filterSeverity === 'Fatal' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 border-slate-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              Red Zones
            </button>
            <button
              onClick={() => setFilterSeverity('Severe')}
              className={`px-3 py-1.5 rounded-lg border transition font-semibold ${
                filterSeverity === 'Severe' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              Orange Zones
            </button>
            <button
              onClick={() => setFilterSeverity('Slight')}
              className={`px-3 py-1.5 rounded-lg border transition font-semibold ${
                filterSeverity === 'Slight' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Green Zones
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort By:</span>
          <button
            onClick={() => setSortBy(sortBy === 'riskScore' ? 'accidentCount' : 'riskScore')}
            className="font-bold text-indigo-600 hover:underline"
          >
            {sortBy === 'riskScore' ? 'Risk Score (High to Low)' : 'Accident Count (High to Low)'}
          </button>
        </div>
      </div>

      {/* Hotspots Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((hs) => {
          return (
            <div key={hs.id} className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 hover:border-indigo-300 transition shadow-sm">
              <div className="flex justify-between items-start">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                  hs.severity === 'Fatal' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                  hs.severity === 'Severe' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {hs.severity} Risk
                </span>
                <span className="text-indigo-600 font-extrabold text-sm font-mono">{hs.riskScore}/100</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">{hs.name}</h3>
                <p className="text-xs text-slate-500">{hs.city}, {hs.region}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Collisions</span>
                  <span className="font-extrabold text-rose-600 font-mono">{hs.accidentCount} Incidents</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Road Geometry</span>
                  <span className="font-bold text-slate-800">{hs.roadType}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <strong className="text-slate-400 text-[10px] block uppercase font-bold">Primary Risk Driver</strong>
                <p className="text-slate-700 font-medium">{hs.primaryCause}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
