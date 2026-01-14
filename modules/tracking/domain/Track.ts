import { TrackId } from "./TrackId"
import { TrackPoint } from "./TrackPoint"

export class Track {
  private points: TrackPoint[] = []

  constructor(readonly id: TrackId) {}

  addPoint(point: TrackPoint) {
    const last = this.points[this.points.length - 1]

    if (last && point.recordedAt <= last.recordedAt) {
      throw new Error("TrackPoint recordedAt must increase")
    }

    this.points.push(point)
  }

  getPoints(): readonly TrackPoint[] {
    return this.points
  }

  getLastPoint(): TrackPoint | null {
    return this.points.length
      ? this.points[this.points.length - 1]
      : null
  }
}
