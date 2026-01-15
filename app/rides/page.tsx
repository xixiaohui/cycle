"use client";

import { supabase } from "@/lib/supabaseClient";
import { RideSessionListItem } from "@/modules/ride-session/query/RideSessionListItem";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function RidesPage() {
  const [rides, setRides] = useState<RideSessionListItem[]>([]);

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
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-8xl text-blue-700 tracking-tighter text-balance">
        骑行列表
      </h1>

      <ul>
        {rides?.map((r) => (
          <li key={r.id}>
            <Link href={`/rides/${r.id}`}>
              {r.status} · {r.started_at ?? "未开始"}
            </Link>
            {" | "}
            <Link href={`/rides/${r.id}/replay`}>回放</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
