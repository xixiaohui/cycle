/* eslint-disable @typescript-eslint/no-explicit-any */
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { TrackId } from "@/modules/sharing/identity/TrackId"
import { UserId } from "@/modules/sharing/identity/UserId"
import { Track } from "@/modules/tracking/domain/aggregates/Track"
import { TrackPoint } from "../../domain/entities/TrackPoint"
import { TrackPointId } from "@/modules/sharing/identity/TrackPointId"
import { Location } from "@/modules/tracking/domain/value-objects/Location"

export class TrackMapper {
  static toDomain(raw: any): Track {
    const track = new Track(
      TrackId.from(raw.id),                    // Track 聚合根 ID
      UserId.from(raw.owner_id),               // 轨迹所属用户
      RideSessionId.from(raw.ride_session_id)  // 所属 RideSession
    )

    raw.points?.forEach((p: any) => {
    const location = new Location(p.lat, p.lon, p.accuracy)
    const speed = p.speed ?? 0  // 如果 DB 没有 speed，可以默认 0
    track.addPoint(
        new TrackPoint(
        TrackPointId.from(p.id),
        location,
        new Date(p.recorded_at),
        speed
        )
    )
    })

    return track
  }

  static toPersistence(track: Track): any {
    return {
      id: track.id.toString(),
      owner_id: track.ownerId.toString(),
      ride_session_id: track.rideSessionId.toString(),
      points: track.getPoints().map(p => ({
        id: p.id.toString(),
        lat: p.location.latitude,
        lon: p.location.longitude,
        accuracy: p.location.accuracy,
        recorded_at: p.recordedAt.toISOString()
      }))
    }
  }
}
