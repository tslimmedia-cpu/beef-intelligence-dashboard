import { useData } from '../../context/DataContext';

const severityConfig = {
  HIGH:  { badge: 'text-primary bg-primary/10',   border: 'hover:border-primary/40',   label: 'Urgent' },
  WATCH: { badge: 'text-secondary bg-secondary/10', border: 'hover:border-secondary/40', label: 'Watch' },
  INFO:  { badge: 'text-tertiary bg-tertiary/10',  border: 'hover:border-tertiary/40',  label: 'Info' },
};

export default function AlertsTab() {
  const { alerts } = useData();
  return (
    <div className="p-4 space-y-4 pb-6">
      {alerts.map(alert => {
        const cfg = severityConfig[alert.severity] || severityConfig.INFO;
        return (
          <div
            key={alert.id}
            className={`group relative bg-surface-container-low p-5 rounded-xl border border-white/5 ${cfg.border} transition-all duration-500 cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-tighter uppercase ${cfg.badge}`}>
                {cfg.label}
              </span>
              <span className="text-[10px] font-mono text-outline">{alert.time}</span>
            </div>
            <h4 className="text-sm font-headline font-bold text-on-surface mb-2 leading-snug uppercase line-clamp-2">
              {alert.title.split('—')[0].trim()}
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mb-3 line-clamp-3">
              {alert.detail}
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-surface-container-lowest rounded text-[9px] text-outline uppercase tracking-widest">
                {alert.category}
              </span>
              <span className="px-2 py-1 bg-surface-container-lowest rounded text-[9px] text-outline uppercase tracking-widest">
                {alert.region.split(' — ')[0]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
