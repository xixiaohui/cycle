/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. 插入 riding_plans
    const planResult = await client.query(
      `
      INSERT INTO riding_plans (
        title,
        description,
        start_time,
        start_location,
        end_location,
        distance_km,
        duration_min,
        difficulty,
        route_polyline,
        map_image_url,
        weather,
        training_zones,
        ftp,
        estimated_power,
        calories,
        tss,
        likes,
        created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *
      `,
      [
        body.title,
        body.description,
        body.start_time,
        body.start_location,
        body.end_location,
        body.distance_km,
        body.duration_min,
        body.difficulty,
        body.route_polyline,
        body.map_image_url,
        body.weather,         // JSONB
        body.training_zones,  // JSONB
        body.ftp,
        body.estimated_power,
        body.calories,
        body.tss,
        body.likes,
        body.created_at,
      ]
    );

    const plan = planResult.rows[0];

    // 2. 插入参与者
    await client.query(
      `
      INSERT INTO riding_plan_participants (
        plan_id,
        user_id,
        name,
        avatar_url
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        plan.id,
        body.user_id,
        body.name,
        body.avatar_url,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(plan);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json(
      { error: "Insert failed" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}



export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get("limit") ?? 10);
    const offset = Number(searchParams.get("offset") ?? 0);

    // ⭐ 1️⃣ 总数（注意：不 join，性能最好）
    const totalRes = await pool.query(
      "SELECT COUNT(*) FROM riding_plans"
    );
    const total = Number(totalRes.rows[0].count);

    // ⭐ 2️⃣ 原有列表查询（几乎不动）
    const { rows } = await pool.query(
      `
      SELECT
        rp.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rpp.id,
              'user_id', rpp.user_id,
              'name', rpp.name,
              'avatar_url', rpp.avatar_url
            )
          ) FILTER (WHERE rpp.id IS NOT NULL),
          '[]'
        ) AS participants
      FROM riding_plans rp
      LEFT JOIN riding_plan_participants rpp
        ON rpp.plan_id = rp.id
      GROUP BY rp.id
      ORDER BY rp.start_time DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        limit,
        offset,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("GET /api/riding-plans error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}