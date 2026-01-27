export class UserId {
  
  private constructor(private readonly value: string) {}

  static from(value: string): UserId {
    if (!value) throw new Error("UserId cannot be empty")
    return new UserId(value)
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }

  toString() {
    return this.value
  }
}
