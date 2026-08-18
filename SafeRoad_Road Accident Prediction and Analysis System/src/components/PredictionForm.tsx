import React, { useState, useEffect } from 'react';
import { LocationData, WeatherData, PredictionInput, PredictionResult } from '../types';
import { 
  MapPin, 
  CloudSun, 
  Car, 
  Gauge, 
  User as UserIcon, 
  Clock, 
  Navigation, 
  RefreshCw, 
  Sparkles, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Wind, 
  Eye, 
  Droplets, 
  CloudRain
} from 'lucide-react';

interface PredictionFormProps {
  onPredictionComplete: (result: PredictionResult) => void;
  userId?: string;
  userName?: string;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  onPredictionComplete,
  userId,
  userName
}) => {
  // Location State
  const [location, setLocation] = useState<LocationData>({
    latitude: 37.7749,
    longitude: -122.4194,
    city: 'San Francisco',
    region: 'CA',
    country: 'USA'
  });
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState<string | null>(null);

  // Weather State
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 19,
    condition: 'Clear',
    visibilityKm: 10.0,
    humidity: 55,
    windSpeedKmh: 14,
    isRaining: false,
    rainIntensity: 'none'
  });
  const [fetchingWeather, setFetchingWeather] = useState(false);

  // Form Parameters
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [vehicleType, setVehicleType] = useState<'Car' | 'Motorcycle' | 'Bus' | 'Truck' | 'Bicycle' | 'Other'>('Car');
  const [speedLimit, setSpeedLimit] = useState<number>(80);
  const [roadType, setRoadType] = useState<'Highway' | 'Urban Street' | 'Rural Road' | 'Intersection' | 'Expressway'>('Highway');
  const [trafficDensity, setTrafficDensity] = useState<'Low' | 'Moderate' | 'Heavy' | 'Congested'>('Moderate');
  
  // Environment Params
  const [weatherCondition, setWeatherCondition] = useState<string>('Clear');
  const [visibilityKm, setVisibilityKm] = useState<number>(10.0);
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<string>('15:30');
  const [isNight, setIsNight] = useState<boolean>(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);

  // Synchronize Weather condition with Weather State
  useEffect(() => {
    fetchWeatherForLocation(location.latitude, location.longitude);
  }, []);

  const fetchWeatherForLocation = async (lat: number, lng: number) => {
    setFetchingWeather(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const w: WeatherData = await res.json();
        setWeather(w);
        setWeatherCondition(w.condition);
        setVisibilityKm(w.visibilityKm);
        setIsRaining(w.isRaining);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setFetchingWeather(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg('Geolocation API is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationMsg('Detecting precise GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));

        try {
          const geoRes = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            setLocation({
              latitude: lat,
              longitude: lng,
              city: geoData.city || 'Detected Location',
              region: geoData.region || 'Region',
              country: geoData.country || 'Global'
            });
            setLocationMsg(`📍 Located: ${geoData.city}, ${geoData.region}`);
          }
        } catch (e) {
          setLocation({
            latitude: lat,
            longitude: lng,
            city: 'Current Location',
            region: 'Geo Zone',
            country: 'Global'
          });
          setLocationMsg(`📍 GPS Coordinates: ${lat}, ${lng}`);
        }

        // Trigger weather update for new location
        fetchWeatherForLocation(lat, lng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setLocationMsg('Location access permission required. Defaulting to current city.');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Time of Day changes Night setting
  const handleTimeChange = (val: string) => {
    setTimeOfDay(val);
    const hour = parseInt(val.split(':')[0], 10);
    if (hour >= 20 || hour < 6) {
      setIsNight(true);
    } else {
      setIsNight(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const inputData: PredictionInput = {
      age,
      gender,
      vehicleType,
      speedLimit,
      roadType,
      trafficDensity,
      weatherCondition,
      visibilityKm,
      isRaining,
      timeOfDay,
      isNight,
      location
    };

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputData, userId, userName })
      });

      if (!res.ok) {
        throw new Error('Prediction API failed.');
      }

      const result: PredictionResult = await res.json();
      onPredictionComplete(result);
    } catch (err) {
      alert('An error occurred while calculating prediction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Machine Learning Severity Inference
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">Accident Severity Prediction Input</h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Capture live location & weather parameters, specify vehicle physics and driver details to generate instant machine learning risk evaluation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROW 1: LOCATION & WEATHER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Automatic Location Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Automatic Location Detection</h3>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Locating...' : 'Get My Location'}</span>
              </button>
            </div>

            {locationMsg && (
              <p className="text-xs text-indigo-800 font-medium bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                {locationMsg}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">City & Region</span>
                <span className="font-bold text-slate-800">{location.city}, {location.region}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Country</span>
                <span className="font-bold text-slate-800">{location.country}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Latitude</span>
                <span className="font-mono text-indigo-600 font-bold">{location.latitude.toFixed(4)}° N</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Longitude</span>
                <span className="font-mono text-indigo-600 font-bold">{location.longitude.toFixed(4)}° W</span>
              </div>
            </div>
          </div>

          {/* Automatic Weather Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CloudSun className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Automatic Weather Integration</h3>
              </div>
              <button
                type="button"
                onClick={() => fetchWeatherForLocation(location.latitude, location.longitude)}
                disabled={fetchingWeather}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="Refresh Weather"
              >
                <RefreshCw className={`w-4 h-4 ${fetchingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block">Temperature</span>
                <span className="text-lg font-extrabold text-blue-600">{weather.temperature}°C</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block">Condition</span>
                <span className="font-bold text-slate-800">{weather.condition}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-400 text-[10px] block">Visibility</span>
                <span className="font-bold text-slate-800">{weather.visibilityKm} km</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-600" /> Hum: {weather.humidity}%</span>
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-slate-500" /> Wind: {weather.windSpeedKmh} km/h</span>
              <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-indigo-600" /> Rain: {weather.isRaining ? 'Yes' : 'No'}</span>
            </div>
          </div>

        </div>

        {/* ROW 2: FORM PARAMETERS */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-indigo-600" />
            <span>Driver, Vehicle & Road Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            
            {/* Driver Age */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex justify-between">
                <span>Driver Age</span>
                <span className="text-indigo-600 font-bold">{age} Years Old</span>
              </label>
              <input
                type="range"
                min="16"
                max="85"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-500">Age factor affects driver reaction time index.</span>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Driver Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Vehicle Classification</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="Car">Car / Sedan / SUV</option>
                <option value="Motorcycle">Motorcycle / Scooter</option>
                <option value="Truck">Heavy Truck / Trailer</option>
                <option value="Bus">Passenger Bus / Transit</option>
                <option value="Bicycle">Bicycle / E-Bike</option>
                <option value="Other">Other Heavy Duty</option>
              </select>
            </div>

            {/* Speed Limit */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex justify-between">
                <span>Speed Limit</span>
                <span className="text-indigo-600 font-bold">{speedLimit} km/h</span>
              </label>
              <input
                type="range"
                min="20"
                max="140"
                step="5"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Road Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Road Type & Geometry</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="Highway">Highway (Multi-lane)</option>
                <option value="Urban Street">Urban Street / City Grid</option>
                <option value="Rural Road">Rural / Non-illuminated Road</option>
                <option value="Intersection">Complex Intersection</option>
                <option value="Expressway">Expressway / Freeway</option>
              </select>
            </div>

            {/* Traffic Density */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Traffic Density</label>
              <select
                value={trafficDensity}
                onChange={(e) => setTrafficDensity(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="Low">Low Density (Free Flow)</option>
                <option value="Moderate">Moderate Density</option>
                <option value="Heavy">Heavy Traffic</option>
                <option value="Congested">Congested / Stop & Go</option>
              </select>
            </div>

          </div>

          {/* ENVIRONMENT & LIGHTING OVERRIDES */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Weather Override</label>
              <select
                value={weatherCondition}
                onChange={(e) => {
                  setWeatherCondition(e.target.value);
                  if (e.target.value === 'Rainy' || e.target.value === 'Stormy') setIsRaining(true);
                  else if (e.target.value === 'Clear') setIsRaining(false);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                <option value="Clear">Clear / Dry Pavement</option>
                <option value="Rainy">Rainy / Wet Pavement</option>
                <option value="Stormy">Stormy Heavy Downpour</option>
                <option value="Foggy">Foggy / Dense Mist</option>
                <option value="Snowy">Snowy / Ice Hazard</option>
                <option value="Overcast">Overcast Cloud Coverage</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Time of Day</label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Lighting Environment</label>
              <button
                type="button"
                onClick={() => setIsNight(!isNight)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isNight
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                {isNight ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{isNight ? 'Nighttime (Reduced Vision)' : 'Daylight (Full Vision)'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-md shadow-indigo-100 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldAlert className={`w-5 h-5 ${submitting ? 'animate-spin' : ''}`} />
            <span>{submitting ? 'Executing Machine Learning Inference...' : 'Calculate Accident Severity & Risk'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
