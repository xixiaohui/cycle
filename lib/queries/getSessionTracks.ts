// lib/queries/getSessionTracks.ts

import pool from "../db";

//Session 下所有 Track
export async function getSessionTracks(sessionId: string) {
  const { rows } = await pool.query(
    `
    SELECT
      t.id,
      t.user_id,
      t.started_at,
      u.name,
      u.avatar_url
    FROM tracks t
    LEFT JOIN users u ON u.id = t.user_id
    WHERE t.session_id = $1
    ORDER BY t.started_at ASC
    `,
    [sessionId]
  );

  return rows;
}
