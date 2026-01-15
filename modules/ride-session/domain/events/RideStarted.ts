import { DomainEvent } from "@/modules/shared/domain/DomainEvent"
import { RideSessionId } from "../RideSessionId"

export class RideStarted extends DomainEvent {
  readonly name = "RideStarted"

  constructor(
    readonly rideSessionId: RideSessionId
  ) {
    super()
  }
}
