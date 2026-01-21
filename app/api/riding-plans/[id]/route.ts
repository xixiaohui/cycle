/* eslint-disable @typescript-eslint/no-explicit-any */
import { RidingPlanUpdate } from "@/lib/api/ridingPlanApi";
import pool from "@/lib/db";
import { NextResponse } from "next/server";




export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;

  console.log("params.id =", id);

  // 防御：非法 uuid
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid id" },
      { status: 400 }
    );
  }

  

  const { rows } = await pool.query(
    // `
    // SELECT
    //   rp.*,
    //   COALESCE(
    //     json_agg(
    //       json_build_object(
    //         'id', rpp.id,
    //         'user_id', rpp.user_id,
    //         'name', rpp.name,
    //         'avatar_url', rpp.avatar_url
    //       )
    //     ) FILTER (WHERE rpp.id IS NOT NULL),
    //     '[]'
    //   ) AS participants
    // FROM riding_plans rp
    // LEFT JOIN riding_plan_participants rpp
    //   ON rpp.plan_id = rp.id
    // WHERE rp.id = $1
    // GROUP BY rp.id
    // `,
    `
    SELECT * FROM riding_plans WHERE id = $1
    `,
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, message: "Invalid id" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    data: rows[0],
  });
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // 解析请求 body
  const patch: RidingPlanUpdate = await req.json();

  // 构造动态 SQL（只更新传来的字段）
  const keys = Object.keys(patch);
  if (keys.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = keys.map((key) => (patch as any)[key]);

  const query = `UPDATE riding_plans
                 SET ${setClause}
                 WHERE id = $${keys.length + 1}
                 RETURNING *`;

  try {
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Riding plan not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}