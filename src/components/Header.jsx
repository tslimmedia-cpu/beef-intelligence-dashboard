const navItems = [
  { id: 'intel',    label: 'Intel Feed' },
  { id: 'alerts',   label: 'Alerts' },
  { id: 'beefnews', label: 'BeefNews' },
  { id: 'trade',    label: 'Trade' },
  { id: 'ai',       label: 'AI Analyst' },
];

export default function Header({ activeView, onViewChange }) {
  return (
    <nav className="fixed top-0 w-full z-50 h-20 bg-[#131313]/60 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent">
      <div className="flex justify-between items-center px-8 h-full">

        {/* Logo + nav links */}
        <div className="flex items-center gap-10">
          <span className="text-2xl font-black text-white tracking-tighter font-headline uppercase">
            BEEFMAPS INTEL
          </span>
          <div className="flex gap-6 items-center h-full pt-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`font-headline tracking-tighter uppercase font-bold text-sm transition-all duration-300 pb-1 ${
                  activeView === item.id
                    ? 'text-primary border-b-2 border-primary-container'
                    : 'text-outline hover:text-secondary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-5">
          <div className="flex items-center bg-surface-container-lowest px-4 py-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-outline mr-2" style={{ fontSize: '16px' }}>search</span>
            <input
              className="bg-transparent border-none text-xs focus:outline-none text-on-surface w-36 font-headline tracking-widest uppercase placeholder:text-outline"
              placeholder="QUERY ASSETS..."
              type="text"
            />
          </div>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" style={{ fontSize: '22px' }}>
            settings
          </span>
        </div>

      </div>
    </nav>
  );
}
