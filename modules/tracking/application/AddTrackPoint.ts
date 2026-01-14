import { TrackPoint } from "../domain/TrackPoint";
import { Location } from "../domain/Location";

export class AddTrackPoint {
  execute(input: {
    lat: number;
    lon: number;
    accuracy: number;
    recordedAt: Date;
  }) {
    const location = new Location(input.lat, input.lon, input.accuracy);

    const point = new TrackPoint(location, input.recordedAt);

    if (!point.isValid()) {
      throw new Error("Invalid location accuracy");
    }

    // 暂时只 return
    return point;
  }
}
