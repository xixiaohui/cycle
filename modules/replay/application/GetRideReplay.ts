
import { supabase } from "@/lib/supabaseClient"
import { ReplayRideDTO } from "./ReplayDTO"
import { RideSessionId } from "@/modules/ride-session/domain/RideSessionId"

export class GetRideReplay {
  async execute(
    rideSessionId: RideSessionId
  ): Promise<ReplayRideDTO> {


    // 1️⃣ 取 RideSession
    const { data: session } = await supabase
      .from("ride_sessions")
      .select("id, started_at, ended_at")
      .eq("id", rideSessionId.toString())
      .single()

    if (!session) throw new Error("RideSession not found")

    // 2️⃣ participants + track points
    const { data: rows } = await supabase
      .from("ride_participants")
      .select(`
        user_id,
        track_id,
        track_points (
          lat,
          lon,
          recorded_at
        )
      `)
      .eq("ride_session_id", rideSessionId.toString())

    const points = rows!.flatMap(p =>
      p.track_points.map(tp => ({
        trackId: p.track_id,
        userId: p.user_id,
        lat: tp.lat,
        lon: tp.lon,
        recordedAt: tp.recorded_at
      }))
    )

    // 3️⃣ 全局按时间排序
    points.sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() -
        new Date(b.recordedAt).getTime()
    )

    return {
      rideSessionId: session.id,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      points
    }
  }
}
