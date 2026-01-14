import { TrackRepository } from "@/modules/tracking/domain/repositories/TrackRepository"
import { Track } from "@/modules/tracking/domain/aggregates/Track"

import { supabase } from "@/lib/supabase/server"
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { TrackMapper } from "../infrastructure/mappers/TrackMapper"


export class SupabaseTrackRepository implements TrackRepository {
  async findByRideSessionId(sessionId: RideSessionId): Promise<Track | null> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("ride_session_id", sessionId.toString())
      .single()

    if (error || !data) return null
    return TrackMapper.toDomain(data)
  }

  async save(track: Track): Promise<void> {
    const raw = TrackMapper.toPersistence(track)
    const { error } = await supabase
      .from("tracks")
      .upsert(raw, { onConflict: "ride_session_id" })

    if (error) throw new Error(error.message)
  }
}
