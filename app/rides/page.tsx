"use client";

import { supabase } from "@/lib/supabaseClient";
import { RideSessionListItem } from "@/modules/ride-session/query/RideSessionListItem";
import Link from "next/link";
import { useEffect, useState } from "react";

import { TrackListItem } from "@/modules/tracking/query/TrackListItem";



export default function RidesPage() {
  const [rides, setRides] = useState<RideSessionListItem[]>([]);

  const [tracks, setTracks] = useState<TrackListItem[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      const { data, error } = await supabase
        .from("ride_sessions")
        .select("id, status, started_at, ended_at")
        .order("created_at", { ascending: false });
    
      if (error) {
        console.error(error)
        return
      }

      setRides(data ?? [])
    };

    fetchRides();
    
    const fetchTracks = async () => {
      const { data,error } = await supabase
      .from("tracks")
      .select("id, owner_id")
      .eq("ride_session_id", "params.id")

      if (error) {
        console.error(error)
        return
      }

      setTracks(data ?? [])
    }

    
    fetchTracks();

  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-8xl text-blue-700 tracking-tighter text-balance">
        CYCLING LIST
      </h1>

      <ul>
        {rides?.map((r) => (
          <li key={r.id}>
            <Link href={`/rides/${r.id}`}>
              {r.status} · {r.started_at ?? "未开始"}
            </Link>
            {" | "}
            <Link href={`/rides/${r.id}/replay`}>REPLY</Link>
          </li>
        ))}
      </ul>

      {/* <LiveRideMap
        tracks={tracks.map(t => ({
          track_id: t.id,
          user_id: t.owner_id
        }))}
      /> */}
    </div>
  );
}
