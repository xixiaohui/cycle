import { ClubId } from "@/modules/sharing/identity/ClubId"
import { UserId } from "@/modules/sharing/identity/UserId"
import { Member } from "../entities/Member"


export class Club {
  private members: Member[] = []

  constructor(
    readonly id: ClubId,
    readonly name: string
  ) {}

  addMember(userId: UserId) {
    if (this.members.some(m => m.userId.equals(userId))) {
      throw new Error("User already in club")
    }
    this.members.push(new Member(userId))
  }

  hasMember(userId: UserId): boolean {
    return this.members.some(m => m.userId.equals(userId))
  }
}
