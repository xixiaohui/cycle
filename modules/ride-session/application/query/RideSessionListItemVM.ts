export interface RideSessionListItemVM {
  id: string
  startedAt: string | null
  endedAt: string | null
  status: "created" | "riding" | "ended"
  participantCount: number
  isRiding: boolean
}