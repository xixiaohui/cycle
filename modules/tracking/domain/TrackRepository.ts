import { Track } from "./Track"
import { TrackId } from "./TrackId"

export interface TrackRepository {
  findById(id: TrackId): Promise<Track | null>
  save(track: Track): Promise<void>
}
