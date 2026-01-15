import { DomainEvent } from "@/modules/shared/domain/DomainEvent"
import { RideSessionId } from "../RideSessionId"

export class RideEnded extends DomainEvent {
  readonly name = "RideEnded"

  constructor(
    readonly rideSessionId: RideSessionId
  ) {
    super()
  }
}
