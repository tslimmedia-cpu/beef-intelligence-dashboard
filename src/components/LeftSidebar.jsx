import { useState } from 'react';
import { mapLayers } from '../data/mockData';
import { useData } from '../context/DataContext';

const layerConfig = {
  droughtMonitor:    { icon: 'water_drop',            label: 'Drought',   activeColor: 'text-tertiary',   activeBorder: 'border-tertiary-container' },
  wildfirePerimeters:{ icon: 'local_fire_department', label: 'Fire',      activeColor: 'text-secondary',  activeBorder: 'border-primary-container' },
  feedlotDensity:    { icon: 'warehouse',             label: 'Feedlots',  activeColor: 'text-secondary',  activeBorder: 'border-secondary-container' },
  processingPlants:  { icon: 'factory',               label: 'Processing',activeColor: 'text-tertiary',   activeBorder: 'border-tertiary-container' },
  fmdZones:          { icon: 'coronavirus',           label: 'FMD Zones', activeColor: 'text-primary',    activeBorder: 'border-primary-container' },
  tradeRoutes:       { icon: 'monitoring',            label: 'Trade',     activeColor: 'text-tertiary',   activeBorder: 'border-tertiary-container' },
  pastureConditions: { icon: 'grass',                 label: 'Pasture',   activeColor: 'text-tertiary',   activeBorder: 'border-tertiary-container' },
};

export default function LeftSidebar() {
  const { isLive } = useData();
  const [layers, setLayers] = useState(mapLayers);

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 z-40 bg-[#201f1f]/80 backdrop-blur-[30px] border-r border-white/5 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]">

      {/* Header */}
      <div className="px-8 mt-24 mb-8">
        <h2 className="text-white font-bold font-headline text-xs tracking-[0.2em] uppercase">Strategic Layers</h2>
        <p className="text-primary font-bold text-[10px] tracking-widest opacity-60 mt-1">V3.0 COMMAND</p>
      </div>

      {/* Layer nav */}
      <nav className="flex-1 space-y-0.5">
        {Object.entries(layers).map(([key, layer]) => {
          const cfg = layerConfig[key];
          if (!cfg) return null;
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full px-6 py-4 flex items-center gap-4 transition-all duration-300 group border-l-4 ${
                layer.enabled
                  ? `bg-primary-container/15 text-white ${cfg.activeBorder}`
                  : 'text-outline border-transparent hover:bg-white/5 hover:text-on-surface-variant'
              }`}
            >
              <span className={`material-symbols-outlined transition-colors ${
                layer.enabled ? cfg.activeColor : 'text-outline group-hover:text-on-surface-variant'
              }`} style={{ fontSize: '20px' }}>
                {cfg.icon}
              </span>
              <span className="font-headline text-xs uppercase tracking-widest">
                {cfg.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Deploy Analysis CTA */}
      <div className="px-6 mb-6">
        <button className="w-full py-4 bg-gradient-to-r from-secondary-container to-secondary text-on-secondary font-headline font-bold text-xs tracking-widest rounded-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(238,152,0,0.2)]">
          DEPLOY ANALYSIS
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 space-y-4 mb-8">
        <div className="flex items-center gap-4 text-outline cursor-pointer hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>help</span>
          <span className="font-headline text-[10px] uppercase tracking-widest">Support</span>
        </div>
        <div className="flex items-center gap-4 text-outline cursor-pointer hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '16px' }}>sensors</span>
          <span className="font-headline text-[10px] uppercase tracking-widest">System Status</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-400' : 'bg-amber-400'}`} />
            <span className={`font-headline text-[8px] font-bold tracking-widest uppercase ${isLive ? 'text-green-400' : 'text-amber-400'}`}>
              {isLive ? 'LIVE' : 'MOCK'}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
