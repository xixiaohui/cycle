import { RideSessionId } from "../../identity/RideSessionId"
import { UserId } from "../../identity/UserId"
import { DomainEvent } from "./DomainEvent"


export class ParticipantJoined implements DomainEvent {
  readonly occurredAt: Date

  constructor(
    readonly sessionId: RideSessionId,
    readonly participantId: UserId
  ) {
    this.occurredAt = new Date()
  }
}
