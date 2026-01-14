import { randomUUID } from "crypto"

export class TrackPointId {
  private constructor(private readonly value: string) {}

  static new(): TrackPointId {
    return new TrackPointId(randomUUID())
  }

  toString() {
    return this.value
  }
}
