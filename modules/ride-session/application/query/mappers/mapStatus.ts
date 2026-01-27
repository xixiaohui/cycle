import { RideSessionStatus } from "../../../domain/RideSessionStatus"


export type RideSessionUIStatus = "created" | "riding" | "ended"

export function mapRideSessionStatusToUI(
  status: RideSessionStatus
): RideSessionUIStatus {
  switch (status) {
    case RideSessionStatus.CREATED:
      return "created"
    case RideSessionStatus.RIDING:
      return "riding"
    case RideSessionStatus.ENDED:
      return "ended"
    default:
      throw new Error("Unknown RideSessionStatus")
  }
}
