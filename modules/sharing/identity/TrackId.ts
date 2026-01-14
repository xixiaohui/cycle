import { randomUUID } from "crypto"

export class TrackId {
  private constructor(private readonly value: string) {}

  static new(): TrackId {
    return new TrackId(randomUUID())
  }

  static from(value: string): TrackId {
    return new TrackId(value)
  }

  toString() {
    return this.value
  }
}
