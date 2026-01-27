"use client";

import { useEffect, useState } from "react";
import { TrackListItem } from "@/modules/tracking/query/TrackListItem";
import { RideSessionListItemVM } from "@/modules/ride-session/application/query/RideSessionListItemVM";


export default function RidesPage() {
  const [rides, setRides] = useState<RideSessionListItemVM []>([]);

  const [tracks, setTracks] = useState<TrackListItem[]>([]);

  useEffect(() => {


  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-4xl text-blue-700 tracking-tighter text-balance">
        CYCLING LIST
      </h1>

    </div>
  );
}
