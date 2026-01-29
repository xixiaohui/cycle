// lib/queries/getMyTrack.ts

import pool from "../db";

export async function getMyTrack(sessionId: string, userId: string) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM tracks
    WHERE session_id = $1
      AND user_id = $2
    LIMIT 1
    `,
    [sessionId, userId],
  );

  return rows[0] ?? null;
}
