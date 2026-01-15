"use server"

import { StartRideSession } from "@/modules/ride-session/application/StartRideSession"
import { EndRideSession } from "@/modules/ride-session/application/EndRideSession"
import { SupabaseRideSessionRepository } from "@/modules/ride-session/infrastructure/SupabaseRideSessionRepository"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"
import { revalidatePath } from "next/cache"
import { EventBus } from "@/modules/shared/domain/EventBus"

export async function startRideAction(id: string) {
  const useCase = new StartRideSession(
    new SupabaseRideSessionRepository(),new EventBus()
  )

  await useCase.execute({rideSessionId:RideSessionId.from(id)})

  revalidatePath(`/rides/${id}`)
}

export async function endRideAction(id: string) {
  const useCase = new EndRideSession(
    new SupabaseRideSessionRepository()
  )

  await useCase.execute({sessionId:RideSessionId.from(id)})

  revalidatePath(`/rides/${id}`)
}
