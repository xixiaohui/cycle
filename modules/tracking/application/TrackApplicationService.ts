import { Track } from "../domain/aggregates/Track"
import { RideSession } from "@/modules/ride-session/domain/aggregates/RideSession"
import { TrackPoint } from "../domain/entities/TrackPoint"

export class TrackApplicationService {
  addTrackPoint(
    session: RideSession,
    track: Track,
    point: TrackPoint
  ) {
    if (!session.isRiding()) {
      throw new Error("RideSession is not riding")
    }

    track.addPoint(point)
  }
}
