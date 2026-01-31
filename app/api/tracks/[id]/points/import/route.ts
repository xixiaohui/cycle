/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from "@/lib/db";
import { NextRequest } from "next/server";


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { points } = await req.json();

  if (!Array.isArray(points) || points.length === 0) {
    return new Response("No points", { status: 400 });
  }

  const batchSize = 1000; // 每批插入 1000 条
  let inserted = 0;

  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);

    const values: any[] = [];
    const placeholders: string[] = [];

    batch.forEach((p, j) => {
      const base = j * 4; // 现在每条有 4 个占位符
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
      values.push(
        id,
        p.lat,
        p.lon,
        p.recorded_at ?? new Date() // 如果 points 没有时间就用当前时间
      );
    });

    await pool.query(
      `
      INSERT INTO track_points
        (track_id, lat, lon, recorded_at)
      VALUES
        ${placeholders.join(",")}
      `,
      values
    );

    inserted += batch.length;
  }

  return Response.json({ inserted });
}


