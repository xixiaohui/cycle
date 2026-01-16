/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
} from "react-leaflet"
import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import { colorByIndex } from "@/lib/map/colors"

type TrackPointDTO = {
  track_id: string
  lat: number
  lon: number
  recorded_at: string
}

export function ReplayMap({
  points,
}: {
  points: TrackPointDTO[]
}) {
  // 1️⃣ 按 Track 分组
  const tracks = useMemo(() => {
    const map: Record<string, TrackPointDTO[]> = {}
    for (const p of points) {
      if (!map[p.track_id]) map[p.track_id] = []
      map[p.track_id].push(p)
    }
    return map
  }, [points])

  // 2️⃣ 时间轴范围
  const allTimes = points.map(p =>
    new Date(p.recorded_at).getTime()
  )

  const startTime = Math.min(...allTimes)
  const endTime = Math.max(...allTimes)

  const [currentTime, setCurrentTime] = useState(startTime)
  const [playing, setPlaying] = useState(false)

  // 3️⃣ 播放器
  useEffect(() => {
    if (!playing) return

    const timer = setInterval(() => {
      setCurrentTime(t =>
        Math.min(t + 1000, endTime)
      )
    }, 300)

    return () => clearInterval(timer)
  }, [playing, endTime])

  // 4️⃣ 地图中心
  const center = useMemo(() => {
    const first = points[0]
    return first
      ? [first.lat, first.lon]
      : [31.23, 121.47]
  }, [points])

  return (
    <>
      <MapContainer
        center={center as any}
        zoom={14}
        style={{ height: "600px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.entries(tracks).map(
          ([trackId, pts], index) => {
            const visible = pts.filter(
              p =>
                new Date(p.recorded_at).getTime() <=
                currentTime
            )

            if (visible.length === 0) return null

            const color = colorByIndex(index)
            const positions = visible.map(p => [
              p.lat,
              p.lon,
            ]) as any

            const last = visible[visible.length - 1]

            return (
              <>
                <Polyline
                  key={`line-${trackId}`}
                  positions={positions}
                  pathOptions={{ color, weight: 4 }}
                />

                <Marker
                  key={`marker-${trackId}`}
                  position={[last.lat, last.lon] as any}
                  icon={L.divIcon({
                    className: "",
                    html: `<div style="
                      width:12px;
                      height:12px;
                      background:${color};
                      border-radius:50%;
                      border:2px solid white;"></div>`,
                  })}
                />
              </>
            )
          }
        )}
      </MapContainer>

      {/* 时间轴控制 */}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setPlaying(p => !p)}>
          {playing ? "暂停" : "播放"}
        </button>

        <input
          type="range"
          min={startTime}
          max={endTime}
          step={1000}
          value={currentTime}
          onChange={e =>
            setCurrentTime(Number(e.target.value))
          }
          style={{ width: "100%" }}
        />
      </div>
    </>
  )
}
