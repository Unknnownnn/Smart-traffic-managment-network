import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

class TrafficLightServer {
    private static final int PORT = 5000;
    private static final long HEARTBEAT_TIMEOUT = 10 * 1000; 
    private ConcurrentHashMap<String, Long> heartbeatMap = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        TrafficLightServer server = new TrafficLightServer();
        server.start();
    }

    public void start() {
        new Thread(new HeartbeatMonitor()).start();

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("TrafficLightServer started on port " + PORT);
            while (true) {
                Socket clientSocket = serverSocket.accept();
                new Thread(new ClientHandler(clientSocket)).start();
            }
        } catch(IOException e) {
            e.printStackTrace();
        }
    }

    private class ClientHandler implements Runnable {
        private Socket socket;
        public ClientHandler(Socket socket) {
            this.socket = socket;
        }
        public void run() {
            try (BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
                String line;
                while ((line = in.readLine()) != null) {
                    if (line.startsWith("HEARTBEAT:")) {
                        String nodeId = line.substring("HEARTBEAT:".length()).trim();
                        heartbeatMap.put(nodeId, System.currentTimeMillis());
                        System.out.println("Received heartbeat from node " + nodeId);
                    } else {
                        System.out.println("Received unknown message: " + line);
                    }
                }
            } catch(IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    socket.close();
                } catch(IOException e) {
                    // ignore
                }
            }
        }
    }

    private class HeartbeatMonitor implements Runnable {
        public void run() {
            while (true) {
                long now = System.currentTimeMillis();
                for (Map.Entry<String, Long> entry : heartbeatMap.entrySet()) {
                    if (now - entry.getValue() > HEARTBEAT_TIMEOUT) {
                        System.out.println("Node " + entry.getKey() + " FAILED: No heartbeat for " + HEARTBEAT_TIMEOUT/1000 + " seconds");
                        heartbeatMap.remove(entry.getKey());
                    }
                }
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    // ignore
                }
            }
        }
    }
}
