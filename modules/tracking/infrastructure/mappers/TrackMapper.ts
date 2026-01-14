/* eslint-disable @typescript-eslint/no-explicit-any */
import { Track } from "@/modules/tracking/domain/aggregates/Track"
import { TrackPoint } from "../../domain/entities/TrackPoint"
import { TrackPointId } from "@/modules/sharing/identity/TrackPointId"
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"


export class TrackMapper {
  static toDomain(raw: any): Track {
    const track = new Track(RideSessionId.from(raw.ride_session_id))
    raw.points?.forEach((p: any) => {
      track.addPoint(
        new TrackPoint(
          TrackPointId.from(p.id),
          p.lat,
          p.lon,
          p.accuracy,
          new Date(p.recorded_at)
        )
      )
    })
    return track
  }

  static toPersistence(track: Track): any {
    return {
      ride_session_id: track.rideSessionId.toString(),
      points: track.getPoints().map(p => ({
        id: p.id.toString(),
        lat: p.lat,
        lon: p.lon,
        accuracy: p.accuracy,
        recorded_at: p.recordedAt.toISOString()
      }))
    }
  }
}
