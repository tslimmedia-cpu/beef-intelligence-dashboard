import { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AIAnalystTab() {
  const { aiAnalystSuggestions } = useData();
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [groqActive, setGroqActive] = useState(null); // null=unknown, true=live, false=simulated
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'BEEFMAPS INTEL AI Analyst online. I have live access to CME futures, USDA AMS cutout prices, drought conditions, wildfire perimeters, and regulatory filings. Ask anything about the beef market.',
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (q) => {
    const question = (q || query).trim();
    if (!question || isTyping) return;

    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.fallback) {
        setGroqActive(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: getSimulatedResponse(question),
          note: data.hint || 'Add GROQ_API_KEY to .env for live AI',
        }]);
      } else {
        setGroqActive(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          model: data.model,
          live: true,
        }]);
      }
    } catch {
      setGroqActive(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: getSimulatedResponse(question),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Status bar */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        {groqActive === true && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[9px] text-tertiary font-headline uppercase tracking-widest">Groq · Llama 3.3 70B · Live</span>
          </>
        )}
        {groqActive === false && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="text-[9px] text-secondary font-headline uppercase tracking-widest">Simulated — add GROQ_API_KEY to activate</span>
          </>
        )}
        {groqActive === null && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            <span className="text-[9px] text-outline font-headline uppercase tracking-widest">AI Analyst</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'ml-6' : ''}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-headline font-bold tracking-widest uppercase ${
                msg.role === 'user' ? 'text-tertiary' : msg.live ? 'text-secondary' : 'text-outline'
              }`}>
                {msg.role === 'user' ? 'You' : msg.live ? '⚡ AI Analyst' : 'AI Analyst'}
              </span>
              {msg.model && (
                <span className="text-[8px] text-outline opacity-60 font-mono">
                  {msg.model.replace('llama-', 'llama').replace('-versatile', '')}
                </span>
              )}
            </div>
            <p className={`text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'text-on-surface bg-surface-container-high p-3 rounded-xl'
                : 'text-on-surface-variant'
            }`}>
              {msg.content}
            </p>
            {msg.note && (
              <p className="text-[9px] text-outline mt-1 italic">{msg.note}</p>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-headline font-bold tracking-widest uppercase text-secondary">AI Analyst</span>
            </div>
            <div className="flex gap-1 items-center py-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-secondary opacity-60"
                  style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions — only on first load */}
      {messages.length <= 1 && !isTyping && (
        <div className="px-4 pb-3">
          <div className="text-[9px] text-outline mb-2 uppercase tracking-widest font-headline">Try asking:</div>
          <div className="space-y-1">
            {aiAnalystSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(s)}
                className="w-full text-left text-[10px] text-on-surface-variant hover:text-secondary hover:bg-surface-container-high p-2 rounded-lg transition-colors"
              >
                &ldquo;{s}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isTyping && handleSubmit()}
            placeholder="Ask about markets, regulations, foreign ownership..."
            disabled={isTyping}
            className="flex-1 bg-surface-container-lowest border border-white/5 rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary/40 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={isTyping || !query.trim()}
            className="bg-gradient-to-r from-secondary-container to-secondary text-on-secondary px-4 py-2 rounded-lg text-xs font-headline font-bold hover:brightness-110 transition-all disabled:opacity-40"
          >
            {isTyping ? '...' : 'Ask'}
          </button>
        </div>
        <div className="text-[8px] text-outline mt-2">
          {groqActive
            ? 'Powered by Groq · Llama 3.3 70B · Context: live market data + regulatory filings'
            : 'Add GROQ_API_KEY to .env for live LLM · console.groq.com (free)'}
        </div>
      </div>
    </div>
  );
}

function getSimulatedResponse(question) {
  const q = question.toLowerCase();
  if (q.includes('foreign') || q.includes('jbs') || q.includes('brazil')) {
    return 'JBS S.A. — the world\'s largest beef packer — is Brazilian-owned (J&F Investimentos). Its US subsidiary JBS USA operates plants in Greeley CO, Grand Island NE, Cactus TX, and others. USDA contracts with JBS USA are visible on USASpending.gov.\n\nThe foreign ownership question is significant: JBS controls ~25% of US beef processing capacity. J&F Investimentos, the parent, was involved in a major bribery scandal in Brazil (Lava Jato investigation). NCBA and other industry groups have lobbied against labeling requirements that would disclose foreign ownership.\n\nSources: SEC EDGAR, USASpending.gov, DOJ FARA registrations';
  }
  if (q.includes('basis') || q.includes('futures')) {
    return 'Live cattle basis is the spread between cash and CME futures prices. Currently watching the June CME contract.\n\nKey basis drivers: (1) Tight cattle supplies — on-feed inventories at multi-year lows, (2) Packer margins compressed — Choice/Select spread signals packer buying behavior, (3) Seasonal: summer grilling demand historically narrows basis.\n\nSources: CME Group, USDA AMS Daily Reports';
  }
  if (q.includes('lobbying') || q.includes('ncba')) {
    return 'NCBA (National Cattlemen\'s Beef Association) is the primary lobbying arm for the beef industry. Recent filings show expenditures directed at:\n\n• USDA-FSIS: Opposing enhanced inspection requirements\n• USDA-AMS: Fighting mandatory country-of-origin labeling (COOL)\n• Congress: Agricultural appropriations and farm bill provisions\n\nFor current figures, check OpenSecrets.org for NCBA lobbying disclosures. FARA registrations for foreign-funded agricultural lobbying are searchable at efts.justice.gov.\n\nSources: OpenSecrets, DOJ FARA database';
  }
  if (q.includes('fsis') || q.includes('inspection') || q.includes('line speed')) {
    return 'FSIS (Food Safety Inspection Service) is currently considering proposed rules on line speed increases under the New Swine Slaughter Inspection System. Related beef processing rules are tracked in the Federal Register.\n\nKey controversies: (1) New Poultry Inspection System line speed increases have been challenged by food safety advocates, (2) FSIS inspector staffing shortages have been documented through FOIA requests, (3) The "Product of USA" labeling rule is in a comment period.\n\nCheck the Federal Register (federalregister.gov) filtered by FSIS for current proposed rules.\n\nSources: Federal Register, FSIS FOIA logs';
  }
  if (q.includes('drought') || q.includes('panhandle')) {
    return 'Current US drought conditions (NOAA/USDM data): D3-D4 (Extreme to Exceptional) covers 17%+ of US land. Texas Panhandle and eastern New Mexico remain primary affected zones.\n\nBeef supply chain impact: (1) Early marketings up in drought-affected areas as pasture conditions deteriorate, (2) Feedlot placements elevated as ranchers destock, (3) Water costs increasing for confined feeding operations.\n\nSources: NOAA Drought Monitor, USDA NASS Crop Progress';
  }
  return 'Based on current BEEFMAPS INTEL data:\n\n• CME Live Cattle: Monitoring June contract for directional moves\n• USDA Choice Cutout: $391+ range — elevated vs historical norms\n• Drought: D3-D4 conditions impacting Great Plains operations\n• Regulatory: FSIS proposed rules active in Federal Register\n\nFor live LLM responses with full market context, add GROQ_API_KEY to your .env file (free at console.groq.com).\n\nAsk a specific question for deeper analysis.';
}
