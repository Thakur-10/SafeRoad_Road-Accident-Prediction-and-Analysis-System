import React from 'react';
import { PredictionResult } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Share2, 
  Info, 
  Gauge, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  MapPin,
  Car
} from 'lucide-react';

interface ResultsDashboardProps {
  prediction: PredictionResult;
  onBackToPredict: () => void;
  onOpenEmergencyAlert: (prediction: PredictionResult) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  prediction,
  onBackToPredict,
  onOpenEmergencyAlert
}) => {
  const { severity, riskLevel, riskScore, confidenceScore, probabilities, keyFactors, recommendations, input, aiInsight } = prediction;

  // Severity color mapping
  const severityBadgeClass = 
    severity === 'Fatal'
      ? 'bg-rose-100 border-rose-300 text-rose-800'
      : severity === 'Severe'
      ? 'bg-amber-100 border-amber-300 text-amber-800'
      : 'bg-emerald-100 border-emerald-300 text-emerald-800';

  const severityBannerContainer =
    severity === 'Fatal'
      ? 'bg-rose-50/80 border-rose-200'
      : severity === 'Severe'
      ? 'bg-amber-50/80 border-amber-200'
      : 'bg-emerald-50/80 border-emerald-200';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBackToPredict}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Prediction Test</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenEmergencyAlert(prediction)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-100 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Emergency Risk Alert</span>
          </button>
        </div>
      </div>

      {/* --- SEVERITY BANNER & GAUGE CHART --- */}
      <div className={`border rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-6 shadow-sm ${severityBannerContainer}`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Main Severity Indicator */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5 ${severityBadgeClass}`}>
                <ShieldAlert className="w-4 h-4" /> {severity} Severity
              </span>
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Risk Classification: <strong className="text-slate-900">{riskLevel} Risk</strong>
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit']">
                {severity === 'Fatal'
                  ? 'High Crash Severity Potential Detected'
                  : severity === 'Severe'
                  ? 'Moderate Accident Severity Risk'
                  : 'Low Collision Severity Potential'}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Machine learning ensemble evaluates trip conditions with a confidence score of{' '}
                <strong className="text-indigo-600 font-bold">{confidenceScore}%</strong>.
              </p>
            </div>

            {/* Probability Distribution Bars */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-600 text-[11px]">
                <span>Slight: {(probabilities.slight * 100).toFixed(1)}%</span>
                <span>Severe: {(probabilities.severe * 100).toFixed(1)}%</span>
                <span>Fatal: {(probabilities.fatal * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white border border-slate-200 flex overflow-hidden p-0.5 shadow-inner">
                <div style={{ width: `${probabilities.slight * 100}%` }} className="bg-emerald-500 h-full rounded-l-full" title="Slight Probability" />
                <div style={{ width: `${probabilities.severe * 100}%` }} className="bg-amber-500 h-full" title="Severe Probability" />
                <div style={{ width: `${probabilities.fatal * 100}%` }} className="bg-rose-500 h-full rounded-r-full" title="Fatal Probability" />
              </div>
            </div>
          </div>

          {/* SVG Risk Gauge Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Accident Risk Index</span>
            
            {/* Speedometer Gauge Visual */}
            <div className="relative w-40 h-24 flex items-end justify-center overflow-hidden">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke={riskScore >= 65 ? '#e11d48' : riskScore >= 40 ? '#d97706' : '#059669'}
                  strokeWidth="12"
                  strokeDasharray={376}
                  strokeDashoffset={376 - (376 * (riskScore / 100) * 0.5)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute bottom-2 text-center">
                <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{riskScore}</span>
                <span className="text-xs text-slate-400 font-bold"> / 100</span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
              {riskScore >= 65 ? '🔴 HIGH RISK ZONE' : riskScore >= 40 ? '🟠 MODERATE RISK' : '🟢 SAFE RISK LEVEL'}
            </div>
          </div>

        </div>

        {/* TRIP SUMMARY IMPACT METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 text-[10px] block">Location</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{input.location.city}, {input.location.region}</span>
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 text-[10px] block">Vehicle Impact</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{input.vehicleType}</span>
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 text-[10px] block">Speed & Geometry</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Gauge className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{input.speedLimit} km/h • {input.roadType}</span>
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 text-[10px] block">Weather & Lighting</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{input.weatherCondition} • {input.isNight ? 'Night' : 'Day'}</span>
            </span>
          </div>
        </div>

      </div>

      {/* --- KEY RISK FACTORS & RECOMMENDATION ENGINE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Factors Affecting Prediction */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Primary Risk Factors Breakdown</h3>
          </div>

          <div className="space-y-3">
            {keyFactors.map((factor, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{factor.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    factor.impact === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {factor.impact} Impact ({factor.contributionPct}%)
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Recommendation Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Intelligent Recommendation Engine</h3>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-slate-700 font-medium leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- SAFEROAD SAFETY COPILOT INSIGHT --- */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-indigo-200/80 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base font-['Outfit']">SafeRoad Safety Copilot Insights</h3>
        </div>

        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line font-sans">
          {aiInsight || 'AI Copilot evaluated journey risk based on vehicle kinetic energy and weather visibility parameters.'}
        </p>
      </div>

    </div>
  );
};
