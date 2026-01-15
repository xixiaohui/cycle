import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSessionId } from "../domain/RideSessionId"
import { TrackRepository } from "@/modules/tracking/domain/TrackRepository"
import { Track } from "@/modules/tracking/domain/Track"
import { TrackId } from "@/modules/tracking/domain/TrackId"
import { UserId } from "@/modules/sharing/identity/UserId"


export class JoinRideSession {
  constructor(
    private readonly rideRepo: RideSessionRepository,
    private readonly trackRepo: TrackRepository
  ) {}

  async execute(input: {
    rideSessionId: RideSessionId
    userId: UserId
  }) {
    const session = await this.rideRepo.findById(input.rideSessionId)
    if (!session) throw new Error("RideSession not found")

    const track = new Track(
      TrackId.new(),
    )

    session.join(input.userId, track.id)

    await this.trackRepo.save(track)
    await this.rideRepo.save(session)
  }
}
