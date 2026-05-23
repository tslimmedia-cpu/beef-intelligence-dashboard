import { useData } from '../../context/DataContext';

const categoryStyle = {
  'USDA REPORT':    'text-secondary bg-secondary/10 hover:border-secondary/40',
  'WILDFIRE ALERT': 'text-primary bg-primary/10 hover:border-primary/40',
  'TRADE FLOW':     'text-secondary bg-secondary/10 hover:border-secondary/40',
  'MARKET INTEL':   'text-outline bg-outline/10 hover:border-outline/40',
  'FOIA SOURCE':    'text-outline bg-outline/10 hover:border-outline/40',
  'DISEASE ALERT':  'text-primary bg-primary/10 hover:border-primary/40',
  'REGULATORY':     'text-secondary bg-secondary/10 hover:border-secondary/40',
  'PACKER NEWS':    'text-outline bg-outline/10 hover:border-outline/40',
  'CLIMATE':        'text-tertiary bg-tertiary/10 hover:border-tertiary/40',
};

export default function IntelFeedTab() {
  const { intelFeed } = useData();
  return (
    <div className="p-4 space-y-4 pb-6">
      {intelFeed.map(item => {
        const style = categoryStyle[item.category] || categoryStyle['MARKET INTEL'];
        const borderHover = style.split(' ').find(c => c.startsWith('hover:')) || 'hover:border-outline/40';
        return (
          <div
            key={item.id}
            className={`group relative bg-surface-container-low p-5 rounded-xl border border-white/5 ${borderHover} transition-all duration-500 cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-tighter uppercase ${style.split(' ').slice(0,2).join(' ')}`}>
                {item.category}
              </span>
              <span className="text-[10px] font-mono text-outline">{item.time}</span>
            </div>
            <h4 className="text-sm font-headline font-bold text-on-surface mb-2 leading-snug uppercase line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center justify-between mt-3">
              <span className="px-2 py-1 bg-surface-container-lowest rounded text-[9px] text-outline uppercase tracking-widest">
                {item.source}
              </span>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
