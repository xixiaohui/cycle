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
      raw.started_at ? new Date(raw.started_at) : null,
      raw.ended_at ? new Date(raw.ended_at) : null
    )
  }

  static toPersistence(session: RideSession) {
    return {
      id: session.id.toString(),
      owner_id: session.ownerId.toString(),
      status: session.status.value,
      started_at: session.started_at?.toISOString() ?? null,
      ended_at: session.ended_at?.toISOString() ?? null
    }
  }
}
