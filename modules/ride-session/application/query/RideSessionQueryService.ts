import { RideSessionRepository } from "@/modules/ride-session/domain/RideSessionRepository"

import { UserId } from "@/modules/sharing/identity/UserId"
import { mapRideSessionStatusToUI } from "@/modules/ride-session/application/query/mappers/mapStatus"
import { RideSessionListItemVM } from "./RideSessionListItemVM"

export class RideSessionQueryService{
  constructor(
    private readonly repo:RideSessionRepository
  ){}

  async listForUser(
    userId: UserId,
    limit = 20
  ): Promise<RideSessionListItemVM[]> {
    console.log("---------------11-------");
    const sessions = await this.repo.findRecentByUser(userId, limit)

    console.log("---------------22-------");
    return sessions.map(session => ({
      id: session.id.toString(),
      startedAt: session.startedAt
        ? session.startedAt.toISOString()
        : null,
      endedAt: session.endedAt
        ? session.endedAt.toISOString()
        : null,
      status: mapRideSessionStatusToUI(session.status), // 假设是 VO
      participantCount: session.getTracks().length,
      isRiding: session.isRiding(),
      ownerId:session.ownerId.toString()
    }))
  }
}
