import { RideSessionId } from "../../identity/RideSessionId"
import { UserId } from "../../identity/UserId"
import { DomainEvent } from "./DomainEvent"


export class RideSessionStarted implements DomainEvent {
  readonly occurredAt: Date

  constructor(
    readonly sessionId: RideSessionId,
    readonly organizerId: UserId
  ) {
    this.occurredAt = new Date()
  }
}
