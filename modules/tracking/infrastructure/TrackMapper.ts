/* eslint-disable @typescript-eslint/no-explicit-any */
import { Track } from "../domain/Track"
import { TrackId } from "../domain/TrackId"
import { TrackPoint } from "../domain/TrackPoint"
import { TrackPointId } from "../domain/TrackPointId"
import { Location } from "../domain/Location"

export class TrackMapper {
  static toDomain(raw: any): Track {
    const track = new Track(TrackId.from(raw.id))

    for (const p of raw.points ?? []) {
      track.addPoint(
        new TrackPoint(
          TrackPointId.from(p.id),
          new Location(p.lat, p.lon, p.accuracy),
          new Date(p.recordedAt)
        )
      )
    }

    return track
  }

  static toPersistence(track: Track) {
    return {
      id: track.id.toString(),
      points: track.getPoints().map(p => ({
        id: p.id.toString(),
        lat: p.location.lat,
        lon: p.location.lon,
        accuracy: p.location.accuracy,
        recordedAt: p.recordedAt.toISOString()
      }))
    }
  }
}
