import { useState } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import IntelligenceMap from './components/IntelligenceMap';
import RightPanel from './components/RightPanel';
import BottomTicker from './components/PriceTicker';
import { DataProvider } from './context/DataContext';

export default function App() {
  const [activeView, setActiveView] = useState('intel');

  return (
    <DataProvider>
      <div className="h-screen overflow-hidden bg-surface text-on-surface">
        <Header activeView={activeView} onViewChange={setActiveView} />
        <LeftSidebar />
        <div className="fixed left-72 right-80 top-20 bottom-12 overflow-hidden">
          <IntelligenceMap />
        </div>
        <RightPanel activeView={activeView} />
        <BottomTicker />
      </div>
    </DataProvider>
  );
}
