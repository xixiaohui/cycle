"use client"

import { useEffect, useState } from "react"
import { subscribeTrackPoints } from "@/lib/realtime/trackPoints"

type TrackPointDTO = {
  track_id: string
  lat: number
  lon: number
  recorded_at: string
}

export function LiveRideMap({
  tracks
}: {
  tracks: { track_id: string; user_id: string }[]
}) {
  const [points, setPoints] = useState<
    Record<string, TrackPointDTO[]>
  >({})

  useEffect(() => {
    const unsubscribers = tracks.map(t =>
      subscribeTrackPoints(t.track_id, point => {
        setPoints(prev => ({
          ...prev,
          [t.track_id]: [...(prev[t.track_id] ?? []), point]
        }))
      })
    )

    return () => {
      unsubscribers.forEach(u => u())
    }
  }, [tracks])

  return (
    <div>
      <h3>实时轨迹</h3>

      {Object.entries(points).map(([trackId, pts]) => (
        <div key={trackId}>
          <strong>Track {trackId}</strong>：{pts.length} 点
          <br />
          最新：{pts.at(-1)?.lat}, {pts.at(-1)?.lon}
        </div>
      ))}
    </div>
  )
}
