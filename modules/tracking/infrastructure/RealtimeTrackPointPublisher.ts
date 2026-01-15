import { supabase } from "@/lib/supabaseClient"
import { TrackPointAdded } from "../domain/events/TrackPointAdded"


export class RealtimeTrackPointPublisher {
  async handle(event: TrackPointAdded) {


    await supabase.channel("track-points").send({
      type: "broadcast",
      event: "track_point_added",
      payload: {
        trackId: event.trackId.toString(),
        lat: event.point.location.lat,
        lon: event.point.location.lon,
        accuracy: event.point.location.accuracy,
        recordedAt: event.point.recordedAt.toISOString()
      }
    })
  }
}
