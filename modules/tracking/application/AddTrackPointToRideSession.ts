import { TrackRepository } from "../domain/TrackRepository"
import { TrackId } from "../domain/TrackId"
import { TrackPointId } from "../domain/TrackPointId"
import { Track } from "../domain/Track"
import { Location } from "../domain/Location"
import { TrackPoint } from "../domain/TrackPoint"

import { RideSessionRepository } from "@/modules/ride-session/domain/RideSessionRepository"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"
import { EventBus } from "@/modules/shared/domain/EventBus"

export class AddTrackPointToRideSession {
  constructor(
    private readonly trackRepo: TrackRepository,
    private readonly rideSessionRepo: RideSessionRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: {
    rideSessionId: RideSessionId
    trackId: TrackId
    lat: number
    lon: number
    accuracy: number
    recordedAt: Date
  }) {
    const session = await this.rideSessionRepo.findById(input.rideSessionId)

    if (!session) {
      throw new Error("RideSession not found")
    }

    if (!session.isRiding()) {
      throw new Error("RideSession is not riding")
    }

    let track = await this.trackRepo.findById(input.trackId)

    if (!track) {
      track = new Track(input.trackId)
    }

    const location = new Location(
      input.lat,
      input.lon,
      input.accuracy
    )

    const point = new TrackPoint(
      TrackPointId.new(),
      location,
      input.recordedAt
    )

    if (!point.isValid()) {
      return
    }

    track.addPoint(point)
    await this.trackRepo.save(track)
    await this.eventBus.publish(track.pullDomainEvents())
  }
}
