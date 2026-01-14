// domain/TrackPoint.ts
import { Location } from "./Location"

export class TrackPoint {
  constructor(
    readonly location: Location,
    readonly recordedAt: Date
  ) {}

  isValid(): boolean {
    return this.location.isAccurateEnough()
  }
}
