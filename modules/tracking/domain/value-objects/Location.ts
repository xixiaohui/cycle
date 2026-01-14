export class Location {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
    readonly accuracy: number
  ) {}

  isAccurateEnough(): boolean {
    return this.accuracy <= 50
  }
}
