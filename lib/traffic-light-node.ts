"use client"

import type { TrafficLightServer } from "./traffic-light-server"

export enum LightState {
  RED = "RED",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
}

export class TrafficLightNode {
  private readonly HEARTBEAT_INTERVAL = 3000 // 3 seconds
  private readonly BASE_RED_DURATION = 10000 // Base duration
  private readonly BASE_GREEN_DURATION = 10000 // Base duration
  private readonly BASE_YELLOW_DURATION = 3000 // Fixed yellow duration

  private active = true
  private server: TrafficLightServer
  private heartbeatInterval: NodeJS.Timeout | null = null
  private stateUpdateInterval: NodeJS.Timeout | null = null
  private logCallback: (log: string) => void
  private neighbors: Set<string> = new Set() // Store neighbor node IDs
  private failedNeighbors: Set<string> = new Set() // Track failed neighbors

  public nodeId: string
  public currentState: LightState
  public isDisabled: boolean = false
  public lastStateChange: number = Date.now()
  public onHeartbeat?: (nodeId: string) => void

  // Dynamic durations based on network state
  public RED_DURATION: number = 10000
  public GREEN_DURATION: number = 10000
  public readonly YELLOW_DURATION: number = 3000 // Yellow remains fixed for safety

  constructor(nodeId: string, server: TrafficLightServer, logCallback: (log: string) => void) {
    this.nodeId = nodeId
    this.server = server
    this.logCallback = logCallback

    // Set initial state based on node ID to create a pattern
    if (nodeId === "Node1") {
      this.currentState = LightState.RED
    } else if (nodeId === "Node2") {
      this.currentState = LightState.GREEN
    } else if (nodeId === "Node3") {
      this.currentState = LightState.RED
    } else {
      // For additional nodes, set initial state based on position
      const nodeNum = Number.parseInt(nodeId.substring(4))
      this.currentState = nodeNum % 3 === 2 ? LightState.GREEN : LightState.RED
    }

    this.log(`Traffic light initialized to ${this.currentState}`)
    this.start()
  }

  private start(): void {
    this.startHeartbeatSender()
    this.startTrafficLightStateUpdater()
  }

  private startHeartbeatSender(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.active) {
        this.sendHeartbeat()
      }
    }, this.HEARTBEAT_INTERVAL)

    // Send initial heartbeat
    this.sendHeartbeat()
  }

  private sendHeartbeat(): void {
    this.server.receiveHeartbeat(this.nodeId)
    this.log(`Sent heartbeat from node ${this.nodeId}`)
    this.onHeartbeat?.(this.nodeId)
  }

  private startTrafficLightStateUpdater(): void {
    const updateState = async () => {
      if (!this.active) return

      switch (this.currentState) {
        case LightState.RED:
          await this.delay(this.RED_DURATION)
          if (this.active) {
            this.currentState = LightState.GREEN
            this.lastStateChange = Date.now()
            this.log(`Traffic light changed to ${this.currentState}`)
          }
          break

        case LightState.GREEN:
          await this.delay(this.GREEN_DURATION)
          if (this.active) {
            this.currentState = LightState.YELLOW
            this.lastStateChange = Date.now()
            this.log(`Traffic light changed to ${this.currentState}`)
          }
          break

        case LightState.YELLOW:
          await this.delay(this.YELLOW_DURATION)
          if (this.active) {
            this.currentState = LightState.RED
            this.lastStateChange = Date.now()
            this.log(`Traffic light changed to ${this.currentState}`)
          }
          break
      }

      if (this.active) {
        updateState()
      }
    }

    updateState()
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.stateUpdateInterval = setTimeout(resolve, ms)
    })
  }

  // Add neighbor connections
  public addNeighbor(nodeId: string): void {
    this.neighbors.add(nodeId)
  }

  // Remove neighbor connections
  public removeNeighbor(nodeId: string): void {
    this.neighbors.delete(nodeId)
    this.failedNeighbors.delete(nodeId)
    this.adjustTimings()
  }

  // Update neighbor status and adjust timings
  public updateNeighborStatus(nodeId: string, failed: boolean): void {
    if (failed) {
      this.failedNeighbors.add(nodeId)
    } else {
      this.failedNeighbors.delete(nodeId)
    }
    this.adjustTimings()
  }

  // Adjust timings based on network state
  private adjustTimings(): void {
    if (this.failedNeighbors.size === 0) {
      // Reset to base durations if no failed neighbors
      this.RED_DURATION = this.BASE_RED_DURATION
      this.GREEN_DURATION = this.BASE_GREEN_DURATION
      return
    }

    const failureRatio = this.failedNeighbors.size / this.neighbors.size
    
    // Adjust green time based on number of failed neighbors
    // More failed neighbors = longer green time to handle increased load
    this.GREEN_DURATION = Math.min(
      this.BASE_GREEN_DURATION * (1 + failureRatio),
      20000 // Cap at 20 seconds
    )

    // Reduce red time proportionally to keep cycle time reasonable
    this.RED_DURATION = Math.max(
      this.BASE_RED_DURATION * (1 - failureRatio * 0.5),
      5000 // Minimum 5 seconds for safety
    )

    this.log(`Adjusted timings - Red: ${this.RED_DURATION}ms, Green: ${this.GREEN_DURATION}ms`)
  }

  public simulateFailure(): void {
    this.active = false
    this.isDisabled = true
    this.stop()
    // Notify neighbors of failure
    this.server.notifyNodeFailure(this.nodeId)
    this.log(`Node ${this.nodeId} simulated failure`)
  }

  public revive(): void {
    this.active = true
    this.isDisabled = false
    this.start()
    // Notify neighbors of revival
    this.server.notifyNodeRevival(this.nodeId)
    this.log(`Node ${this.nodeId} revived`)
  }

  public stop(): void {
    this.active = false
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.stateUpdateInterval) {
      clearTimeout(this.stateUpdateInterval)
    }
  }

  private log(message: string): void {
    this.logCallback(`${this.nodeId}: ${message}`)
  }
}

