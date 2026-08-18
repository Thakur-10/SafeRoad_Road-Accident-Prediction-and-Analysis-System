import React from 'react';
import { User } from '../types';
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  BarChart3, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Sparkles,
  Flame,
  LayoutDashboard,
  Bell,
  Camera,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  notificationCount,
  onOpenNotifications,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 dark:shadow-none group-hover:bg-indigo-700 transition">
            <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                SafeRoad
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Accident Prediction System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'landing'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('predict')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'predict' || activeTab === 'results'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'camera'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-indigo-200" />
            <span>Camera AI</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Live Map</span>
          </button>

          <button
            onClick={() => setActiveTab('hotspots')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'hotspots'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Hotspots</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* User Status & Notifications & Theme Toggle & Auth Action */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 text-slate-700 dark:text-slate-200 transition"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Notification Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 text-slate-700 dark:text-slate-200 transition"
            title="Real-time Geofence Alert Log"
          >
            <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-sm">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* ML Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>ML Engine: <strong className="text-emerald-800">91.4% Acc</strong></span>
          </div>

          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs text-slate-800 transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium max-w-[100px] truncate">{user.name}</span>
              </button>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-white/95 py-2 border-t border-slate-200 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-3 py-1 rounded-md flex items-center gap-1 ${
            activeTab === 'landing' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('predict')}
          className={`px-3 py-1 rounded-md flex items-center gap-1 ${
            activeTab === 'predict' || activeTab === 'results' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          <Activity className="w-3 h-3" /> Predict
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-3 py-1 rounded-md flex items-center gap-1 ${
            activeTab === 'camera' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          <Camera className="w-3 h-3" /> Camera
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1 rounded-md flex items-center gap-1 ${
            activeTab === 'map' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          <MapPin className="w-3 h-3" /> Map
        </button>
        <button
          onClick={() => setActiveTab('hotspots')}
          className={`px-3 py-1 rounded-md flex items-center gap-1 ${
            activeTab === 'hotspots' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          <Flame className="w-3 h-3" /> Hotspots
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1 rounded-md flex items-center gap-1 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-3 h-3" /> Stats
        </button>
      </div>
    </header>
  );
};
