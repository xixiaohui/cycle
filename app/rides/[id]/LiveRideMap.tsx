/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { subscribeTrackPoints } from "@/lib/realtime/trackPoints"

export function LiveRideMap({
  participants
}: {
  participants: { user_id: string; track_id: string }[]
}) {
  const [points, setPoints] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const unsubscribers = participants.map(p =>
      subscribeTrackPoints(p.track_id, point => {
        setPoints(prev => ({
          ...prev,
          [p.track_id]: [...(prev[p.track_id] ?? []), point]
        }))
      })
    )

    return () => {
      unsubscribers.forEach(u => u())
    }
  }, [participants])

  return (
    <div>
      <h3>实时轨迹</h3>
      {Object.entries(points).map(([trackId, pts]) => (
        <div key={trackId}>
          Track {trackId}：{pts.length} 点
        </div>
      ))}
    </div>
  )
}
