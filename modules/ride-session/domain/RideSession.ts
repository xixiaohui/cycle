import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSessionId } from "./RideSessionId"
import { RideSessionStatus } from "./RideSessionStatus"

import { RideStarted } from "./events/RideStarted"
import { RideEnded } from "./events/RideEnded"
import { DomainEvent } from "@/modules/shared/domain/DomainEvent"


import { TrackId } from "@/modules/tracking/domain/TrackId"
import { Track } from "@/modules/tracking/domain/Track"


// CREATE TABLE IF NOT EXISTS ride_sessions (
//   id UUID PRIMARY KEY,
//   owner_id UUID NOT NULL,
//   status TEXT NOT NULL,
//   started_at TIMESTAMPTZ,
//   ended_at TIMESTAMPTZ
// );

// CREATE TABLE IF NOT EXISTS tracks (
//   id UUID PRIMARY KEY,
//   session_id UUID NOT NULL REFERENCES ride_sessions(id) ON DELETE CASCADE,
//   owner_id UUID NOT NULL
// );

export class RideSession {
  private domainEvents: DomainEvent[] = []

  private tracks: Track[] = []

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

    // 🔥 关键：为发起人创建 Track
    const track = new Track(
      TrackId.new(),
      this.id,
      this.ownerId
    )

    this.domainEvents.push(new RideStarted(this.id))

    this.tracks.push(track)
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

  join(userId: UserId) {
    if (this.status !== RideSessionStatus.RIDING) {
      throw new Error("Cannot join a ride that is not riding")
    }

    const exists = this.tracks.some(
      t => t.ownerId!.equals(userId)
    )

    if (exists) {
      throw new Error("User already joined this ride")
    }


    const track = new Track(
      TrackId.new(),
      this.id,
      userId
    )

    this.tracks.push(track)
  }

  addTrack(track: Track) {
    if (this.status !== RideSessionStatus.RIDING) {
      throw new Error("Cannot add track unless riding")
    }

    const exists = this.tracks.some(
      t => t.ownerId!.equals(track.ownerId!)
    )

    if (exists) {
      throw new Error("User already has a track")
    }

    this.tracks.push(track)
  }

  getTracks(): readonly Track[] {
    return this.tracks
  }
}
