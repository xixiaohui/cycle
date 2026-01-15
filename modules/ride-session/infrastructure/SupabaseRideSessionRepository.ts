
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
      .select("*")
      .eq("id", id.toString())
      .single()

    if (error || !data) return null

    return RideSessionMapper.toDomain(data)
  }

  async save(session: RideSession): Promise<void> {

    const persistence = RideSessionMapper.toPersistence(session)

    const { error } = await supabase
      .from("ride_sessions")
      .upsert(persistence)

    if (error) {
      throw new Error(`Failed to save RideSession: ${error.message}`)
    }
  }
}
