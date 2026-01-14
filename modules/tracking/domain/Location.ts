// domain/Location.ts
export class Location {
  constructor(
    readonly lat: number,
    readonly lon: number,
    readonly accuracy: number
  ) {}

  isAccurateEnough(): boolean {
    return this.accuracy <= 50
  }
}
