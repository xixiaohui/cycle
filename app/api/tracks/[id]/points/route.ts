import pool from "@/lib/db";


type TrackPoint = {
  lat: number;
  lng: number;
  speed?: number;
  elevation?: number;
  timestamp?: string;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ trackId: string }> }
) {

  const { trackId } = await context.params;

  const body = await req.json();

  const points: TrackPoint[] = Array.isArray(body.points)
    ? body.points
    : [body];

  if (points.length === 0) {
    return new Response("No points", { status: 400 });
  }

  // 生成占位符
  const valuesSql = points
    .map((_, i) => {
      const base = i * 6;
      return `(
        $${base + 1},
        $${base + 2},
        $${base + 3},
        $${base + 4},
        $${base + 5},
        $${base + 6}
      )`;
    })
    .join(",");

  // 参数数组
  const values = points.flatMap((p) => [
    trackId,
    p.lat,
    p.lng,
    p.speed ?? null,
    p.elevation ?? null,
    p.timestamp ? new Date(p.timestamp) : new Date(),
  ]);

  await pool.query(
    `
    INSERT INTO track_points
      (track_id, lat, lng, speed, elevation, created_at)
    VALUES ${valuesSql}
    `,
    values
  );

  return Response.json({
    success: true,
    inserted: points.length,
  });
}
