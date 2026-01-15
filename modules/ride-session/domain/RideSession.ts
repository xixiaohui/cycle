import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSessionId } from "./RideSessionId"
import { RideSessionStatus } from "./RideSessionStatus"


export class RideSession {
  constructor(
    readonly id: RideSessionId,
    readonly ownerId: UserId, // 先用 string，后面再升级 UserId
    public status: RideSessionStatus = RideSessionStatus.CREATED,
    readonly started_at: Date | null,
    readonly ended_at: Date | null
  ) {}

  start(byUser: UserId) {
    if (!byUser.equals(this.ownerId)) {
      throw new Error("Only owner can start the ride");
    }

    if (this.status !== RideSessionStatus.CREATED) {
      throw new Error("RideSession cannot be started");
    }

    this.status = RideSessionStatus.RIDING;
  }

  end(byUser: UserId) {
    if (!byUser.equals(this.ownerId)) {
      throw new Error("Only owner can end the ride");
    }

    if (this.status !== RideSessionStatus.RIDING) {
      throw new Error("RideSession cannot be ended");
    }

    this.status = RideSessionStatus.ENDED;
  }

  isRiding(): boolean {
    return this.status === RideSessionStatus.RIDING;
  }
}
