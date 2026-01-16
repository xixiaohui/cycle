import { SupabaseTrackRepository } from "@/modules/tracking/infrastructure/SupabaseTrackRepository"
import { SupabaseRideSessionRepository } from "@/modules/ride-session/infrastructure/SupabaseRideSessionRepository"
import { CreateRideSession } from "@/modules/ride-session/application/CreateRideSession"
import { StartRideSession } from "@/modules/ride-session/application/StartRideSession"
import { EndRideSession } from "@/modules/ride-session/application/EndRideSession"
import { AddTrackPointToRideSession } from "@/modules/tracking/application/AddTrackPointToRideSession"
import { EventBus } from "@/modules/shared/domain/EventBus"


export function createAddTrackPointUseCase() {
  return new AddTrackPointToRideSession(
    new SupabaseTrackRepository(),
    new SupabaseRideSessionRepository(),
    new EventBus()
  )
}


export function createRideSessionUseCases() {
  const repo = new SupabaseRideSessionRepository()

  return {
    create: new CreateRideSession(repo),
    start: new StartRideSession(repo,new EventBus()),
    end: new EndRideSession(repo)
  }
}