import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSessionId } from "../domain/RideSessionId"
import { UserId } from "@/modules/sharing/identity/UserId"


export class JoinRideSession {
  constructor(
    private readonly repo: RideSessionRepository,

  ) {}

  async execute(input: {
    rideSessionId: RideSessionId
    userId: UserId
  }) {
    const session = await this.repo.findById(input.rideSessionId)

    if (!session) {
      throw new Error("RideSession not found")
    }

    session.join(input.userId)

    await this.repo.save(session)
  }
}
