"use client"

import { joinRideAction } from "./actions"

export function JoinRideButton({
  rideId,
  userId,
  joined
}: {
  rideId: string
  userId: string
  joined: boolean
}) {
  if (joined) return null

  return (
    <button
      onClick={() => joinRideAction(rideId, userId)}
      style={{ marginTop: 12 }}
    >
      加入骑行
    </button>
  )
}
