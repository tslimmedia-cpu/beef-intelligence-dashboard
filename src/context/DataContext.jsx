import React, { createContext, useContext, useState, useEffect } from 'react';
import * as mockData from '../data/mockData';

const DataContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function DataProvider({ children }) {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setLiveData(data);
      } catch (err) {
        console.warn('Live API unavailable, using mock data:', err.message);
        setLiveData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Merge live data over mock fallbacks
  const value = {
    livePrices: liveData?.livePrices || mockData.livePrices,
    tickerItems: liveData?.tickerItems?.length > 0 ? liveData.tickerItems : mockData.tickerItems,
    alerts: liveData?.alerts?.length > 0 ? liveData.alerts : mockData.alerts,
    intelFeed: liveData?.intelFeed?.length > 0 ? liveData.intelFeed : mockData.intelFeed,
    usdaData: liveData?.usdaData || mockData.usdaData,
    tradeFlowData: liveData?.tradeFlowData || mockData.tradeFlowData,
    mapMarkers: liveData?.mapMarkers?.length > 0 ? liveData.mapMarkers : mockData.mapMarkers,
    mapLayers: mockData.mapLayers,
    settlementData: mockData.settlementData,
    aiAnalystSuggestions: mockData.aiAnalystSuggestions,
    beefnewsArticles: liveData?.beefnewsArticles?.length > 0 ? liveData.beefnewsArticles : [],
    meta: liveData?.meta || null,
    loading,
    isLive: !!liveData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    // Fallback when used outside provider
    return {
      livePrices: mockData.livePrices,
      tickerItems: mockData.tickerItems,
      alerts: mockData.alerts,
      intelFeed: mockData.intelFeed,
      usdaData: mockData.usdaData,
      tradeFlowData: mockData.tradeFlowData,
      mapMarkers: mockData.mapMarkers,
      mapLayers: mockData.mapLayers,
      settlementData: mockData.settlementData,
      aiAnalystSuggestions: mockData.aiAnalystSuggestions,
      loading: false,
      isLive: false,
    };
  }
  return ctx;
}
