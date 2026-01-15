import { GetRideReplay } from "@/modules/replay/application/GetRideReplay"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"
import { ReplayPlayer } from "./ReplayPlayer"

export default async function ReplayPage({
  params
}: {
  params: { id: string }
}) {
  const replay = await new GetRideReplay().execute(
    RideSessionId.from(params.id)
  )

  return (
    <div style={{ padding: 24 }}>
      <h1>骑行回放</h1>
      <ReplayPlayer replay={replay} />
    </div>
  )
}
