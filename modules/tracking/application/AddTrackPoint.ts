import { TrackPoint } from "../domain/TrackPoint";
import { Location } from "../domain/Location";
import { TrackPointId } from "../domain/TrackPointId";
import { TrackId } from "../domain/TrackId";
import { Track } from "../domain/Track";
import { TrackRepository } from "../domain/TrackRepository";

export class AddTrackPoint {

  constructor(
    private readonly trackRepo: TrackRepository
  ) {}


  async execute(input: {
    trackId: TrackId;
    lat: number;
    lon: number;
    accuracy: number;
    recordedAt: Date;
  }) {
    let track = await this.trackRepo.findById(input.trackId)

    if (!track) {
      track = new Track(input.trackId)
    }

    const location = new Location(input.lat, input.lon, input.accuracy);

    const point = new TrackPoint(TrackPointId.new(),location, input.recordedAt);

    if (!point.isValid()) {
      throw new Error("Invalid location accuracy");
    }

    track.addPoint(point)

    await this.trackRepo.save(track)

    // 暂时只 return
    return track;
  }
}
