import { TrackId } from "@/modules/sharing/identity/TrackId";
import { TrackPoint } from "../entities/TrackPoint";
import { UserId } from "@/modules/sharing/identity/UserId";
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId";

export class Track {
  private points: TrackPoint[] = [];

  constructor(
    readonly id: TrackId,              // Track 聚合根 ID
    readonly ownerId: UserId,          // 谁的轨迹
    readonly rideSessionId: RideSessionId // 属于哪个骑行会话
  ) {}

  addPoint(point: TrackPoint) {
    const last = this.points[this.points.length - 1];

    if (last && point.recordedAt <= last.recordedAt) {
      throw new Error("TrackPoint time must increase");
    }

    if (!point.isValid()) {
      throw new Error("TrackPoint not valid (accuracy too low)");
    }

    this.points.push(point);
  }

  getPoints(): readonly TrackPoint[] {
    return this.points;
  }
}