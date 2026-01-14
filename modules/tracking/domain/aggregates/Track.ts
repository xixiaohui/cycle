import { TrackId } from "@/modules/sharing/identity/TrackId";
import { TrackPoint } from "../entities/TrackPoint";
import { UserId } from "@/modules/sharing/identity/UserId";

export class Track {
  private points: TrackPoint[] = [];

  constructor(readonly id: TrackId, readonly ownerId: UserId) {}

  addPoint(point: TrackPoint) {
    const last = this.points[this.points.length - 1];

    if (last && point.recordedAt <= last.recordedAt) {
      throw new Error("TrackPoint time must increase");
    }

    this.points.push(point);
  }

  getPoints(): readonly TrackPoint[] {
    return this.points;
  }
}
