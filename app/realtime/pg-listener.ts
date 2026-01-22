import { Client, Notification } from "pg";

/**
 * 统一的 realtime payload 结构
 */
export interface PgRealtimeEvent {
  channel: string;
  payload: unknown;
}

/**
 * PG Listener 配置
 */
const DATABASE_URL = process.env.DATABASE_URL!;
const CHANNELS = [
  "riding_plans_channel",
  "riding_plan_comments_channel",
  "riding_plan_participants_channel",
];

let client: Client | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * 启动 PG LISTEN
 */
export async function startPgListener(
  onEvent: (event: PgRealtimeEvent) => void
) {
  if (client) return;

  client = new Client({
    connectionString: DATABASE_URL,
    application_name: "pg-realtime-listener",
  });

  client.on("notification", (msg: Notification) => {
    try {
      const payload = msg.payload ? JSON.parse(msg.payload) : null;

      onEvent({
        channel: msg.channel,
        payload,
      });
    } catch (err) {
      console.error("PG payload parse error:", err);
    }
  });

  client.on("error", (err) => {
    console.error("PG client error:", err);
    reconnect();
  });

  client.on("end", () => {
    console.warn("PG connection ended");
    reconnect();
  });

  try {
    await client.connect();

    for (const channel of CHANNELS) {
      await client.query(`LISTEN ${channel}`);
    }

    console.log("✅ PG LISTEN started:", CHANNELS);
  } catch (err) {
    console.error("❌ PG LISTEN start failed:", err);
    reconnect();
  }
}

/**
 * 断线重连（指数退避可自行加）
 */
function reconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;

    try {
      await stopPgListener();
    } catch {}

    client = null;

    console.log("🔄 Reconnecting PG LISTEN...");
    // 注意：这里不会直接 start，
    // 应由外部再次调用 startPgListener
  }, 3000);
}

/**
 * 停止监听（优雅关闭）
 */
export async function stopPgListener() {
  if (!client) return;

  try {
    for (const channel of CHANNELS) {
      await client.query(`UNLISTEN ${channel}`);
    }
    await client.end();
  } catch (err) {
    console.error("PG listener stop error:", err);
  } finally {
    client = null;
  }
}
