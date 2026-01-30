/* eslint-disable @typescript-eslint/no-explicit-any */
import pool from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (track_id)
        track_id,
        created_at
      FROM track_points
      ORDER BY track_id, created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
