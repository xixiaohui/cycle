
import { supabase } from "@/lib/supabaseClient"
import { ReplayMap } from "./ReplayMap"


export default async function ReplayPage({
  params,
}: {
  params: { id: string }
}) {


  const { data: points } = await supabase
    .from("track_points")
    .select(`
      id,
      track_id,
      lat,
      lon,
      recorded_at,
      tracks!inner (
        owner_id
      )
    `)
    .eq("tracks.ride_session_id", params.id)
    .order("recorded_at", { ascending: true })

  return (
    <div style={{ padding: 24 }}>
      <h1>骑行回放</h1>
      <ReplayMap points={points ?? []} />
    </div>
  )
}
