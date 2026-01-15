import { RideSession } from "./RideSession"
import { RideSessionId } from "./RideSessionId"

export interface RideSessionRepository {
  findById(id: RideSessionId): Promise<RideSession | null>
  save(session: RideSession): Promise<void>
}
