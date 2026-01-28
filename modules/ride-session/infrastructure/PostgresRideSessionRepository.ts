/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserId } from "@/modules/sharing/identity/UserId"

import { Track } from "@/modules/tracking/domain/Track"
import { TrackId } from "@/modules/tracking/domain/TrackId"
import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSession } from "../domain/RideSession"
import pool from "@/lib/db"
import { RideSessionId } from "../domain/RideSessionId"
import { RideSessionStatus } from "../domain/RideSessionStatus"

export class PostgresRideSessionRepository
  implements RideSessionRepository
{
  /* =========================
   * 查询：最近的 Session 列表
   * ========================= */
  async findRecentByUser(
    userId: UserId,
    limit: number
  ): Promise<RideSession[]> {

    console.log("---------------111-------")
    const { rows } = await pool.query(
      `
      SELECT
        *
      FROM ride_sessions
      WHERE owner_id = $1
      ORDER BY started_at DESC
      LIMIT $2
      
      `,
      [userId.toString(), limit]
    )
    console.log("---------------222-------")
    return this.mapRowsToSessions(rows)
  }

  /* =========================
   * 查询：按 ID
   * ========================= */
  async findById(
    id: RideSessionId
  ): Promise<RideSession | null> {
    const { rows } = await pool.query(
      `
      SELECT
        rs.id,
        rs.owner_id,
        rs.status,
        rs.started_at,
        rs.ended_at,
        t.id AS track_id,
        t.owner_id AS track_owner_id
      FROM ride_sessions rs
      LEFT JOIN tracks t ON t.session_id = rs.id
      WHERE rs.id = $1
      `,
      [id.toString]
    )

    if (rows.length === 0) return null

    return this.mapRowsToSessions(rows)[0]
  }

  /* =========================
   * 保存：聚合（事务）
   * ========================= */
  async save(session: RideSession): Promise<void> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // 1️⃣ upsert ride_sessions
      await client.query(
        `
        INSERT INTO ride_sessions (
          id, owner_id, status, started_at, ended_at
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id)
        DO UPDATE SET
          status = EXCLUDED.status,
          started_at = EXCLUDED.started_at,
          ended_at = EXCLUDED.ended_at
        `,
        [
          session.id,
          session.ownerId,
          session.status.value,
          session.startedAt,
          session.endedAt
        ]
      )

      // 2️⃣ 删除旧 tracks（聚合完整性）
      await client.query(
        `DELETE FROM tracks WHERE session_id = $1`,
        [session.id]
      )

      // 3️⃣ 插入当前 tracks
      for (const track of session.getTracks()) {
        await client.query(
          `
          INSERT INTO tracks (
            id, session_id, owner_id
          ) VALUES ($1, $2, $3)
          `,
          [
            track.id,
            session.id,
            track.ownerId!
          ]
        )
      }

      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  }

  /* =========================
   * 私有：行 → 聚合
   * ========================= */
  private mapRowsToSessions(rows: any[]): RideSession[] {
    const map = new Map<string, RideSession>()

    for (const row of rows) {
      let session = map.get(row.id)

      if (!session) {
        session = new RideSession(
          RideSessionId.from(row.id),
          UserId.from(row.owner_id),
          RideSessionStatus.from(row.status),
          row.started_at,
          row.ended_at
        )

        map.set(row.id, session)
      }

      if (row.track_id) {
        session.addTrack(
          new Track(
            TrackId.from(row.track_id),
            session.id,
            UserId.from(row.track_owner_id)
          )
        )
      }
    }

    return Array.from(map.values())
  }
}
