import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSessionId } from "./RideSessionId"
import { RideSessionStatus } from "./RideSessionStatus"

export class RideSession {
  constructor(
    readonly id: RideSessionId,
    readonly ownerId: UserId,
    private _status: RideSessionStatus,
    private _startedAt: Date | null,
    private _endedAt: Date | null
  ) {}

  get status() {
    return this._status
  }

  get startedAt() {
    return this._startedAt
  }

  get endedAt() {
    return this._endedAt
  }

  start() {
    if (this._status !== RideSessionStatus.CREATED) {
      throw new Error("RideSession can only be started from CREATED")
    }

    this._status = RideSessionStatus.RIDING
    this._startedAt = new Date()
  }

  end() {
    if (this._status !== RideSessionStatus.RIDING) {
      throw new Error("RideSession can only be ended from RIDING")
    }

    this._status = RideSessionStatus.ENDED
    this._endedAt = new Date()
  }

  assertCanUploadTrackPoint() {
    if (!this._status.isRiding()) {
      throw new Error("Cannot upload TrackPoint when session is not RIDING")
    }
  }

  isRiding(): boolean {
    return this._status === RideSessionStatus.RIDING;
  }
}
