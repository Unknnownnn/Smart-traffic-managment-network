import { useEffect, useRef, useState } from "react"
import { TrafficLightNode } from "@/lib/traffic-light-node"
import TrafficLight from "./traffic-light"

interface TrafficNetworkProps {
  nodes: { [key: string]: TrafficLightNode }
  onSimulateFailure: (id: string) => void
  onReviveNode: (id: string) => void
}

interface NodePosition {
  x: number
  y: number
}

interface DragState {
  nodeId: string | null
  startX: number
  startY: number
  originalX: number
  originalY: number
}

export default function TrafficNetwork({ nodes, onSimulateFailure, onReviveNode }: TrafficNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodePositions = useRef<{ [key: string]: NodePosition }>({})
  const [dragState, setDragState] = useState<DragState>({ nodeId: null, startX: 0, startY: 0, originalX: 0, originalY: 0 })
  const [timeToChange, setTimeToChange] = useState<{ [key: string]: number }>({})
  const [heartbeatNodes, setHeartbeatNodes] = useState<{ [key: string]: boolean }>({})

  // Listen for heartbeat events
  useEffect(() => {
    const handleHeartbeat = (nodeId: string) => {
      setHeartbeatNodes(prev => ({ ...prev, [nodeId]: true }))
      setTimeout(() => {
        setHeartbeatNodes(prev => ({ ...prev, [nodeId]: false }))
      }, 500) // Reset after animation duration
    }

    // Subscribe to heartbeat events from each node
    Object.values(nodes).forEach(node => {
      node.onHeartbeat = handleHeartbeat
    })

    return () => {
      // Cleanup subscriptions
      Object.values(nodes).forEach(node => {
        node.onHeartbeat = undefined
      })
    }
  }, [nodes])

  // Calculate node positions in a grid-like pattern
  const calculateNodePositions = () => {
    const positions: { [key: string]: NodePosition } = {}
    const nodeIds = Object.keys(nodes)
    const gridSize = Math.ceil(Math.sqrt(nodeIds.length))
    const spacing = 150 // Reduced spacing between nodes
    
    nodeIds.forEach((id, index) => {
      if (nodePositions.current[id]) {
        // Keep existing position if the node already exists
        positions[id] = nodePositions.current[id]
      } else {
        const row = Math.floor(index / gridSize)
        const col = index % gridSize
        // Add some randomness to make it look more organic
        const randomOffset = 20
        positions[id] = {
          x: col * spacing + (Math.random() * randomOffset - randomOffset/2),
          y: row * spacing + (Math.random() * randomOffset - randomOffset/2)
        }
      }
    })
    
    nodePositions.current = positions
  }

  // Draw connections between nodes
  const drawConnections = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#4b5563" // gray-600
    ctx.lineWidth = 2

    Object.keys(nodePositions.current).forEach((id, i) => {
      const pos = nodePositions.current[id]
      const otherNodes = Object.keys(nodePositions.current)
        .filter(otherId => otherId !== id)
        .sort((a, b) => {
          const distA = Math.hypot(
            nodePositions.current[a].x - pos.x,
            nodePositions.current[a].y - pos.y
          )
          const distB = Math.hypot(
            nodePositions.current[b].x - pos.x,
            nodePositions.current[b].y - pos.y
          )
          return distA - distB
        })
        .slice(0, Math.floor(Math.random() * 2) + 2)

      otherNodes.forEach(otherId => {
        const otherPos = nodePositions.current[otherId]
        ctx.beginPath()
        ctx.moveTo(pos.x + 20, pos.y + 50) // Adjusted for smaller node size
        ctx.lineTo(otherPos.x + 20, otherPos.y + 50)
        ctx.stroke()
      })
    })
  }

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top
    const originalX = nodePositions.current[nodeId].x
    const originalY = nodePositions.current[nodeId].y

    setDragState({ nodeId, startX, startY, originalX, originalY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.nodeId || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const deltaX = x - dragState.startX
    const deltaY = y - dragState.startY

    nodePositions.current[dragState.nodeId] = {
      x: dragState.originalX + deltaX,
      y: dragState.originalY + deltaY
    }

    drawConnections()
  }

  const handleMouseUp = () => {
    setDragState({ nodeId: null, startX: 0, startY: 0, originalX: 0, originalY: 0 })
  }

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeToChange: { [key: string]: number } = {}
      Object.entries(nodes).forEach(([id, node]) => {
        let timeLeft = 0
        switch (node.currentState) {
          case "RED":
            timeLeft = node.RED_DURATION - ((Date.now() - node.lastStateChange) % node.RED_DURATION)
            break
          case "GREEN":
            timeLeft = node.GREEN_DURATION - ((Date.now() - node.lastStateChange) % node.GREEN_DURATION)
            break
          case "YELLOW":
            timeLeft = node.YELLOW_DURATION - ((Date.now() - node.lastStateChange) % node.YELLOW_DURATION)
            break
        }
        newTimeToChange[id] = timeLeft
      })
      setTimeToChange(newTimeToChange)
    }, 1000)

    return () => clearInterval(interval)
  }, [nodes])

  // Update canvas size and redraw on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.offsetWidth
        canvasRef.current.height = containerRef.current.offsetHeight
        drawConnections()
      }
    }

    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  // Recalculate positions and redraw when nodes change
  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      calculateNodePositions()
      canvasRef.current.width = containerRef.current.offsetWidth
      canvasRef.current.height = containerRef.current.offsetHeight
      drawConnections()
    }
  }, [nodes])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-[600px] bg-gray-900 rounded-lg p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      {Object.entries(nodes).map(([id, node]) => (
        <div
          key={id}
          className={`absolute cursor-move transition-transform duration-500 ${
            heartbeatNodes[id] ? 'scale-110' : 'scale-100'
          }`}
          style={{
            left: `${nodePositions.current[id]?.x || 0}px`,
            top: `${nodePositions.current[id]?.y || 0}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e, id)}
        >
          <TrafficLight 
            state={node.currentState} 
            nodeId={id} 
            isDisabled={node.isDisabled}
            timeToChange={timeToChange[id]}
          />
          {node.isDisabled ? (
            <button
              className="mt-1 px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md w-full"
              onClick={() => onReviveNode(id)}
            >
              Revive Node
            </button>
          ) : (
            <button
              className="mt-1 px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-md w-full"
              onClick={() => onSimulateFailure(id)}
            >
              Simulate Failure
            </button>
          )}
        </div>
      ))}
    </div>
  )
} 