import { SupabaseTrackRepository } from "@/modules/tracking/infrastructure/SupabaseTrackRepository"
import { SupabaseRideSessionRepository } from "@/modules/ride-session/infrastructure/SupabaseRideSessionRepository"

export function createAddTrackPointUseCase() {
  return new (require("@/modules/tracking/application/AddTrackPointToRideSession")
    .AddTrackPointToRideSession)(
    new SupabaseTrackRepository(),
    new SupabaseRideSessionRepository()
  )
}
