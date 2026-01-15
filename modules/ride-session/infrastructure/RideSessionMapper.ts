/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSession } from "../domain/RideSession"
import { RideSessionId } from "../domain/RideSessionId"
import { RideSessionStatus } from "../domain/RideSessionStatus"



export class RideSessionMapper {
  static toDomain(raw: any): RideSession {
    return new RideSession(
      RideSessionId.from(raw.id),
      UserId.from(raw.owner_id),
      RideSessionStatus.from(raw.status),
      raw.startedAt ? new Date(raw.startedAt) : null,
      raw.endedAt ? new Date(raw.endedAt) : null
    )
  }

  static toPersistence(session: RideSession) {
    return {
      id: session.id.toString(),
      owner_id: session.ownerId.toString(),
      status: session.status.value,
      started_at: session.startedAt?.toISOString() ?? null,
      ended_at: session.endedAt?.toISOString() ?? null
    }
  }
}
