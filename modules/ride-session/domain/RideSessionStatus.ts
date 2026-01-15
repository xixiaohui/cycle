export class RideSessionStatus {
  private constructor(readonly value: "CREATED" | "RIDING" | "ENDED") {}

  static CREATED = new RideSessionStatus("CREATED")
  static RIDING = new RideSessionStatus("RIDING")
  static ENDED = new RideSessionStatus("ENDED")

  static from(value: string): RideSessionStatus {
    switch (value) {
      case "CREATED":
        return RideSessionStatus.CREATED
      case "RIDING":
        return RideSessionStatus.RIDING
      case "ENDED":
        return RideSessionStatus.ENDED
      default:
        throw new Error(`Invalid RideSessionStatus: ${value}`)
    }
  }

  isRiding(): boolean {
    return this.value === "RIDING"
  }

  isEnded(): boolean {
    return this.value === "ENDED"
  }
}
