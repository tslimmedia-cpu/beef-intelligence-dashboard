import { useData } from '../context/DataContext';

export default function BottomTicker() {
  const { tickerItems } = useData();
  const items = tickerItems?.length > 0 ? tickerItems : [];

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-surface-container-lowest border-t border-white/5 z-50 flex items-center overflow-hidden">

      {/* MARKET LIVE badge */}
      <div className="bg-primary-container h-full flex items-center px-5 gap-2 shrink-0 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}
        >
          trending_up
        </span>
        <span className="text-white font-headline text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
          MARKET LIVE
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center">
        <div className="animate-marquee items-center gap-10 pl-8">
          {items.map((item, i) => (
            <div key={i} className="inline-flex items-baseline gap-1.5 whitespace-nowrap shrink-0">
              <span className="text-outline font-headline text-[9px] tracking-widest uppercase whitespace-nowrap">
                {item.label}:
              </span>
              <span className="text-on-surface font-mono text-[11px] font-bold whitespace-nowrap">
                {item.value}
              </span>
              {item.change ? (
                <span className={`font-mono text-[9px] font-bold whitespace-nowrap ${
                  item.change.startsWith('+') ? 'text-tertiary' : 'text-primary'
                }`}>
                  ({item.change})
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
