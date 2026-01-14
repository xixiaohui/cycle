import { randomUUID } from "crypto"

export class RideSessionId {
  private constructor(private readonly value: string) {}

  static new(): RideSessionId {
    return new RideSessionId(randomUUID())
  }

  static from(value: string): RideSessionId {
    return new RideSessionId(value)
  }

  toString() {
    return this.value
  }
}
