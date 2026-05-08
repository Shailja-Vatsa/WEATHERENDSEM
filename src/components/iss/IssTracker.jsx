import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Component to dynamically center map on ISS
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Custom ISS Icon using Leaflet divIcon
const issIcon = new L.divIcon({
  className: 'custom-iss-icon',
  html: `<div style="font-size: 24px; animation: pulse 2s infinite;">🛰️</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export const IssTracker = ({ history, current, city, astros }) => {
  const mapRef = useRef(null);

  if (!current) {
    return <div className="h-96 flex items-center justify-center animate-pulse text-slate-500">Acquiring ISS Signal...</div>;
  }

  // Trajectory is last 15 points
  const trajectory = history.slice(-15).map(point => [point.lat, point.lon]);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-sm text-slate-500 dark:text-slate-400">Velocity</div>
          <div className="text-xl font-bold font-mono">{current.speed.toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-sm text-slate-500 dark:text-slate-400">Altitude</div>
          <div className="text-xl font-bold font-mono">~408 km</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl group relative cursor-help">
          <div className="text-sm text-slate-500 dark:text-slate-400">Crew in Space</div>
          <div className="text-xl font-bold font-mono">{astros?.count || 0}</div>
          {/* Tooltip to show astronaut names */}
          {astros?.names && astros.names.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="font-bold mb-1">Astronauts:</div>
              <ul className="list-disc pl-4 space-y-1">
                {astros.names.map((name, i) => <li key={i}>{name}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-sm text-slate-500 dark:text-slate-400">Nearest Area</div>
          <div className="text-sm font-bold truncate" title={city}>{city}</div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0">
        <MapContainer 
          center={[current.lat, current.lon]} 
          zoom={4} 
          scrollWheelZoom={false} 
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          <MapUpdater center={[current.lat, current.lon]} />
          
          {trajectory.length > 1 && (
            <Polyline 
              positions={trajectory} 
              color="#ef4444" 
              weight={3} 
              dashArray="5, 10" 
            />
          )}

          <Marker position={[current.lat, current.lon]} icon={issIcon}>
            <Popup className="dark:text-slate-900">
              <b>ISS is Here!</b><br />
              Lat: {current.lat.toFixed(4)}<br />
              Lon: {current.lon.toFixed(4)}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <style jsx="true">{`
        .custom-iss-icon { background: none; border: none; }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        html.dark .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
      `}</style>
    </div>
  );
};
