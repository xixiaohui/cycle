"use server"

import { createAddTrackPointUseCase } from "./_deps"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"
import { TrackId } from "@/modules/tracking/domain/TrackId"


export async function addTrackPointAction(input: {
  rideSessionId: string
  trackId: string
  lat: number
  lon: number
  accuracy: number
}) {

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
