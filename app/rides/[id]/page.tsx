
import { supabase } from "@/lib/supabaseClient"
import { LiveRideMap } from "./LiveRideMap"


export default async function RidePage({
  params
}: {
  params: { id: string }
}) {


  const { data: session } = await supabase
    .from("ride_sessions")
    .select(`
      id,
      status,
      participants:ride_participants (
        user_id,
        track_id
      )
    `)
    .eq("id", params.id)
    .single()

  if (!session) {
    return <div>Ride not found</div>
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>骑行中：{session.id}</h1>
      <LiveRideMap participants={session.participants} />
    </div>
  )
}
