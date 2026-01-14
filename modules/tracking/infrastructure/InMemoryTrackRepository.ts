import { TrackRepository } from "../domain/TrackRepository"
import { Track } from "../domain/Track"
import { TrackId } from "../domain/TrackId"

export class InMemoryTrackRepository implements TrackRepository {
  private store = new Map<string, Track>()

  async findById(id: TrackId): Promise<Track | null> {
    return this.store.get(id.toString()) ?? null
  }

  async save(track: Track): Promise<void> {
    this.store.set(track.id.toString(), track)
  }
}
