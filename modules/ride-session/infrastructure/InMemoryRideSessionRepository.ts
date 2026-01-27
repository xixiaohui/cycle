import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSession } from "../domain/RideSession"
import { RideSessionId } from "../domain/RideSessionId"
import { UserId } from "@/modules/sharing/identity/UserId"

export class InMemoryRideSessionRepository
  implements RideSessionRepository {
  

  private store = new Map<string, RideSession>()

  async findById(id: RideSessionId): Promise<RideSession | null> {
    return this.store.get(id.toString()) ?? null
  }

  async save(session: RideSession): Promise<void> {
    this.store.set(session.id.toString(), session)
  }

  async findRecentByUser(userId: UserId, limit: number): Promise<RideSession[]> {
    throw new Error("Method not implemented.")
  }
}
