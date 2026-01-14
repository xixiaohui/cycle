import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { RideSession } from "../aggregates/RideSession"


export interface RideSessionRepository {
  findById(id: RideSessionId): Promise<RideSession | null>
  save(session: RideSession): Promise<void>
}
