import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { livePrices } from '../data/mockData';

export default function BottomBar({ mobile }) {
  const cards = [
    {
      label: 'LIVE CATTLE — APR CME',
      shortLabel: 'LIVE CATTLE',
      value: `$${livePrices.cme.liveCattle.price.toFixed(2)}`,
      change: `+${livePrices.cme.liveCattle.change.toFixed(2)} (+${livePrices.cme.liveCattle.changePct.toFixed(2)}%)`,
      period: '30-day',
      data: livePrices.cme.liveCattle.sparkline,
      up: true,
    },
    {
      label: 'CHOICE CUTOUT — USDA AMS',
      shortLabel: 'CHOICE CUTOUT',
      value: `$${livePrices.usda.choiceCutout.price.toFixed(2)}`,
      change: `+${livePrices.usda.choiceCutout.change.toFixed(2)} (+${livePrices.usda.choiceCutout.changePct.toFixed(2)}%)`,
      period: '30-day',
      data: livePrices.usda.choiceCutout.sparkline,
      up: true,
    },
    {
      label: 'US BEEF EXPORTS — ANNUALIZED $B',
      shortLabel: 'EXPORTS',
      value: `$${livePrices.exports.value.toFixed(2)}B`,
      change: `YOY +${livePrices.exports.change}%`,
      period: '',
      data: [7.2, 7.5, 7.8, 7.9, 8.0, 8.1, 8.2, 8.34],
      up: true,
    },
    {
      label: 'FEEDER CATTLE — APR CME',
      shortLabel: 'FEEDER CATTLE',
      value: `$${livePrices.cme.feederCattle.price.toFixed(2)}`,
      change: `+${livePrices.cme.feederCattle.change.toFixed(2)} (+${livePrices.cme.feederCattle.changePct.toFixed(2)}%)`,
      period: '30-day',
      data: livePrices.cme.feederCattle.sparkline,
      up: true,
    },
  ];

  if (mobile) {
    return (
      <div className="bg-bg-secondary border-t border-border">
        <div className="grid grid-cols-2 divide-x divide-border">
          {cards.slice(0, 2).map((card, i) => (
            <MobileCard key={i} card={card} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border-t border-border">
      <div className="grid grid-cols-4 divide-x divide-border">
        {cards.map((card, i) => (
          <div key={i} className="p-3">
            <div className="text-[9px] text-text-muted mb-1 tracking-wider">{card.label}</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold text-text-primary">{card.value}</div>
                <div className={`text-[10px] mt-0.5 ${card.up ? 'text-green' : 'text-severity-high'}`}>
                  {card.up ? '\u25B2' : '\u25BC'} {card.change} {card.period && <span className="text-text-muted">{card.period}</span>}
                </div>
              </div>
              <div className="w-20 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.data.map((v, j) => ({ v, j }))}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={card.up ? '#27ae60' : '#e74c3c'}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileCard({ card }) {
  return (
    <div className="p-2">
      <div className="text-[8px] text-text-muted tracking-wider">{card.shortLabel}</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-text-primary">{card.value}</div>
          <div className={`text-[9px] ${card.up ? 'text-green' : 'text-severity-high'}`}>
            {card.up ? '\u25B2' : '\u25BC'} {card.change}
          </div>
        </div>
        <div className="w-14 h-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={card.data.map((v, j) => ({ v, j }))}>
              <Line type="monotone" dataKey="v" stroke={card.up ? '#27ae60' : '#e74c3c'} strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
