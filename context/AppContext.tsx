'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  simulationSpeed: 'Slow' | 'Normal' | 'Fast';
  trafficDensity: 'Low' | 'Medium' | 'High';
  displayMode: 'Dark' | 'Light';
  showMetrics: boolean;
  realTimeUpdates: boolean;
  networkMetrics: {
    packetLoss: number;
    latency: number;
    throughput: number;
  };
  trafficMetrics: {
    peakHours: string;
    queueLength: number;
    congestion: 'Low' | 'Medium' | 'High';
  };
  updateSettings: (settings: Partial<Omit<AppContextType, 'updateSettings' | 'networkMetrics' | 'trafficMetrics'>>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    simulationSpeed: 'Normal' as const,
    trafficDensity: 'Medium' as const,
    displayMode: 'Dark' as const,
    showMetrics: true,
    realTimeUpdates: true,
  });

  const [networkMetrics, setNetworkMetrics] = useState({
    packetLoss: 0.2,
    latency: 45,
    throughput: 1.2,
  });

  const [trafficMetrics, setTrafficMetrics] = useState({
    peakHours: '9:00 AM - 5:00 PM',
    queueLength: 8,
    congestion: 'Medium' as const,
  });

  useEffect(() => {
    if (!settings.realTimeUpdates) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setNetworkMetrics(prev => ({
        packetLoss: Math.max(0, Math.min(1, prev.packetLoss + (Math.random() - 0.5) * 0.1)),
        latency: Math.max(20, Math.min(100, prev.latency + (Math.random() - 0.5) * 10)),
        throughput: Math.max(0.5, Math.min(2, prev.throughput + (Math.random() - 0.5) * 0.2)),
      }));

      setTrafficMetrics(prev => ({
        ...prev,
        queueLength: Math.max(0, Math.min(20, prev.queueLength + (Math.random() - 0.5) * 2)),
        congestion: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.realTimeUpdates]);

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider value={{
      ...settings,
      networkMetrics,
      trafficMetrics,
      updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 