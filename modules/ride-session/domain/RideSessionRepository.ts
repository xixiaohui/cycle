import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSession } from "./RideSession"
import { RideSessionId } from "./RideSessionId"

export interface RideSessionRepository {
  findRecentByUser(
    userId: UserId,
    limit: number
  ): Promise<RideSession[]>
  
  findById(id: RideSessionId): Promise<RideSession | null>
  save(session: RideSession): Promise<void>
}
