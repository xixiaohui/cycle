"use client"

import { startRideAction, endRideAction } from "./actions"

export function RideControls({
  rideId,
  status
}: {
  rideId: string
  status: string
}) {
  return (
    <div style={{ marginTop: 16 }}>
      {status === "CREATED" && (
        <button onClick={() => startRideAction(rideId)}>
          开始骑行
        </button>
      )}

      {status === "RIDING" && (
        <button onClick={() => endRideAction(rideId)}>
          结束骑行
        </button>
      )}
    </div>
  )
}
