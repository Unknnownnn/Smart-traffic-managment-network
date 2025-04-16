import java.io.*;
import java.net.*;
import java.util.Scanner;

class TrafficLightNode {
    private static final String SERVER_ADDRESS = "localhost";
    private static final int SERVER_PORT = 5000;
    private static final int HEARTBEAT_INTERVAL = 3000; 
    private static final int RED_DURATION = 10000;
    private static final int GREEN_DURATION = 10000;
    private static final int YELLOW_DURATION = 3000;

    private String nodeId;
    private volatile boolean active = true;
    private Socket socket;
    private PrintWriter out;
    private LightState initialState;

    public enum LightState { RED, GREEN, YELLOW }

    public TrafficLightNode(String nodeId) {
        this.nodeId = nodeId;
        // Set initial state based on node ID to create a pattern
        if (nodeId.equals("Node1")) {
            initialState = LightState.RED;
        } else if (nodeId.equals("Node2")) {
            initialState = LightState.GREEN;
        } else if (nodeId.equals("Node3")) {
            initialState = LightState.RED;
        } else {
            // For additional nodes, set initial state based on position
            int nodeNum = Integer.parseInt(nodeId.substring(4));
            initialState = (nodeNum % 3 == 2) ? LightState.GREEN : LightState.RED;
        }
    }

    public void start() {
        try {
            socket = new Socket(SERVER_ADDRESS, SERVER_PORT);
            out = new PrintWriter(socket.getOutputStream(), true);
            System.out.println("Connected to server at " + SERVER_ADDRESS + ":" + SERVER_PORT);

            new Thread(new HeartbeatSender()).start();
            new Thread(new TrafficLightStateUpdater(initialState)).start();
            new Thread(new UserInputHandler()).start();

        } catch(IOException e) {
            e.printStackTrace();
        }
    }

    private class HeartbeatSender implements Runnable {
        public void run() {
            while (active) {
                sendHeartbeat();
                try {
                    Thread.sleep(HEARTBEAT_INTERVAL);
                } catch (InterruptedException e) {
                }
            }
            System.out.println("Heartbeat sender stopped.");
        }
    }

    private void sendHeartbeat() {
        if (out != null && active) {
            out.println("HEARTBEAT:" + nodeId);
            System.out.println("Sent heartbeat from node " + nodeId);
        }
    }

    private class TrafficLightStateUpdater implements Runnable {
        private LightState state;

        public TrafficLightStateUpdater(LightState initialState) {
            this.state = initialState;
            // Immediately report initial state
            if (out != null) {
                out.println("STATE:" + nodeId + ":" + state);
            }
            System.out.println("Node " + nodeId + ": Traffic light initialized to " + state);
        }

        public void run() {
            while (active) {
                try {
                    // First send the current state
                    if (out != null) {
                        out.println("STATE:" + nodeId + ":" + state);
                    }
                    
                    // Sleep duration depends on current state
                    switch (state) {
                        case RED:
                            Thread.sleep(RED_DURATION);
                            if (active) {
                                state = LightState.GREEN;
                            }
                            break;
                        case GREEN:
                            Thread.sleep(GREEN_DURATION);
                            if (active) {
                                state = LightState.YELLOW;
                            }
                            break;
                        case YELLOW:
                            Thread.sleep(YELLOW_DURATION);
                            if (active) {
                                state = LightState.RED;
                            }
                            break;
                    }
                    
                    // Log the state change
                    if (active) {
                        System.out.println("Node " + nodeId + ": Traffic light changed to " + state);
                    }
                } catch (InterruptedException e) {
                    if (active) {
                        Thread.currentThread().interrupt();
                        continue;
                    }
                    break;
                }
            }
            // Send final inactive state
            if (out != null) {
                out.println("INACTIVE:" + nodeId);
            }
            System.out.println("Traffic light state updater stopped.");
        }
    }

    private class UserInputHandler implements Runnable {
        public void run() {
            Scanner scanner = new Scanner(System.in);
            System.out.println("Enter 'fail' to simulate node failure for " + nodeId + ":");
            while (active) {
                String input = scanner.nextLine().trim();
                if ("fail".equalsIgnoreCase(input)) {
                    System.out.println("Simulating failure for node " + nodeId);
                    active = false;
                    try {
                        if (socket != null) {
                            socket.close();
                        }
                    } catch(IOException e) {
                    }
                }
            }
            scanner.close();
        }
    }

    public static void main(String[] args) {
        String nodeId = args.length > 0 ? args[0] : "Node1";
        TrafficLightNode node = new TrafficLightNode(nodeId);
        node.start();
    }
}
