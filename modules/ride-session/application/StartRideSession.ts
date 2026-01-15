import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSessionId } from "../domain/RideSessionId"
import { EventBus } from "@/modules/shared/domain/EventBus"

export class StartRideSession {
  constructor(
    private readonly repo: RideSessionRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: { rideSessionId: RideSessionId }) {
    const session = await this.repo.findById(input.rideSessionId)
    if (!session) throw new Error("RideSession not found")

    session.start()
    await this.repo.save(session)

    await this.eventBus.publish(session.pullDomainEvents())
  }
}
