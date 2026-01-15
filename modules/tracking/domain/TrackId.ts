import { randomUUID } from "crypto"

export class TrackId {
  private constructor(private readonly value: string) {}

  static new(): TrackId {
    return new TrackId(randomUUID())
  }

  toString(): string {
    return this.value
  }

  equals(other: TrackId): boolean {
    return this.value === other.value
  }

  static from(value: string) {
    return new TrackId(value)
  }
}
