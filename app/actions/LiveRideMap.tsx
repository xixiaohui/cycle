/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { subscribeTrackPoints } from "@/lib/realtime/trackPoints"

export function LiveRideMap({ trackId }: { trackId: string }) {
  const [points, setPoints] = useState<any[]>([])

  useEffect(() => {
    return subscribeTrackPoints(trackId, point => {
      setPoints(prev => [...prev, point])
    })
  }, [trackId])

  return (
    <div>
      当前点数：{points.length}
      {/* 这里换成 Mapbox / Leaflet */}
    </div>
  )
}
