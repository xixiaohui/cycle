import { RideSession } from "@/modules/ride-session/domain/RideSession"
import { Track } from "../domain/Track"
import { TrackPoint } from "../domain/TrackPoint"


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
