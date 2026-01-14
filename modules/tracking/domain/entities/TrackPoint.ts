
import { TrackPointId } from "@/modules/sharing/identity/TrackPointId"
import { Location } from "../value-objects/Location"

export class TrackPoint {
  constructor(
    readonly id: TrackPointId,
    readonly location: Location,
    readonly recordedAt: Date,
    readonly speed: number
  ) {}

  isValid(): boolean {
    return this.location.isAccurateEnough()
  }
}
