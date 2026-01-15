/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"

export function ReplayPlayer({ replay}:{replay:any}) {
  const [timeIndex, setTimeIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return

    const timer = setInterval(() => {
      setTimeIndex(i =>
        i < replay.points.length - 1 ? i + 1 : i
      )
    }, 500) // 回放速度

    return () => clearInterval(timer)
  }, [playing])

  const visiblePoints = replay.points.slice(0, timeIndex + 1)

  return (
    <div>
      <button onClick={() => setPlaying(!playing)}>
        {playing ? "暂停" : "播放"}
      </button>

      <div>
        时间点：{timeIndex}/{replay.points.length}
      </div>

      {/* 地图：按 trackId/userId 分组绘制 */}
    </div>
  )
}
