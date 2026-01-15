export type ReplayTrackPointDTO = {
  trackId: string
  userId: string
  lat: number
  lon: number
  recordedAt: string
}

export type ReplayRideDTO = {
  rideSessionId: string
  startedAt: string
  endedAt: string
  points: ReplayTrackPointDTO[]
}
