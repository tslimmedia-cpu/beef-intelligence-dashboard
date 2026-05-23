import IntelFeedTab from './tabs/IntelFeedTab';
import AlertsTab from './tabs/AlertsTab';
import USDATab from './tabs/USDATab';
import TradeTab from './tabs/TradeTab';
import AIAnalystTab from './tabs/AIAnalystTab';
import BeefNewsTab from './tabs/BeefNewsTab';

const viewConfig = {
  intel:    { title: 'Intel Feed',    icon: 'bolt' },
  alerts:   { title: 'Alert Command', icon: 'warning' },
  usda:     { title: 'USDA Data',     icon: 'bar_chart' },
  trade:    { title: 'Trade Flows',   icon: 'monitoring' },
  ai:       { title: 'AI Analyst',    icon: 'smart_toy' },
  beefnews: { title: 'BeefNews',      icon: 'newspaper' },
};

export default function RightPanel({ activeView }) {
  const cfg = viewConfig[activeView] || viewConfig.intel;

  const renderContent = () => {
    switch (activeView) {
      case 'intel':  return <IntelFeedTab />;
      case 'alerts': return <AlertsTab />;
      case 'usda':   return <USDATab />;
      case 'trade':  return <TradeTab />;
      case 'ai':       return <AIAnalystTab />;
      case 'beefnews': return <BeefNewsTab />;
      default:         return <IntelFeedTab />;
    }
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 z-30 bg-[#1c1b1b] flex flex-col">

      {/* Panel header */}
      <div className="flex items-center justify-between px-6 pt-28 pb-5 border-b border-white/5 shrink-0">
        <h2 className="text-on-surface font-headline text-xs font-bold tracking-[0.2em] uppercase">
          {cfg.title}
        </h2>
        <span
          className="material-symbols-outlined text-secondary"
          style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
        >
          {cfg.icon}
        </span>
      </div>

      {/* Scrollable content */}
      <div className={`flex-1 overflow-y-auto ${activeView === 'ai' ? 'flex flex-col' : ''}`}>
        {renderContent()}
      </div>

    </aside>
  );
}
