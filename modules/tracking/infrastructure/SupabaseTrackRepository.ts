import { TrackRepository } from "../domain/TrackRepository"
import { Track } from "../domain/Track"
import { TrackId } from "../domain/TrackId"
import { TrackMapper } from "./TrackMapper"
import { supabase } from "@/lib/supabase/server"

export class SupabaseTrackRepository implements TrackRepository {

  async findById(id: TrackId): Promise<Track | null> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", id.toString())
      .single()

    if (error || !data) return null

    return TrackMapper.toDomain(data)
  }

  async save(track: Track): Promise<void> {
    const raw = TrackMapper.toPersistence(track)

    await supabase
      .from("tracks")
      .upsert(raw)
  }
}
