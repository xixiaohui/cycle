import { notFound } from "next/navigation";
import SessionHeader from "./components/SessionHeader";
import SessionActions from "./components/SessionActions";
import SessionTimeline from "./components/SessionTimeline";
import pool from "@/lib/db";

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
  
  if (!session) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <SessionHeader session={session} />
      <SessionActions session={session} />
      <SessionTimeline session={session} />
    </div>
  );
}
