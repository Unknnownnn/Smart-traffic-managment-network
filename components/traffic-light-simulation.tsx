"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrafficLightNode } from "@/lib/traffic-light-node"
import { TrafficLightServer } from "@/lib/traffic-light-server"
import TrafficLightComponent from "@/components/traffic-light"
import { Input } from "@/components/ui/input"
import TrafficNetwork from "./traffic-network"
import { useAppContext } from '@/context/AppContext'

type LightState = 'red' | 'yellow' | 'green'
type Direction = 'north' | 'south' | 'east' | 'west'

interface Light {
  x: number
  y: number
  state: LightState
}

interface Vehicle {
  x: number
  y: number
  direction: Direction
}

interface SimulationState {
  lights: Light[]
  vehicles: Vehicle[]
  timer: number
}

export default function TrafficLightSimulation() {
  const [server, setServer] = useState<TrafficLightServer | null>(null)
  const [nodes, setNodes] = useState<{ [key: string]: TrafficLightNode }>({})
  const [logs, setLogs] = useState<string[]>([])
  const [nodeId, setNodeId] = useState("Node4")
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { simulationSpeed, trafficDensity } = useAppContext()

  // Initialize server and initial nodes
  useEffect(() => {
    const newServer = new TrafficLightServer((log: string) => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])
    })

    // Create initial nodes
    const initialNodes: { [key: string]: TrafficLightNode } = {}
    for (let i = 1; i <= 3; i++) {
      const id = `Node${i}`
      initialNodes[id] = new TrafficLightNode(id, newServer, (log: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])
      })
    }

    // Set up initial connections (in a ring topology)
    newServer.registerConnection("Node1", "Node2")
    newServer.registerConnection("Node2", "Node3")
    newServer.registerConnection("Node3", "Node1")

    // Register neighbors for each node
    initialNodes["Node1"].addNeighbor("Node2")
    initialNodes["Node1"].addNeighbor("Node3")
    initialNodes["Node2"].addNeighbor("Node1")
    initialNodes["Node2"].addNeighbor("Node3")
    initialNodes["Node3"].addNeighbor("Node1")
    initialNodes["Node3"].addNeighbor("Node2")

    setServer(newServer)
    setNodes(initialNodes)
    newServer.setNodes(initialNodes)

    return () => {
      // Cleanup
      Object.values(initialNodes).forEach((node) => node.stop())
    }
  }, [])

  // Update server's node references when nodes change
  useEffect(() => {
    if (server) {
      server.setNodes(nodes)
    }
  }, [nodes, server])

  // Auto-scroll logs only when shouldAutoScroll is true
  useEffect(() => {
    if (!shouldAutoScroll) return;

    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea || !logsEndRef.current) return;

    const { clientHeight, scrollHeight } = scrollArea as HTMLDivElement;
    if (scrollHeight > clientHeight) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, shouldAutoScroll]);

  // Add scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea as HTMLDivElement;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setShouldAutoScroll(isAtBottom);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);

  // Format log message with special styling for timing adjustments
  const formatLogMessage = (log: string) => {
    if (log.includes("Adjusted timings")) {
      return (
        <span className="font-bold text-orange-400">
          {log}
        </span>
      )
    }
    return <span className="text-gray-300">{log}</span>
  }

  const addNode = () => {
    if (!nodeId.trim() || nodes[nodeId] || !server) return

    const newNode = new TrafficLightNode(nodeId, server, (log: string) => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])
    })

    // Find closest existing nodes to connect to (2-3 connections)
    const existingNodes = Object.keys(nodes)
    if (existingNodes.length > 0) {
      // Connect to 2-3 closest nodes (for this example, we'll connect to the last 2-3 nodes)
      const connectTo = existingNodes.slice(-Math.min(3, existingNodes.length))
      
      connectTo.forEach(existingNodeId => {
        server.registerConnection(nodeId, existingNodeId)
        newNode.addNeighbor(existingNodeId)
        nodes[existingNodeId].addNeighbor(nodeId)
      })
    }

    setNodes((prev) => ({ ...prev, [nodeId]: newNode }))

    // Increment the default node ID
    const match = nodeId.match(/^Node(\d+)$/)
    if (match) {
      const num = Number.parseInt(match[1])
      setNodeId(`Node${num + 1}`)
    }
  }

  const simulateFailure = (id: string) => {
    if (nodes[id]) {
      nodes[id].simulateFailure()
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Simulating failure for node ${id}`])
    }
  }

  const reviveNode = (id: string) => {
    if (nodes[id]) {
      nodes[id].revive()
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Reviving node ${id}`])
    }
  }

  const isHeartbeatStale = (timestamp: number) => {
    return Date.now() - timestamp > 8000 // 8 seconds threshold
  }

  // Get all nodes that should appear in the heartbeats section
  const getAllHeartbeatNodes = () => {
    if (!server) return []
    
    // Combine active nodes from heartbeatMap with all known nodes
    const allNodes = new Set([
      ...Object.keys(nodes),
      ...Object.keys(server.heartbeatMap)
    ])
    
    return Array.from(allNodes).sort().map(nodeId => ({
      nodeId,
      timestamp: server.heartbeatMap[nodeId] || 0 // Use 0 for nodes that have never sent a heartbeat
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
        <CardContent>
          <TrafficNetwork
            nodes={nodes}
            onSimulateFailure={simulateFailure}
            onReviveNode={reviveNode}
          />

          <div className="mt-6 flex gap-2">
            <Input
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              placeholder="Node ID"
              className="max-w-[200px] bg-gray-800 border-gray-700 text-gray-100"
            />
            <Button onClick={addNode} variant="secondary" className="bg-gray-800 text-gray-100 hover:bg-gray-700">
              Add Node
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:row-span-2 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100">Master Controller</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="logs" className="flex-1 data-[state=active]:bg-gray-700">
                Logs
              </TabsTrigger>
              <TabsTrigger value="heartbeats" className="flex-1 data-[state=active]:bg-gray-700">
                Heartbeats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="mt-4">
              <ScrollArea 
                ref={scrollAreaRef}
                className="h-[500px] border border-gray-800 rounded-md p-4 bg-gray-800/50"
              >
                {logs.map((log, index) => (
                  <div key={index} className="text-sm mb-1">
                    {formatLogMessage(log)}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="heartbeats" className="mt-4">
              <ScrollArea className="h-[500px] border border-gray-800 rounded-md p-4 bg-gray-800/50">
                {server && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-100">Active Nodes</h3>
                    {getAllHeartbeatNodes().length > 0 ? (
                      getAllHeartbeatNodes().map(({ nodeId, timestamp }) => {
                        const isStale = timestamp === 0 || isHeartbeatStale(timestamp)
                        return (
                          <div key={nodeId} className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className={`${isStale ? 'text-red-500 font-bold' : 'text-gray-200'}`}>
                              {nodeId}
                            </span>
                            <span className={`text-sm ${isStale ? 'text-red-400' : 'text-gray-400'}`}>
                              {timestamp === 0 ? 
                                'No heartbeat received' : 
                                `Last heartbeat: ${new Date(timestamp).toLocaleTimeString()}`
                              }
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-gray-400">No nodes</div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

