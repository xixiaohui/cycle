// "use server"

// import { SupabaseRideSessionRepository } from "@/modules/ride-session/domain/repositories/SupabaseRideSessionRepository"
// import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
// import { UserId } from "@/modules/sharing/identity/UserId"



// export async function startRideSessionAction(sessionId: string) {
//   const user = await getCurrentUser()
//   if (!user) throw new Error("Unauthorized")

//   const useCase = new StartRideSession(
//     new SupabaseRideSessionRepository()
//   )

//   await useCase.execute({
//     sessionId: RideSessionId.from(sessionId),
//     byUser: UserId.from(user.id)
//   })
// }
