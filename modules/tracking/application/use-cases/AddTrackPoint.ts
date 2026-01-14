import { RideSessionRepository } from "@/modules/ride-session/domain/repositories/RideSessionRepository"
import { TrackRepository } from "../../domain/repositories/TrackRepository"
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { UserId } from "@/modules/sharing/identity/UserId"
import { TrackPoint } from "../../domain/entities/TrackPoint"
import { Track } from "../../domain/aggregates/Track"
import { TrackId } from "@/modules/sharing/identity/TrackId"
import { TrackPointId } from "@/modules/sharing/identity/TrackPointId"
import { Location } from "@/modules/tracking/domain/value-objects/Location"


export class AddTrackPoint {
  constructor(
    private readonly trackRepo: TrackRepository,
    private readonly rideSessionRepo: RideSessionRepository
  ) {}

  async execute(params: {
    rideSessionId: RideSessionId
    userId: UserId
    lat: number
    lon: number
    accuracy: number
    speed: number
    recordedAt: Date
  }) {
    const session = await this.rideSessionRepo.findById(params.rideSessionId)
    if (!session) throw new Error("RideSession not found")

    if (!session.isRiding()) {
      throw new Error("RideSession is not riding")
    }

    let track = await this.trackRepo.findByRideSessionId(
      params.rideSessionId
    )

    if (!track) {
      track = new Track(
        TrackId.new(),
        params.userId,
        params.rideSessionId
      )
    }

    const location = new Location(
      params.lat,
      params.lon,
      params.accuracy
    )

    const point = new TrackPoint(
      TrackPointId.new(),
      location,
      params.recordedAt,
      params.speed
    )

    if (!point.isValid()) return

    track.addPoint(point)
    await this.trackRepo.save(track)
  }
}
