"use server"

import { createAddTrackPointUseCase } from "./_deps"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"
import { TrackId } from "@/modules/tracking/domain/TrackId"
import { getCurrentUser } from "@/lib/auth"

export async function addTrackPointAction(input: {
  rideSessionId: string
  trackId: string
  lat: number
  lon: number
  accuracy: number
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const useCase = createAddTrackPointUseCase()

  await useCase.execute({
    rideSessionId: RideSessionId.from(input.rideSessionId),
    trackId: TrackId.from(input.trackId),
    lat: input.lat,
    lon: input.lon,
    accuracy: input.accuracy,
    recordedAt: new Date()
  })
}
