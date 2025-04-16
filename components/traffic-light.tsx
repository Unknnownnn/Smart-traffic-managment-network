"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { LightState } from "@/lib/traffic-light-node"

interface TrafficLightProps {
  state: LightState
  nodeId: string
  isDisabled?: boolean
  timeToChange?: number
}

export default function TrafficLight({ state, nodeId, isDisabled = false, timeToChange }: TrafficLightProps) {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  // Generate a constant MAC address for each node using useMemo
  const macAddress = useMemo(() => {
    const nodeNum = parseInt(nodeId.replace(/\D/g, '')) || 0;
    const seed = nodeNum * 1234567;
    const random = (max: number) => Math.floor((Math.sin(seed * (max + 1)) + 1) * max / 2);
    
    return `00:${nodeNum.toString(16).padStart(2, '0')}:${random(255).toString(16).padStart(2, '0')}:${random(255).toString(16).padStart(2, '0')}:${random(255).toString(16).padStart(2, '0')}:${random(255).toString(16).padStart(2, '0')}`;
  }, [nodeId]);

  // Determine if the light is about to change (within 1.5 seconds)
  const isAboutToChange = timeToChange !== undefined && timeToChange <= 1500;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center relative" ref={infoRef}>
      <div className="text-center text-xs font-medium text-gray-300 mb-1 tracking-wide">{nodeId}</div>
      {timeToChange !== undefined && (
        <div className="text-[10px] text-gray-400 mb-1 opacity-75">{Math.ceil(timeToChange / 1000)}s</div>
      )}
      <div 
        className={`bg-gray-800/80 backdrop-blur-sm p-2 rounded-xl flex flex-col gap-2 items-center ${isDisabled ? "opacity-50" : ""} transition-opacity duration-200 hover:opacity-90`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setShowInfo(true);
        }}
      >
        <div
          className={`w-8 h-8 rounded-full transition-all duration-300 ${
            state === LightState.RED 
              ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
              : "bg-red-900"
          } ${isAboutToChange && state === LightState.RED ? "animate-blink" : ""}`}
        />
        <div
          className={`w-8 h-8 rounded-full transition-all duration-300 ${
            state === LightState.YELLOW 
              ? "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" 
              : "bg-yellow-900"
          } ${isAboutToChange && state === LightState.YELLOW ? "animate-blink" : ""}`}
        />
        <div
          className={`w-8 h-8 rounded-full transition-all duration-300 ${
            state === LightState.GREEN 
              ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
              : "bg-green-900"
          } ${isAboutToChange && state === LightState.GREEN ? "animate-blink" : ""}`}
        />
      </div>
      
      {showInfo && (
        <div className="absolute top-full mt-3 bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-10 w-52 border border-gray-700/50">
          <div className="text-xs text-gray-300 space-y-3">
            <p className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${isDisabled ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {isDisabled ? 'Inactive' : 'Active'}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-400">State</span>
              <span className="font-medium">{state}</span>
            </p>
            <div className="pt-1 border-t border-gray-700/50">
              <p className="text-[10px] text-gray-400 font-medium mb-1">MAC Address</p>
              <p className="font-mono text-[11px] text-gray-300 break-all">{macAddress}</p>
            </div>
            <p className="flex justify-between items-center">
              <span className="text-gray-400">Next Change</span>
              <span className="font-medium">{timeToChange ? `${Math.ceil(timeToChange / 1000)}s` : 'N/A'}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

