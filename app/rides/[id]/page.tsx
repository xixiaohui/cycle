import { notFound } from "next/navigation";
import SessionHeader from "./components/SessionHeader";
import SessionActions from "./components/SessionActions";
import SessionTimeline from "./components/SessionTimeline";
import pool from "@/lib/db";
import MyTrackLive from "./components/MyTrackLive";
import { getMyTrack } from "@/lib/queries/getMyTrack";
import { RideSessionStatus } from "@/modules/ride-session/domain/RideSessionStatus";

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
  console.log(session);

  // TODO：从 auth 中取
  const userId = "11111111-1111-1111-1111-111111111111";
  const myTrack = await getMyTrack(session.id, userId);

  console.log(myTrack);
  console.log("myTrack.id",myTrack.id);

  if (!session) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <SessionHeader session={session} />
      <SessionActions session={session} />
      <SessionTimeline session={session} />

      {myTrack && RideSessionStatus.from(session.status) === RideSessionStatus.RIDING && (
        <div>
          <p className="text-8xl text-white tracking-tighter text-balance">Live</p>
          <MyTrackLive trackId={myTrack.id} />
        </div>
        
      )}

      {!myTrack && (
        <div className="text-gray-500">
          Track not started yet
        </div>
      )}
    </div>
  );
}
