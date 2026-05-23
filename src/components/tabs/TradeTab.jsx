import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { useData } from '../../context/DataContext';

const statusColor = {
  active:     'text-tertiary',
  restricted: 'text-secondary',
  suspended:  'text-primary',
  pipeline:   'text-outline',
};

const riskStyle = {
  low:    'bg-tertiary/10 text-tertiary',
  medium: 'bg-secondary/10 text-secondary',
  high:   'bg-primary/10 text-primary',
};

export default function TradeTab() {
  const { tradeFlowData, settlementData } = useData();
  const [view, setView] = useState('trade');

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Toggle */}
      <div className="flex gap-1 bg-surface-container-high rounded-lg p-1">
        {['trade', 'settlement'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 text-[9px] py-2 rounded-md font-headline font-bold tracking-widest uppercase transition-all ${
              view === v
                ? 'bg-gradient-to-r from-secondary-container to-secondary text-on-secondary shadow-[0_0_12px_rgba(238,152,0,0.3)]'
                : 'text-outline hover:text-on-surface-variant'
            }`}
          >
            {v === 'trade' ? 'Trade Flows' : 'Settlement'}
          </button>
        ))}
      </div>

      {view === 'settlement'
        ? <SettlementView settlementData={settlementData} />
        : <TradeFlowView tradeFlowData={tradeFlowData} />
      }
    </div>
  );
}

function SettlementView({ settlementData }) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-[10px] text-outline tracking-widest mb-4 uppercase font-headline">Network Health</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-lg font-headline font-bold text-tertiary">{settlementData.networkHealth.uptime}%</div>
            <div className="text-[9px] text-outline uppercase tracking-widest">Uptime</div>
          </div>
          <div>
            <div className="text-lg font-headline font-bold text-secondary">{settlementData.networkHealth.confirmationSpeed}</div>
            <div className="text-[9px] text-outline uppercase tracking-widest">Avg Confirm</div>
          </div>
          <div>
            <div className="text-lg font-headline font-bold text-tertiary">{settlementData.networkHealth.escrowStatus}</div>
            <div className="text-[9px] text-outline uppercase tracking-widest">Escrow</div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-[10px] text-outline tracking-widest mb-3 uppercase font-headline">Transaction Volume</h4>
        <div className="flex justify-between mb-3">
          {[
            { label: 'Daily', value: settlementData.volumeByPeriod.daily },
            { label: 'Weekly', value: settlementData.volumeByPeriod.weekly },
            { label: 'Monthly', value: settlementData.volumeByPeriod.monthly, gold: true },
          ].map(({ label, value, gold }) => (
            <div key={label} className="text-center">
              <div className={`text-sm font-headline font-bold ${gold ? 'text-secondary' : 'text-on-surface'}`}>{value}</div>
              <div className="text-[9px] text-outline">{label}</div>
            </div>
          ))}
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={settlementData.volumeChart}>
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#a8898c' }} axisLine={false} tickLine={false} />
              <Bar dataKey="volume" fill="#ee9800" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-[10px] text-outline tracking-widest mb-3 uppercase font-headline">Active Corridors</h4>
        <div className="space-y-2">
          {settlementData.corridors.map((c, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">{c.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] capitalize ${c.status === 'active' ? 'text-tertiary' : 'text-outline'}`}>{c.status}</span>
                {c.volume > 0 && <span className="text-[10px] text-secondary font-bold">{c.volume}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TradeFlowView({ tradeFlowData }) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-[10px] text-outline tracking-widest mb-4 uppercase font-headline">Top Export Markets (USD B)</h4>
        <div className="space-y-3">
          {tradeFlowData.exports.map((exp, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant w-20">{exp.country}</span>
                <span className="text-sm font-headline font-bold text-secondary">${exp.value}B</span>
                <span className={`text-[10px] font-bold ${exp.change >= 0 ? 'text-tertiary' : 'text-primary'}`}>
                  {exp.change >= 0 ? '+' : ''}{exp.change}%
                </span>
              </div>
              <div className="w-14 h-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exp.trend.map((v, j) => ({ v, j }))}>
                    <Line type="monotone" dataKey="v" stroke={exp.change >= 0 ? '#4edea3' : '#ffb2ba'} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-[10px] text-outline tracking-widest mb-3 uppercase font-headline">Quota Utilization</h4>
        <div className="space-y-2.5">
          {tradeFlowData.exports.filter(e => e.quota).map((exp, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-on-surface-variant">{exp.country}</span>
                <span className="text-[10px] text-on-surface font-bold">{exp.quota}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${exp.quota}%`,
                    backgroundColor: exp.quota > 80 ? '#ffb2ba' : exp.quota > 60 ? '#ffb95f' : '#4edea3',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-low p-5 rounded-xl border border-white/5">
        <h4 className="text-[10px] text-outline tracking-widest mb-3 uppercase font-headline">Corridor Status</h4>
        <div className="space-y-2">
          {tradeFlowData.corridorStatus.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
              <span className="text-[11px] text-on-surface-variant">{c.corridor}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] capitalize font-medium ${statusColor[c.status]}`}>{c.status}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${riskStyle[c.risk]}`}>
                  {c.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
