import { notFound } from "next/navigation";
import SessionHeader from "./components/SessionHeader";
import SessionActions from "./components/SessionActions";
import SessionTimeline from "./components/SessionTimeline";
import pool from "@/lib/db";
import MyTrackLive from "./components/MyTrackLive";
import { getMyTrack } from "@/lib/queries/getMyTrack";
import { RideSessionStatus } from "@/modules/ride-session/domain/RideSessionStatus";
import SessionTracksLive from "./components/SessionTracksLive";
import { getSessionTracks } from "@/lib/queries/getSessionTracks";

async function getRideSession(id: string) {
  const { rows } = await pool.query(
    `SELECT * FROM ride_sessions WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}



export default async function RideSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params
  console.log("----------1-----------");

  const session = await getRideSession(id);
  if (!session) notFound();


  console.log(session);

  // TODO：从 auth 中取
  // const userId = "11111111-1111-1111-1111-111111111111";
  const userId = "11111111-1111-1111-1111-222222222222";
  const myTrack = await getMyTrack(session.id, userId);

  const sessionTracks = await getSessionTracks(session.id);


  if(myTrack){
    console.log(myTrack);
    console.log("myTrack.id",myTrack.id);
  }


  if (!session) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* 基本信息 */}
      <SessionHeader session={session} />

      {/* Start / Finish / Join 等操作 */}
      <SessionActions session={session} />

      {/* Session 时间线 / 状态 */}
      <SessionTimeline session={session} />


      {/* 我的实时轨迹（强交互） */}
      {myTrack &&
        RideSessionStatus.from(session.status) ===
          RideSessionStatus.RIDING && (
          <section>
            <h2 className="text-sm text-gray-400 mb-2">
              My Ride
            </h2>
            <MyTrackLive trackId={myTrack.id} />
          </section>
        )}

      {/* Session 全局轨迹（多人叠加） */}
      {sessionTracks.length > 0 && (
        <section>
          <h2 className="text-sm text-gray-400 mb-2">
            Session Tracks
          </h2>

          <SessionTracksLive
            tracks={sessionTracks}
            highlightTrackId={myTrack?.id}
          />
        </section>
      )}

      {/* 兜底 */}
      {!myTrack &&
        RideSessionStatus.from(session.status) ===
          RideSessionStatus.RIDING && (
          <div className="text-gray-500">
            You haven’t started riding yet.
          </div>
        )}
    </div>
  );
}
