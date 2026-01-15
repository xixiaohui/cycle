import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSessionId } from "../domain/RideSessionId"
import { UserId } from "@/modules/sharing/identity/UserId"

export class EndRideSession {
  constructor(
    private readonly repo: RideSessionRepository
  ) {}

  async execute(input: {
    sessionId: RideSessionId
    byUserId: UserId
  }) {
    const session = await this.repo.findById(input.sessionId)
    if (!session) {
      throw new Error("RideSession not found")
    }

    session.end()

    await this.repo.save(session)
  }
}
