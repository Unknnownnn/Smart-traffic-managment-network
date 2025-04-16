'use client';

import Header from '@/components/Header'
import { useAppContext } from '@/context/AppContext'

export default function AnalysisPage() {
  const { networkMetrics, trafficMetrics, realTimeUpdates } = useAppContext();

  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Network Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Packet Loss Rate</span>
                <span className="text-gray-100">{networkMetrics.packetLoss.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Latency</span>
                <span className="text-gray-100">{networkMetrics.latency.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Throughput</span>
                <span className="text-gray-100">{networkMetrics.throughput.toFixed(1)} Gbps</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Traffic Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Peak Hours</span>
                <span className="text-gray-100">{trafficMetrics.peakHours}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Queue Length</span>
                <span className="text-gray-100">{trafficMetrics.queueLength.toFixed(0)} vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Congestion Level</span>
                <span className="text-gray-100">{trafficMetrics.congestion}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400 text-center">
          {realTimeUpdates ? 'Real-time updates enabled' : 'Real-time updates disabled'}
        </div>
      </div>
    </main>
  )
} 