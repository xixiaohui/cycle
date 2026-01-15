import { EventBus } from "@/modules/shared/domain/EventBus"
import { TrackPointAdded } from "@/modules/tracking/domain/events/TrackPointAdded"
import { RealtimeTrackPointPublisher } from "@/modules/tracking/infrastructure/RealtimeTrackPointPublisher"

export const eventBus = new EventBus()

const realtimePublisher = new RealtimeTrackPointPublisher()

eventBus.subscribe(
  "TrackPointAdded",
  async (event: TrackPointAdded) => {
    console.log("TrackPoint added:", event.trackId.toString())
    await realtimePublisher.handle(event)
  }
)
