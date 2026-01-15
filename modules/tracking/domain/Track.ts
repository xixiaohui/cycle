import { TrackId } from "./TrackId"
import { TrackPoint } from "./TrackPoint"

import { TrackPointAdded } from "./events/TrackPointAdded"
import { DomainEvent } from "@/modules/shared/domain/DomainEvent"

export class Track {
  private domainEvents: DomainEvent[] = []


  private points: TrackPoint[] = []

  constructor(readonly id: TrackId) {}

  addPoint(point: TrackPoint) {
    const last = this.points[this.points.length - 1]

    if (last && point.recordedAt <= last.recordedAt) {
      throw new Error("TrackPoint recordedAt must increase")
    }

    this.points.push(point)
    this.domainEvents.push(new TrackPointAdded(this.id, point))
  }

  getPoints(): readonly TrackPoint[] {
    return this.points
  }

  getLastPoint(): TrackPoint | null {
    return this.points.length
      ? this.points[this.points.length - 1]
      : null
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents]
    this.domainEvents = []
    return events
  }
}
