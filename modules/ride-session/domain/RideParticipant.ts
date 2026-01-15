
import { UserId } from "@/modules/sharing/identity/UserId";
import { TrackId } from "@/modules/tracking/domain/TrackId"

export class RideParticipant {
  constructor(
    readonly userId: UserId,
    readonly trackId: TrackId
  ) {}
}
