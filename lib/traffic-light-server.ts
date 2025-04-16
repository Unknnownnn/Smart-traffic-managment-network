"use client"

import { TrafficLightNode } from "./traffic-light-node"

export class TrafficLightServer {
  public heartbeatMap: { [nodeId: string]: number } = {}
  private readonly HEARTBEAT_TIMEOUT = 10 * 1000 // 10 seconds
  private heartbeatMonitorInterval: NodeJS.Timeout | null = null
  private logCallback: (log: string) => void
  private nodeConnections: Map<string, Set<string>> = new Map() // Track node connections
  private nodes: { [key: string]: TrafficLightNode } = {} // Store node references

  constructor(logCallback: (log: string) => void) {
    this.logCallback = logCallback
    this.startHeartbeatMonitor()
    this.log("TrafficLightServer started")
  }

  // Set the nodes map from the simulation
  public setNodes(nodes: { [key: string]: TrafficLightNode }): void {
    this.nodes = nodes
  }

  public receiveHeartbeat(nodeId: string): void {
    this.heartbeatMap[nodeId] = Date.now()
    this.log(`Received heartbeat from node ${nodeId}`)
  }

  // Register a connection between two nodes
  public registerConnection(node1: string, node2: string): void {
    // Initialize sets if they don't exist
    if (!this.nodeConnections.has(node1)) {
      this.nodeConnections.set(node1, new Set())
    }
    if (!this.nodeConnections.has(node2)) {
      this.nodeConnections.set(node2, new Set())
    }

    // Add bidirectional connection
    this.nodeConnections.get(node1)!.add(node2)
    this.nodeConnections.get(node2)!.add(node1)
  }

  // Get connected nodes for a given node
  public getConnectedNodes(nodeId: string): string[] {
    return Array.from(this.nodeConnections.get(nodeId) || [])
  }

  // Notify neighbors when a node fails
  public notifyNodeFailure(nodeId: string): void {
    const connectedNodes = this.getConnectedNodes(nodeId)
    connectedNodes.forEach(neighborId => {
      const node = this.getNode(neighborId)
      if (node) {
        node.updateNeighborStatus(nodeId, true)
      }
    })
    this.log(`Notified ${connectedNodes.length} nodes about failure of ${nodeId}`)
  }

  // Notify neighbors when a node revives
  public notifyNodeRevival(nodeId: string): void {
    const connectedNodes = this.getConnectedNodes(nodeId)
    connectedNodes.forEach(neighborId => {
      const node = this.getNode(neighborId)
      if (node) {
        node.updateNeighborStatus(nodeId, false)
      }
    })
    this.log(`Notified ${connectedNodes.length} nodes about revival of ${nodeId}`)
  }

  // Get a node instance by ID
  private getNode(nodeId: string): TrafficLightNode | null {
    return this.nodes[nodeId] || null
  }

  private startHeartbeatMonitor(): void {
    this.heartbeatMonitorInterval = setInterval(() => {
      const now = Date.now()
      Object.entries(this.heartbeatMap).forEach(([nodeId, timestamp]) => {
        if (now - timestamp > this.HEARTBEAT_TIMEOUT) {
          this.log(`Node ${nodeId} FAILED: No heartbeat for ${this.HEARTBEAT_TIMEOUT / 1000} seconds`)
          // Node stays in the map but is marked as stale by its timestamp
        }
      })
    }, 2000)
  }

  public stop(): void {
    if (this.heartbeatMonitorInterval) {
      clearInterval(this.heartbeatMonitorInterval)
    }
  }

  private log(message: string): void {
    this.logCallback(message)
  }
}

