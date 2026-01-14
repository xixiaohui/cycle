import { randomUUID } from "crypto"

export class TrackPointId {
  private constructor(private readonly value: string) {}

  // 生成新的 UUID
  static new(): TrackPointId {
    return new TrackPointId(randomUUID())
  }

  // 从已有字符串生成 ID
  static from(value: string): TrackPointId {
    if (!value) throw new Error("TrackPointId cannot be empty")
    return new TrackPointId(value)
  }

  equals(other: TrackPointId): boolean {
    return this.value === other.value
  }

  toString() {
    return this.value
  }
}
