
import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSession } from "../domain/RideSession"
import { RideSessionId } from "../domain/RideSessionId"
import { RideSessionMapper } from "./RideSessionMapper"
import { supabase } from "@/lib/supabaseClient"

export class SupabaseRideSessionRepository
  implements RideSessionRepository
{
  async findById(id: RideSessionId): Promise<RideSession | null> {

    const { data, error } = await supabase
      .from("ride_sessions")
      .select(`
        *,
        participants:ride_participants (
          user_id,
          track_id
        )
      `)
      .eq("id", id.toString())
      .single()

    if (error || !data) return null

    return RideSessionMapper.toDomain(data)
  }

  async save(session: RideSession): Promise<void> {

    const persistence = RideSessionMapper.toPersistence(session)

    // 1️⃣ 保存 RideSession
    const { error } = await supabase
      .from("ride_sessions")
      .update(persistence)
      .eq("id", session.id.toString())

    // 2️⃣ 保存 Tracks（upsert）
    const tracks = session.getTracks().map(track => ({
      id: track.id.toString(),
      ride_session_id: track.rideSessionId.toString(),
      owner_id: track.ownerId.toString()
    }))

    if (tracks.length > 0) {
      await supabase
        .from("tracks")
        .upsert(tracks, { onConflict: "id" })
    }

    if (error) {
      throw new Error(`Failed to save RideSession: ${error.message}`)
    }
  }
}
