'use client';

import Header from '@/components/Header'
import { useAppContext } from '@/context/AppContext'

export default function SettingsPage() {
  const {
    simulationSpeed,
    trafficDensity,
    displayMode,
    showMetrics,
    realTimeUpdates,
    updateSettings,
  } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Settings are already updated through the individual onChange handlers
  };

  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Simulation Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Simulation Speed
                </label>
                <select
                  value={simulationSpeed}
                  onChange={(e) => updateSettings({ simulationSpeed: e.target.value as 'Slow' | 'Normal' | 'Fast' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                >
                  <option value="Slow">Slow</option>
                  <option value="Normal">Normal</option>
                  <option value="Fast">Fast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Traffic Density
                </label>
                <select
                  value={trafficDensity}
                  onChange={(e) => updateSettings({ trafficDensity: e.target.value as 'Low' | 'Medium' | 'High' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Mode
                </label>
                <select
                  value={displayMode}
                  onChange={(e) => updateSettings({ displayMode: e.target.value as 'Dark' | 'Light' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                >
                  <option value="Dark">Dark</option>
                  <option value="Light">Light</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showMetrics}
                    onChange={(e) => updateSettings({ showMetrics: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-300">Show Performance Metrics</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={realTimeUpdates}
                    onChange={(e) => updateSettings({ realTimeUpdates: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-300">Enable Real-time Updates</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 