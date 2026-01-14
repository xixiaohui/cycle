/* eslint-disable @typescript-eslint/no-explicit-any */
import { RideSession } from "@/modules/ride-session/domain/aggregates/RideSession"

import { SessionStatus } from "@/modules/ride-session/domain/value-objects/SessionStatus"
import { Participant } from "@/modules/ride-session/domain/entities/Participant"
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { ClubId } from "@/modules/sharing/identity/ClubId"
import { UserId } from "@/modules/sharing/identity/UserId"

export class RideSessionMapper {
  static toDomain(raw: any): RideSession {
    const session = new RideSession(
      RideSessionId.from(raw.id),
      ClubId.from(raw.club_id),
      UserId.from(raw.organizer_id)
    )

    // 设置状态（因为 constructor 默认 CREATED）
    if (raw.status && raw.status !== SessionStatus.CREATED) {
      ;(session as any).status = raw.status
    }

    // 加载参与者
    if (raw.participants) {
      raw.participants.forEach((uId: string) => {
        session.join(UserId.from(uId))
      })
    }

    return session
  }

  static toPersistence(session: RideSession): any {
    return {
      id: session.id.toString(),
      club_id: session.clubId.toString(),
      organizer_id: session.organizerId.toString(),
      status: (session as any).getStatus(),
      participants: session['participants'].map((p: Participant) =>
        p.userId.toString()
      )
    }
  }
}
