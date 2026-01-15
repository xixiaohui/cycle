import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSessionId } from "./RideSessionId"
import { RideSessionStatus } from "./RideSessionStatus"

import { RideStarted } from "./events/RideStarted"
import { RideEnded } from "./events/RideEnded"
import { DomainEvent } from "@/modules/shared/domain/DomainEvent"

import { RideParticipant } from "./RideParticipant"
import { TrackId } from "@/modules/tracking/domain/TrackId"


export class RideSession {
  private domainEvents: DomainEvent[] = []

  private participants: RideParticipant[] = []

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

    this.domainEvents.push(new RideStarted(this.id))
  }

  end() {
    if (this._status !== RideSessionStatus.RIDING) {
      throw new Error("RideSession can only be ended from RIDING")
    }

    this._status = RideSessionStatus.ENDED
    this._endedAt = new Date()

    this.domainEvents.push(new RideEnded(this.id))
  }

  assertCanUploadTrackPoint() {
    if (!this._status.isRiding()) {
      throw new Error("Cannot upload TrackPoint when session is not RIDING")
    }
  }

  isRiding(): boolean {
    return this._status === RideSessionStatus.RIDING;
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents]
    this.domainEvents = []
    return events
  }

  join(userId: UserId, trackId: TrackId) {
    if (this._status === RideSessionStatus.ENDED) {
      throw new Error("Cannot join ended RideSession")
    }

    if (this.participants.some(p => p.userId.equals(userId))) {
      throw new Error("User already joined")
    }

    this.participants.push(new RideParticipant(userId, trackId))
  }


  getParticipants(): readonly RideParticipant[] {
    return this.participants
  }

   getTrackIdOf(userId: UserId): TrackId | null {
    return this.participants.find(p => p.userId.equals(userId))?.trackId ?? null
  }
}
