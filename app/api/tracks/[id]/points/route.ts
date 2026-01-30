import pool from "@/lib/db";
import { NextResponse } from "next/server";

// /api/tracks/[id]/points/route.ts
// json
// {
//   "lat": 25.033,
//   "lon": 121.5654,
//   "speed": 6.2,
//   "accuracy": 5,
//   "recordedAt": "2026-01-29T10:15:30.123Z"
// }

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const body = await req.json();
  const { lat, lon, speed, accuracy, recordedAt } = body;

  if (lat == null || lon == null || !recordedAt) {
    return NextResponse.json(
      { error: "lat, lon, recordedAt are required" },
      { status: 400 },
    );
  }

  // ⚠️ TODO：从 auth 中取
  const userId = "CURRENT_USER_ID";

  const client = await pool.connect();

  try {
    // ✅ 1~3 重校验（合并）
    const { rowCount } = await client.query(
      `
      SELECT 1
      FROM tracks t
      JOIN ride_sessions s ON s.id = t.session_id
      JOIN ride_session_participants p
        ON p.session_id = s.id
      WHERE
        t.id = $1
        AND t.user_id = $2
        AND p.user_id = $2
        AND s.status = 'riding'
      `,
      [id, userId],
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Track not writable" },
        { status: 403 },
      );
    }

    // ✅ 4. 写入 TrackPoint
    await client.query(
      `
      INSERT INTO track_points (
        track_id,
        lat,
        lon,
        speed,
        accuracy,
        recorded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [id, lat, lon, speed ?? null, accuracy ?? null, recordedAt],
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  } finally {
    client.release();
  }
}



export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params;


  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  // TODO: 从 auth 拿 userId
  // const userId = "11111111-1111-1111-1111-111111111111";
  const userId = "11111111-1111-1111-1111-222222222222";
  
  const { rows } = await pool.query(
    `
    SELECT tp.*
    FROM track_points tp
    JOIN tracks t ON t.id = tp.track_id
    WHERE
      t.id = $1
      AND t.user_id = $2
    ORDER BY tp.recorded_at DESC
    LIMIT $3
    `,
    [id, userId, limit]
  );

  return NextResponse.json(rows.reverse()); // 按时间正序
}