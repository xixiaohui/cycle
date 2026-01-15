import { DomainEvent } from "@/modules/shared/domain/DomainEvent"
import { TrackId } from "../TrackId"
import { TrackPoint } from "../TrackPoint"

export class TrackPointAdded extends DomainEvent {
  readonly name = "TrackPointAdded"

  constructor(
    readonly trackId: TrackId,
    readonly point: TrackPoint
  ) {
    super()
  }
}
