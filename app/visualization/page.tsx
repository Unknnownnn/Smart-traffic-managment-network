'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header'
import { useAppContext } from '@/context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function VisualizationPage() {
  const { networkMetrics, trafficMetrics } = useAppContext();
  const [timeSeries, setTimeSeries] = useState<{
    labels: string[];
    packetLoss: number[];
    latency: number[];
    throughput: number[];
  }>({
    labels: [],
    packetLoss: [],
    latency: [],
    throughput: [],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setTimeSeries(prev => {
        const newLabels = [...prev.labels, now].slice(-20);
        const newPacketLoss = [...prev.packetLoss, networkMetrics.packetLoss].slice(-20);
        const newLatency = [...prev.latency, networkMetrics.latency].slice(-20);
        const newThroughput = [...prev.throughput, networkMetrics.throughput].slice(-20);

        return {
          labels: newLabels,
          packetLoss: newPacketLoss,
          latency: newLatency,
          throughput: newThroughput,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [networkMetrics]);

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF',
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      x: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
    },
  };

  const lineChartData = {
    labels: timeSeries.labels,
    datasets: [
      {
        label: 'Packet Loss (%)',
        data: timeSeries.packetLoss,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        label: 'Latency (ms)',
        data: timeSeries.latency,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Throughput (Gbps)',
        data: timeSeries.throughput,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
    ],
  };

  const congestionData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [
          trafficMetrics.congestion === 'Low' ? 1 : 0,
          trafficMetrics.congestion === 'Medium' ? 1 : 0,
          trafficMetrics.congestion === 'High' ? 1 : 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF',
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Network Performance</h2>
            <div className="h-[300px]">
              <Line options={lineChartOptions} data={lineChartData} />
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Traffic Congestion</h2>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-64 h-64">
                <Doughnut data={congestionData} options={doughnutOptions} />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Queue Length Distribution</h2>
            <div className="h-[300px]">
              <Line
                options={{
                  ...lineChartOptions,
                  scales: {
                    ...lineChartOptions.scales,
                    y: {
                      ...lineChartOptions.scales.y,
                      min: 0,
                      max: 20,
                    },
                  },
                }}
                data={{
                  labels: timeSeries.labels,
                  datasets: [
                    {
                      label: 'Queue Length (vehicles)',
                      data: timeSeries.labels.map(() => trafficMetrics.queueLength),
                      borderColor: 'rgb(168, 85, 247)',
                      backgroundColor: 'rgba(168, 85, 247, 0.5)',
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 