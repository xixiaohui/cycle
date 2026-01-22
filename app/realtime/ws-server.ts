/* eslint-disable @typescript-eslint/no-explicit-any */
import WebSocket, { WebSocketServer } from "ws";
import { startPgListener, PgRealtimeEvent } from "./pg-listener";

const PORT = Number(process.env.REALTIME_WS_PORT ?? 4001);

/**
 * WebSocket Server
 */
const wss = new WebSocketServer({
  port: PORT,
  path: "/realtime",
});

/**
 * 已连接客户端
 */
const clients = new Set<WebSocket>();

/**
 * 广播事件
 */
function broadcast(event: PgRealtimeEvent) {
  const message = JSON.stringify({
    type: "pg-event",
    data: event,
    ts: Date.now(),
  });

  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

/**
 * 启动 PG LISTEN
 */
startPgListener((event) => {
  console.log("📡 PG event → WS:", event.channel, event.payload);
  broadcast(event);
});

/**
 * 心跳检测
 */
function heartbeat(ws: WebSocket) {
  (ws as any).isAlive = true;
}

const interval = setInterval(() => {
  for (const ws of clients) {
    if ((ws as any).isAlive === false) {
      ws.terminate();
      clients.delete(ws);
      continue;
    }

    (ws as any).isAlive = false;
    ws.ping();
  }
}, 30_000);

/**
 * WebSocket 连接处理
 */
wss.on("connection", (ws, req) => {
  console.log("🔌 WS client connected:", req.socket.remoteAddress);

  (ws as any).isAlive = true;
  clients.add(ws);

  ws.on("pong", () => heartbeat(ws));

  ws.on("close", () => {
    clients.delete(ws);
    console.log("❌ WS client disconnected");
  });

  ws.on("error", (err) => {
    console.error("WS error:", err);
    ws.close();
  });

  /**
   * 可选：客户端订阅过滤（进阶）
   */
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }

      // 后续可支持：
      // { type: "subscribe", tables: ["riding_plans"] }
    } catch {}
  });
});

wss.on("listening", () => {
  console.log(`🚀 WebSocket realtime server listening on ws://localhost:${PORT}/realtime`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * 优雅关闭
 */
function shutdown() {
  console.log("🛑 Shutting down WS server...");
  clearInterval(interval);

  for (const ws of clients) {
    ws.close();
  }

  wss.close(() => {
    process.exit(0);
  });
}
