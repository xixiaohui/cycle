/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabaseClient"

export function subscribeTrackPoints(
  trackId: string,
  onInsert: (point: any) => void
) {
  const channel = supabase
    .channel(`track_points:${trackId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "track_points",
        filter: `track_id=eq.${trackId}`
      },
      payload => {
        onInsert(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
