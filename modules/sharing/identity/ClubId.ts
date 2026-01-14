import { randomUUID } from "crypto"

export class ClubId {
  private constructor(private readonly value: string) {}

  static new(): ClubId {
    return new ClubId(randomUUID())
  }

  static from(value: string): ClubId {
    if (!value) throw new Error("ClubId cannot be empty")
    return new ClubId(value)
  }

  equals(other: ClubId): boolean {
    return this.value === other.value
  }

  toString() {
    return this.value
  }
}
