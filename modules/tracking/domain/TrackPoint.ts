// domain/TrackPoint.ts
import { Location } from "./Location"
import { TrackPointId } from "./TrackPointId"

export class TrackPoint {
  constructor(
    readonly id: TrackPointId,
    readonly location: Location,
    readonly recordedAt: Date
  ) {}

  isValid(): boolean {
    return this.location.isAccurateEnough()
  }
}
