import { DomainEvent } from "@/modules/sharing/domain/events/DomainEvent"
import { Participant } from "../entities/Participant"
import { SessionStatus } from "../value-objects/SessionStatus"
import { RideSessionId } from "@/modules/sharing/identity/RideSessionId"
import { ClubId } from "@/modules/sharing/identity/ClubId"
import { UserId } from "@/modules/sharing/identity/UserId"
import { RideSessionStarted } from "@/modules/sharing/domain/events/RideSessionStarted"
import { RideSessionEnded } from "@/modules/sharing/domain/events/RideSessionEnded"
import { ParticipantJoined } from "@/modules/sharing/domain/events/ParticipantJoined"


export class RideSession {
  private status: SessionStatus
  private participants: Participant[] = []
  private domainEvents: DomainEvent[] = []

  constructor(
    readonly id: RideSessionId,
    readonly clubId: ClubId,
    readonly organizerId: UserId
  ) {
    this.status = SessionStatus.CREATED
  }

  start(byUser: UserId) {
    if (!byUser.equals(this.organizerId)) {
      throw new Error("Only organizer can start session")
    }
    if (this.status !== SessionStatus.CREATED) {
      throw new Error("RideSession already started or ended")
    }
    this.status = SessionStatus.RIDING

    this.addDomainEvent(new RideSessionStarted(this.id, byUser))
  }

  end(byUser: UserId) {
    if (!byUser.equals(this.organizerId)) {
      throw new Error("Only organizer can end session")
    }
    if (this.status !== SessionStatus.RIDING) {
      throw new Error("RideSession is not riding")
    }
    this.status = SessionStatus.ENDED

    this.addDomainEvent(new RideSessionEnded(this.id, byUser))
  }

  join(userId: UserId) {
    if (this.status !== SessionStatus.CREATED) {
      throw new Error("Cannot join started session")
    }
    if (this.participants.some(p => p.userId.equals(userId))) {
      throw new Error("Already joined")
    }
    this.participants.push(new Participant(userId))

    this.addDomainEvent(new ParticipantJoined(this.id, userId))
  }

  private addDomainEvent(event: DomainEvent) {
    this.domainEvents.push(event)
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents]
    this.domainEvents.length = 0 // 清空已取出的事件
    return events
  }
}
