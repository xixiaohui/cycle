import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSession } from "../domain/RideSession"
import { RideSessionId } from "../domain/RideSessionId"
import { RideSessionStatus } from "../domain/RideSessionStatus"
import { UserId } from "@/modules/sharing/identity/UserId"


export class CreateRideSession {
  constructor(
    private readonly repo: RideSessionRepository
  ) {}

  async execute(input: { ownerId: UserId }): Promise<RideSession> {
    const session = new RideSession(
      RideSessionId.new(),
      input.ownerId,
      RideSessionStatus.CREATED,
      null,
      null
    )

    await this.repo.save(session)
    return session
  }
}
