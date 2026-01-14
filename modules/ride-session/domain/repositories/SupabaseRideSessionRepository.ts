import { RideSessionRepository } from "@/modules/ride-session/domain/repositories/RideSessionRepository"
import { RideSession } from "@/modules/ride-session/domain/aggregates/RideSession"

import { supabase } from "@/lib/supabase/server"
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { RideSessionMapper } from "../../infrastructure/mappers/RideSessionMapper"


export class SupabaseRideSessionRepository
  implements RideSessionRepository
{
  async findById(id: RideSessionId): Promise<RideSession | null> {
    const { data, error } = await supabase
      .from("ride_sessions")
      .select("*")
      .eq("id", id.toString())
      .single()

    if (error) {
      console.error(error)
      return null
    }

    return RideSessionMapper.toDomain(data)
  }

  async save(session: RideSession): Promise<void> {
    const raw = RideSessionMapper.toPersistence(session)

    const { error } = await supabase
      .from("ride_sessions")
      .upsert(raw, { onConflict: "id" })

    if (error) throw new Error(error.message)
  }
}
