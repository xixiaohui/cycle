"use server"

import { UserId } from "@/modules/sharing/identity/UserId"
import { createRideSessionUseCases } from "./_deps"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"
// import { getCurrentUser } from "@/lib/auth"


export async function startRideSessionAction(id: string) {
//   const user = await getCurrentUser()
//   if (!user) throw new Error("Unauthorized")
    const userId = UserId.from("")

  const { start } = createRideSessionUseCases()
  await start.execute({ rideSessionId: RideSessionId.from(id)})
}

