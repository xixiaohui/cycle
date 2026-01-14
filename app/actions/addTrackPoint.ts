"use server"

import { AddTrackPoint } from "@/modules/tracking/application/AddTrackPoint"

export async function addTrackPointAction(input: {
  lat: number
  lon: number
  accuracy: number
}) {
  const useCase = new AddTrackPoint()

  return useCase.execute({
    ...input,
    recordedAt: new Date()
  })
}
