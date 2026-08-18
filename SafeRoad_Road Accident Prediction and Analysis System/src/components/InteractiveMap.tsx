import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hotspot, LocationData } from '../types';
import { MapPin, Flame, Info, Radio, Navigation, ShieldCheck, Play, Square, RotateCcw, Compass, Sliders } from 'lucide-react';

interface InteractiveMapProps {
  hotspots: Hotspot[];
  userLocation?: LocationData;
  driverLocation: { latitude: number; longitude: number };
  onSetManualLocation: (lat: number, lng: number) => void;
  geofenceRadiusKm: number;
  onSetGeofenceRadiusKm: (radius: number) => void;
  isLiveGps: boolean;
  onToggleLiveGps: () => void;
  isSimulatingDrive: boolean;
  onStartSimulatedDrive: (hotspot: Hotspot) => void;
  onStopSimulatedDrive: () => void;
  onResetGeofences: () => void;
  onInspectHotspotFromParent?: Hotspot | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  hotspots,
  userLocation,
  driverLocation,
  onSetManualLocation,
  geofenceRadiusKm,
  onSetGeofenceRadiusKm,
  isLiveGps,
  onToggleLiveGps,
  isSimulatingDrive,
  onStartSimulatedDrive,
  onStopSimulatedDrive,
  onResetGeofences,
  onInspectHotspotFromParent
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedRoadType, setSelectedRoadType] = useState<string>('All');
  const [searchCity, setSearchCity] = useState<string>('');

  // Selected Hotspot for Detail Panel
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Simulation Target Selection
  const highRiskHotspots = hotspots.filter(
    (hs) => hs.severity === 'Fatal' || hs.severity === 'Severe' || hs.riskScore >= 70
  );
  const [selectedSimTargetId, setSelectedSimTargetId] = useState<string>(
    highRiskHotspots[0]?.id || ''
  );

  useEffect(() => {
    if (onInspectHotspotFromParent) {
      setActiveHotspot(onInspectHotspotFromParent);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([onInspectHotspotFromParent.latitude, onInspectHotspotFromParent.longitude], 12);
      }
    }
  }, [onInspectHotspotFromParent]);

  // Filtered Hotspots list
  const filteredHotspots = hotspots.filter((hs) => {
    if (selectedSeverity !== 'All' && hs.severity !== selectedSeverity) return false;
    if (selectedRoadType !== 'All' && hs.roadType !== selectedRoadType) return false;
    if (
      searchCity.trim() &&
      !hs.city.toLowerCase().includes(searchCity.toLowerCase()) &&
      !hs.name.toLowerCase().includes(searchCity.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map if not created
    if (!mapInstanceRef.current) {
      const initialLat = driverLocation.latitude || userLocation?.latitude || 37.7749;
      const initialLng = driverLocation.longitude || userLocation?.longitude || -122.4194;

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 8);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Handle map clicks to set vehicle position
      map.on('click', (e: L.LeafletMouseEvent) => {
        onSetManualLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers & circles
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // 1. Render Driver Vehicle / User Marker
    const vehicleIcon = L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div class="relative group">
          <div class="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold ring-4 ring-indigo-500/30 animate-pulse">
            🚘
          </div>
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            Your Vehicle
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([driverLocation.latitude, driverLocation.longitude], {
      icon: vehicleIcon,
      zIndexOffset: 1000
    })
      .addTo(map)
      .bindPopup(
        `<b>🚘 Vehicle Driver Location</b><br/>Lat: ${driverLocation.latitude.toFixed(
          4
        )}, Lng: ${driverLocation.longitude.toFixed(4)}`
      );

    // 2. Render High-Risk Geofence Perimeter Circles
    filteredHotspots.forEach((hs) => {
      const isHighRisk = hs.severity === 'Fatal' || hs.severity === 'Severe' || hs.riskScore >= 70;
      if (isHighRisk) {
        const circleColor = hs.severity === 'Fatal' ? '#e11d48' : '#d97706';
        L.circle([hs.latitude, hs.longitude], {
          radius: geofenceRadiusKm * 1000, // meters
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '5, 5'
        }).addTo(map);
      }
    });

    // 3. Render Hotspot Pins
    filteredHotspots.forEach((hs) => {
      const color =
        hs.severity === 'Fatal' ? '#e11d48' : hs.severity === 'Severe' ? '#d97706' : '#059669';

      const customIcon = L.divIcon({
        className: 'custom-hotspot-marker',
        html: `
          <div style="background-color: ${color};" class="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-extrabold cursor-pointer hover:scale-125 transition-transform">
            ${hs.accidentCount}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([hs.latitude, hs.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveHotspot(hs);
      });

      marker.bindPopup(`
        <div class="text-xs space-y-1 font-sans">
          <strong style="color: ${color};">${hs.severity} Risk Zone (${hs.riskScore}/100)</strong><br/>
          <b>${hs.name}</b><br/>
          <span>${hs.city} • ${hs.accidentCount} Historical Collisions</span>
        </div>
      `);
    });
  }, [filteredHotspots, driverLocation, geofenceRadiusKm, onSetManualLocation]);

  const handleStartSim = () => {
    const target = hotspots.find((h) => h.id === selectedSimTargetId) || highRiskHotspots[0];
    if (target) {
      onStartSimulatedDrive(target);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([target.latitude - 0.04, target.longitude - 0.04], 11);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Interactive Accident Hotspots & Geofence Guard
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time high-risk proximity alerts, collision density heat maps, and drive simulation monitoring.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="text-slate-500 block text-[10px] mb-1 font-semibold">Filter Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="All">All Risk Levels</option>
              <option value="Fatal">Fatal (Red Zone)</option>
              <option value="Severe">Severe (Orange Zone)</option>
              <option value="Slight">Slight (Green Zone)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block text-[10px] mb-1 font-semibold">Road Geometry</label>
            <select
              value={selectedRoadType}
              onChange={(e) => setSelectedRoadType(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="All">All Road Types</option>
              <option value="Highway">Highway</option>
              <option value="Urban Street">Urban Street</option>
              <option value="Rural Road">Rural Road</option>
              <option value="Intersection">Intersection</option>
              <option value="Expressway">Expressway</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block text-[10px] mb-1 font-semibold">City Search</label>
            <input
              type="text"
              placeholder="Search city/name..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition w-36"
            />
          </div>
        </div>
      </div>

      {/* REAL-TIME GEOFENCE MONITOR & DRIVE SIMULATOR TOOLBAR */}
      <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-md space-y-4 text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-800 pb-3">
          
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-800/80 text-amber-300 border border-indigo-700 shrink-0">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm font-['Outfit'] text-white">Real-Time Geofence Guard</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-indigo-200 text-[11px] mt-0.5">
                Monitoring high-risk collision zones within <strong className="text-amber-300">{geofenceRadiusKm} km</strong>. Click map to set vehicle position.
              </p>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Radius Slider */}
            <div className="flex items-center space-x-2 bg-indigo-950/60 p-2 rounded-xl border border-indigo-800">
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-[11px] font-medium text-indigo-200">Alert Radius:</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={geofenceRadiusKm}
                onChange={(e) => onSetGeofenceRadiusKm(parseFloat(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-300 text-xs w-10">{geofenceRadiusKm} km</span>
            </div>

            {/* GPS Toggle */}
            <button
              onClick={onToggleLiveGps}
              className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                isLiveGps
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg'
                  : 'bg-indigo-800 hover:bg-indigo-700 border-indigo-700 text-white'
              }`}
            >
              <Compass className={`w-4 h-4 ${isLiveGps ? 'animate-spin' : ''}`} />
              <span>{isLiveGps ? 'GPS Tracking Active' : 'Enable Device GPS'}</span>
            </button>

            {/* Reset Triggered Memory */}
            <button
              onClick={onResetGeofences}
              className="px-3 py-2 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 border border-indigo-700 text-indigo-200 hover:text-white transition font-medium flex items-center gap-1"
              title="Reset alerts memory to test re-entering zones"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Alert State</span>
            </button>

          </div>
        </div>

        {/* DRIVE SIMULATION ROUTE CONTROLLER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-950/70 p-3 rounded-xl border border-indigo-800/80">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
            <span className="font-bold text-indigo-100 whitespace-nowrap">Drive Simulator:</span>
            <select
              value={selectedSimTargetId}
              onChange={(e) => setSelectedSimTargetId(e.target.value)}
              className="py-1.5 px-3 bg-indigo-900 border border-indigo-700 rounded-lg text-white font-medium text-xs focus:outline-none focus:border-amber-400 w-full sm:w-64"
            >
              {highRiskHotspots.map((hs) => (
                <option key={hs.id} value={hs.id}>
                  {hs.name} ({hs.severity} Risk)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {!isSimulatingDrive ? (
              <button
                onClick={handleStartSim}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Drive Into High-Risk Zone</span>
              </button>
            ) : (
              <button
                onClick={onStopSimulatedDrive}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md animate-pulse"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Simulated Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAP & DETAIL SIDEBAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Canvas Container */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-2 relative h-[520px] overflow-hidden shadow-sm">
          <div ref={mapContainerRef} className="w-full h-full rounded-xl z-10" />

          {/* Map Legend Floating Overlay */}
          <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl text-xs space-y-1.5 shadow-xl">
            <span className="font-bold text-slate-900 text-[11px] block border-b border-slate-100 pb-1">
              Hotspot & Geofence Legend
            </span>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              <span>🚘 Driver Vehicle Marker</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>Fatal Red Zone (Geofence Perimeter)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Severe Orange Zone</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Slight Green Zone</span>
            </div>
          </div>
        </div>

        {/* Selected Hotspot Detail Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Flame className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Hotspot Risk Inspector</h3>
          </div>

          {activeHotspot ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-start">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeHotspot.severity === 'Fatal'
                        ? 'bg-rose-100 text-rose-700'
                        : activeHotspot.severity === 'Severe'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {activeHotspot.severity} Severity Zone
                  </span>
                  <span className="text-indigo-600 font-bold font-mono">
                    Risk Score: {activeHotspot.riskScore}/100
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{activeHotspot.name}</h4>
                <p className="text-slate-500">
                  {activeHotspot.city}, {activeHotspot.region}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Accident Count</span>
                  <span className="text-base font-extrabold text-rose-600 font-mono">
                    {activeHotspot.accidentCount} Collisions
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Road Geometry</span>
                  <span className="text-xs font-bold text-slate-800">{activeHotspot.roadType}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">
                  Primary Collision Cause
                </span>
                <p className="text-slate-800 text-xs font-medium">{activeHotspot.primaryCause}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">
                  Zone Overview
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {activeHotspot.description}
                </p>
              </div>

              <button
                onClick={() => onStartSimulatedDrive(activeHotspot)}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Simulate Driving To This Hotspot</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs space-y-2">
              <Info className="w-8 h-8 mx-auto text-slate-300" />
              <p>
                Click on any hotspot marker or geofence boundary on the map to view detailed collision risk drivers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
