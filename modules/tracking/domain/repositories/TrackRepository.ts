import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { Track } from "../aggregates/Track"


export interface TrackRepository {
  findByRideSessionId(sessionId: RideSessionId): Promise<Track | null>
  save(track: Track): Promise<void>
}
