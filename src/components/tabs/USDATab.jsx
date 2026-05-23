import { useData } from '../../context/DataContext';

export default function USDATab() {
  const { usdaData } = useData();
  const reports = [usdaData.cattleOnFeed, usdaData.coldStorage, usdaData.livestockSlaughter];

  return (
    <div className="p-4 space-y-4 pb-6">
      {reports.map((report, i) => (
        <div key={i} className="bg-surface-container-low p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-headline font-bold text-on-surface uppercase tracking-tight">{report.title}</h4>
            <span className="text-[9px] text-outline uppercase tracking-widest">{report.source}</span>
          </div>
          <div className="space-y-2.5">
            {report.highlights.map((h, j) => (
              <div key={j} className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant">{h.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-headline font-bold text-on-surface">{h.value}</span>
                  <span className={`text-[10px] font-bold ${h.change >= 0 ? 'text-tertiary' : 'text-primary'}`}>
                    {h.change >= 0 ? '+' : ''}{h.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-[9px] text-outline">Last: {report.lastRelease}</span>
            <span className="text-[9px] text-secondary font-bold">Next: {report.nextRelease}</span>
          </div>
        </div>
      ))}

      {/* Release Calendar */}
      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-sm font-headline font-bold text-on-surface uppercase tracking-tight mb-4">Release Calendar</h4>
        <div className="space-y-2">
          {(usdaData.releaseCalendar || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <span className="text-[11px] text-on-surface-variant">{item.report}</span>
              <div className="text-right">
                <div className="text-[10px] text-on-surface font-medium">{item.date}</div>
                <div className="text-[9px] text-outline">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
