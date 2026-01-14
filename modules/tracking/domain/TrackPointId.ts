// domain/TrackPointId.ts
import { randomUUID } from "crypto"

export class TrackPointId {
  private constructor(private readonly value: string) {}

  static new(): TrackPointId {
    return new TrackPointId(randomUUID())
  }

  toString(): string {
    return this.value
  }

  equals(other: TrackPointId): boolean {
    return this.value === other.value
  }
}
