import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  CloudSun, 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Globe,
  Radio,
  BarChart,
  ShieldCheck,
  FileText,
  Lock
} from 'lucide-react';

interface LandingHeroProps {
  onStartPredict: () => void;
  onExploreMap: () => void;
  onViewAnalytics: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartPredict,
  onExploreMap,
  onViewAnalytics
}) => {
  return (
    <div className="space-y-20 pb-16">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
              <Zap className="w-4 h-4 text-indigo-600 animate-bounce" />
              <span>Next-Gen Road Safety & Accident Severity Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Outfit'] text-slate-900 leading-tight">
              Predict Road Accidents <br />
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Before They Happen
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
              SafeRoad leverages real-time GPS location intelligence, live meteorological data, vehicle physics, and ensemble Machine Learning to predict accident severity levels and generate immediate life-saving emergency alerts.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onStartPredict}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-md shadow-indigo-100 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Predict Journey Severity</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreMap}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-base shadow-sm transition flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>Explore Live Hotspot Map</span>
              </button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-['Outfit']">91.4%</div>
                <div className="text-xs text-slate-500 mt-1">ML Model Accuracy</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-['Outfit']">&lt; 1 Sec</div>
                <div className="text-xs text-slate-500 mt-1">Real-Time Risk Calc</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-['Outfit']">12,500+</div>
                <div className="text-xs text-slate-500 mt-1">Trained Accident Records</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-['Outfit']">24/7</div>
                <div className="text-xs text-slate-500 mt-1">Emergency Alert Sync</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Core Capabilities</h2>
          <p className="text-3xl font-extrabold text-slate-900 font-['Outfit']">Engineered for Maximum Precision & Safety</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Accident Severity Machine Learning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ensemble Random Forest & XGBoost decision trees classify potential accidents into Slight, Severe, or Fatal severity levels with confidence scoring.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Weather & Friction Sync</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automatically captures live temperature, precipitation, fog visibility, and humidity to evaluate road surface friction and hydroplaning probabilities.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">GPS Geolocation Auto-Detection</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              One-click Geolocation API reverse-geocodes exact latitude, Ansarul, longitude, city, and region, plotting user position directly onto spatial maps.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Risk Hotspot Mapping</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Interactive Leaflet maps highlight high-risk Red Zones, moderate Orange Zones, and safe Green Zones using historical accident density clustering.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Emergency Alert Dispatch</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Generates structured emergency risk broadcasts with live coordinates, severity ratings, and weather status for instant WhatsApp, SMS, and Email sharing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">SafeRoad Safety Advisory</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Server-side intelligence evaluates driver age, speed limits, and vehicle types to provide tailor-made defensive driving guidance and hazard warnings.
            </p>
          </div>

        </div>
      </section>

      {/* --- TECH STACK & PIPELINE SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                <Globe className="w-3.5 h-3.5" /> Technical Architecture
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
                Multi-Stage Machine Learning & Location Pipeline
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                The platform cleans raw input vectors, encodes categorical parameters (Vehicle Class, Road Geometry, Traffic Density), and executes decision tree splitting logic before augmenting results with SafeRoad Copilot context.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 text-sm">Feature Encoding & Label Scaling:</strong>
                    <p className="text-xs text-slate-500">Normalizes non-linear kinetic variables like vehicle speed squared delta and driver vulnerability ratios.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 text-sm">Zero-Latency Reverse Geocoding:</strong>
                    <p className="text-xs text-slate-500">Maps user lat/lng coordinates instantly to administrative city and regional boundaries.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 text-sm">Executive Analytics & CSV Export:</strong>
                    <p className="text-xs text-slate-500">Allows administrators to import raw accident datasets and export analytical reports.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onViewAnalytics}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
                >
                  <BarChart className="w-4 h-4 text-indigo-400" />
                  <span>View Executive Analytics Dashboard</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 space-y-4 text-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300">ML Training Pipeline Status</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">READY / OPTIMAL</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 mb-1">Step 1: Dataset & Feature Loader</div>
                  <div className="text-emerald-400">✓ Loaded 12,500 records [Ansar, Age, Vehicle, Speed, Weather, Road, Traffic]</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 mb-1">Step 2: Encoders & Label Transformers</div>
                  <div className="text-emerald-400">✓ Encoded categorical labels into model feature weights</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 mb-1">Step 3: Random Forest Ensemble Training</div>
                  <div className="text-amber-400">✓ Accuracy: 91.4% | F1-Score: 0.898 | Precision: 0.905</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 mb-1">Step 4: Real-time SafeRoad Copilot Agent</div>
                  <div className="text-emerald-400">✓ Active server-side advisor model ready</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 pt-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <span className="font-extrabold text-slate-900 text-base font-['Outfit']">SafeRoad</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Smart Road Accident Severity Prediction & Risk Analysis System built for advanced safety presentation standards.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><button onClick={onStartPredict} className="hover:text-indigo-600 transition">AI Risk Predictor</button></li>
              <li><button onClick={onExploreMap} className="hover:text-indigo-600 transition">Interactive Hotspot Map</button></li>
              <li><button onClick={onViewAnalytics} className="hover:text-indigo-600 transition">Analytics Dashboard</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">Documentation & Safety</h4>
            <ul className="space-y-2 flex flex-col">
              <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><FileText className="w-3.5 h-3.5" /> ML Methodology Paper</span>
              <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><ShieldCheck className="w-3.5 h-3.5" /> Emergency Protocols</span>
              <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><Lock className="w-3.5 h-3.5" /> Privacy & Data Governance</span>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">Project Details</h4>
            <p className="text-slate-500 leading-relaxed mb-2">
              Built with React 19, TypeScript, Express, Scikit/RF Decision Logic & Advanced Intelligence.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Version: 3.2.0-PROD
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <p>© 2026 SafeRoad System. All Rights Reserved.</p>
          <p className="font-semibold text-indigo-600">Developed by HARSHIT & DIXIT</p>
        </div>
      </footer>

    </div>
  );
};
