'use client';

import TrafficLightSimulation from "@/components/traffic-light-simulation"
import Header from '@/components/Header'

export default function SimulationPage() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrafficLightSimulation />
      </div>
    </main>
  )
} 