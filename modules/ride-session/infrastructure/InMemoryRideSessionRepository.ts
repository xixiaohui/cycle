import { RideSessionRepository } from "../domain/RideSessionRepository"
import { RideSession } from "../domain/RideSession"
import { RideSessionId } from "../domain/RideSessionId"

export class InMemoryRideSessionRepository
  implements RideSessionRepository {

  private store = new Map<string, RideSession>()

  async findById(id: RideSessionId): Promise<RideSession | null> {
    return this.store.get(id.toString()) ?? null
  }

  async save(session: RideSession): Promise<void> {
    this.store.set(session.id.toString(), session)
  }
}
