import React, { useEffect, useState } from 'react';
import { AnalyticsData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Activity, ShieldAlert, BarChart3, TrendingUp, AlertTriangle, Layers, PieChart as PieIcon } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const result: AnalyticsData = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-500 space-y-3">
        <Activity className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
        <p className="text-xs font-bold">Aggregating Predictive Accident Analytics...</p>
      </div>
    );
  }

  // Pie chart data
  const pieData = [
    { name: 'Fatal Severity', value: data.fatalCount || 1, color: '#e11d48' },
    { name: 'Severe Severity', value: data.severeCount || 1, color: '#d97706' },
    { name: 'Slight Severity', value: data.slightCount || 1, color: '#059669' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">Accident Predictive Analytics Dashboard</h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Executive statistical metrics, ML severity distributions, and multi-factor risk trends.
        </p>
      </div>

      {/* KPI STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
        
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 font-medium block text-[11px]">Total Predictions</span>
          <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">{data.totalPredictions}</div>
          <span className="text-[10px] text-indigo-600 font-bold mt-1 block">Inference Volume</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 font-medium block text-[11px]">High-Risk Inferences</span>
          <div className="text-2xl font-extrabold text-rose-600 font-['Outfit'] mt-1">{data.highRiskCount}</div>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">Requires Warning</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 font-medium block text-[11px]">Fatal Predictions</span>
          <div className="text-2xl font-extrabold text-rose-700 font-['Outfit'] mt-1">{data.fatalCount}</div>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">Highest Vulnerability</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 font-medium block text-[11px]">Severe Predictions</span>
          <div className="text-2xl font-extrabold text-amber-600 font-['Outfit'] mt-1">{data.severeCount}</div>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">Medium Vulnerability</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 font-medium block text-[11px]">Slight Predictions</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-['Outfit'] mt-1">{data.slightCount}</div>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">Low Risk Journey</span>
        </div>

      </div>

      {/* CHARTS GRID 1: PIE & VEHICLE BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Severity Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Accident Severity Proportion</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity by Vehicle Type Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Severity Breakdown by Vehicle Type</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.severityByVehicle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="vehicle" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Bar dataKey="slight" name="Slight" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="severe" name="Severe" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fatal" name="Fatal" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHARTS GRID 2: ROAD TYPE RISK & HOURLY TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Score by Road Geometry */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Average Risk Score by Road Geometry</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.riskByRoadType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="roadType" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Bar dataKey="avgRiskScore" name="Avg Risk Score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Risk Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Diurnal Hourly Accident Risk Curve</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyRiskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Line type="monotone" dataKey="avgRisk" name="Diurnal Risk Score" stroke="#9333ea" strokeWidth={3} dot={{ r: 5, fill: '#9333ea' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
