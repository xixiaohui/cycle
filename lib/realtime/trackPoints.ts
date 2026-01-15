import { supabase } from "../supabaseClient"


export function subscribeTrackPoints(
  trackId: string,
  onPoint: (point: {
    lat: number
    lon: number
    speed: number
    recordedAt: string
  }) => void
) {

  const channel = supabase
    .channel("track-points")
    .on(
      "broadcast",
      { event: "track_point_added" },
      payload => {
        if (payload.payload.trackId === trackId) {
          onPoint(payload.payload)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
