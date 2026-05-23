import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { useData } from '../context/DataContext';

const markerFill = {
  high:   '#9f1239',
  watch:  '#ee9800',
  info:   '#4edea3',
  active: '#4edea3',
};

export default function IntelligenceMap() {
  const { mapMarkers, alerts } = useData();
  const logItems = alerts.filter(a => a.time && a.time.length <= 10).slice(0, 2);

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Leaflet map */}
      <MapContainer
        center={[28, -65]}
        zoom={3}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mapMarkers.map((marker, i) => (
          <CircleMarker
            key={i}
            center={[marker.lat, marker.lng]}
            radius={marker.severity === 'high' ? 10 : 7}
            pathOptions={{
              color: markerFill[marker.severity],
              fillColor: markerFill[marker.severity],
              fillOpacity: 0.55,
              weight: 2,
            }}
          >
            <Tooltip permanent={marker.severity === 'high'} direction="top">
              {marker.label}
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>
                <strong>{marker.label}</strong>
                <div style={{ color: '#a8898c', marginTop: 4, textTransform: 'capitalize' }}>{marker.type}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Bottom fade overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[401]"
        style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(19,19,19,0.75) 100%)' }}
      />

      {/* System Log — top left */}
      <div className="absolute top-8 left-8 z-[500] glass-panel p-5 rounded-xl border border-white/5 w-64">
        <h3 className="font-headline text-[10px] text-secondary font-bold tracking-[0.2em] mb-4 uppercase">
          System Log
        </h3>
        <div className="space-y-3">
          {logItems.length > 0 ? logItems.map((alert, i) => (
            <div key={i} className={`flex gap-3 ${i > 0 ? 'border-t border-white/5 pt-3' : ''}`}>
              <span className={`font-mono text-[9px] shrink-0 ${
                alert.severity === 'HIGH' ? 'text-primary' : 'text-tertiary'
              }`}>
                {alert.time}
              </span>
              <p className="text-[11px] text-on-surface-variant font-medium leading-tight line-clamp-2">
                {alert.detail.slice(0, 58)}…
              </p>
            </div>
          )) : (
            <>
              <div className="flex gap-3">
                <span className="text-tertiary font-mono text-[9px]">14:22</span>
                <p className="text-[11px] text-on-surface-variant font-medium leading-tight">Brazil export quota increased by 12% for Q3.</p>
              </div>
              <div className="flex gap-3 border-t border-white/5 pt-3">
                <span className="text-primary font-mono text-[9px]">13:05</span>
                <p className="text-[11px] text-on-surface-variant font-medium leading-tight">Heat stress advisory issued for Nebraska corridors.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Coordinates + zoom — top right */}
      <div className="absolute top-8 right-8 z-[500] flex flex-col items-end gap-3">
        <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-4">
          <span className="text-[10px] font-headline tracking-widest text-outline">LAT: 31.97° N</span>
          <span className="text-[10px] font-headline tracking-widest text-outline">LON: 99.90° W</span>
        </div>
        <div className="glass-panel p-2 rounded-lg flex flex-col gap-0.5">
          <button className="p-2 hover:bg-white/10 rounded transition-colors text-on-surface">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          </button>
          <button className="p-2 hover:bg-white/10 rounded transition-colors text-on-surface">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
          </button>
        </div>
      </div>

      {/* Stats pill — bottom center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[500]">
        <div className="glass-panel px-8 py-4 rounded-full flex items-center gap-10 border border-primary/20">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-headline tracking-widest text-outline uppercase">Live Supply</span>
            <span className="text-xl font-headline font-bold text-on-surface tracking-tighter">1.28M</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-headline tracking-widest text-outline uppercase">Export Flow</span>
            <span className="text-xl font-headline font-bold text-tertiary tracking-tighter">+4.2%</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-headline tracking-widest text-outline uppercase">Risk Factor</span>
            <span className="text-xl font-headline font-bold text-primary tracking-tighter">MID</span>
          </div>
        </div>
      </div>

    </div>
  );
}
