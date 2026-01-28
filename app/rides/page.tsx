"use client";

import { useEffect, useState } from "react";
import { TrackListItem } from "@/modules/tracking/query/TrackListItem";
import { RideSessionListItemVM } from "@/modules/ride-session/application/query/RideSessionListItemVM";


export default function RidesPage() {
  const [rides, setRides] = useState<RideSessionListItemVM []>([]);

  const [loading,setLoading] = useState(true)


  useEffect(() => {

    const fetchSessions = async() => {
      try{
        const res = await fetch("/api/ride-sessions?limit=20");
        
        if(!res.ok){
          throw new Error("fetch failed");
        }
        const data = await res.json();
        setRides(data)
      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }

    }

    fetchSessions();

  }, []);

  if(loading){
    return <div>
      Loading...
    </div>
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-4xl text-blue-700 tracking-tighter text-balance">
        CYCLING LIST
      </h1>

      {rides.map((ride) =>(
        <div key={ride.id}>
          <div>Status:{ride.status}</div>
          <div>Start:{ride.startedAt}</div>
        </div>
      ))}


    </div>
  );
}


