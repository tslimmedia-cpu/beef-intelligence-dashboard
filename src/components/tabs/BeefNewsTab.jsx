import { useData } from '../../context/DataContext';

// Category → badge color mapping (Cinematic Estate)
const categoryStyle = {
  'Investigative': { badge: 'text-primary bg-primary/10',     border: 'hover:border-primary/50',   dot: 'bg-primary' },
  'Antitrust':     { badge: 'text-primary bg-primary/10',     border: 'hover:border-primary/50',   dot: 'bg-primary' },
  'Farm Policy':   { badge: 'text-secondary bg-secondary/10', border: 'hover:border-secondary/40', dot: 'bg-secondary' },
  'Policy':        { badge: 'text-secondary bg-secondary/10', border: 'hover:border-secondary/40', dot: 'bg-secondary' },
  'Business':      { badge: 'text-secondary bg-secondary/10', border: 'hover:border-secondary/40', dot: 'bg-secondary' },
  'Climate':       { badge: 'text-tertiary bg-tertiary/10',   border: 'hover:border-tertiary/40',  dot: 'bg-tertiary' },
  'Cowboy Talk':   { badge: 'text-tertiary bg-tertiary/10',   border: 'hover:border-tertiary/40',  dot: 'bg-tertiary' },
  'Culture':       { badge: 'text-tertiary bg-tertiary/10',   border: 'hover:border-tertiary/40',  dot: 'bg-tertiary' },
  'Beef Maps':     { badge: 'text-tertiary bg-tertiary/10',   border: 'hover:border-tertiary/40',  dot: 'bg-tertiary' },
  'Health':        { badge: 'text-tertiary bg-tertiary/10',   border: 'hover:border-tertiary/40',  dot: 'bg-tertiary' },
  'Video':         { badge: 'text-outline bg-outline/10',     border: 'hover:border-outline/30',   dot: 'bg-outline' },
  'News':          { badge: 'text-outline bg-outline/10',     border: 'hover:border-outline/30',   dot: 'bg-outline' },
};

const defaultStyle = { badge: 'text-outline bg-outline/10', border: 'hover:border-outline/30', dot: 'bg-outline' };

export default function BeefNewsTab() {
  const { beefnewsArticles } = useData();

  const empty = !beefnewsArticles || beefnewsArticles.length === 0;

  return (
    <div className="flex flex-col h-full">

      {/* Site header strip */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[9px] text-outline font-headline uppercase tracking-widest">
            The Voice of the Rancher Direct Movement
          </p>
        </div>
        <a
          href="https://beefnews.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-secondary font-headline uppercase tracking-widest hover:text-on-surface transition-colors flex items-center gap-1"
        >
          <span>beefnews.org</span>
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
        </a>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">

        {empty && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-outline mb-3" style={{ fontSize: '32px' }}>newspaper</span>
            <p className="text-xs text-outline">Loading articles from BeefNews.org...</p>
          </div>
        )}

        {beefnewsArticles.map((article, i) => {
          const style = categoryStyle[article.category] || defaultStyle;
          const isInvestigative = ['Investigative', 'Antitrust'].includes(article.category);

          return (
            <a
              key={article.id || i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative block bg-surface-container-low p-4 rounded-xl border border-white/5 ${style.border} transition-all duration-300 cursor-pointer no-underline`}
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-tighter uppercase ${style.badge}`}>
                  {article.category}
                </span>
                <span className="text-[9px] font-mono text-outline shrink-0 ml-2">{article.time}</span>
              </div>

              {/* Title */}
              <h4 className={`text-sm font-headline font-bold leading-snug mb-2 transition-colors ${
                isInvestigative
                  ? 'text-on-surface group-hover:text-primary'
                  : 'text-on-surface group-hover:text-secondary'
              }`}>
                {article.title}
              </h4>

              {/* Description */}
              {article.description && (
                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-3 mb-2">
                  {article.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                <span className="text-[9px] text-outline uppercase tracking-widest">BeefNews.org</span>
                <span className="ml-auto text-[9px] text-outline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  Read
                  <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>arrow_outward</span>
                </span>
              </div>

              {/* Investigative accent glow */}
              {isInvestigative && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
