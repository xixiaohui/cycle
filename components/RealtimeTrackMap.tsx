"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabaseClient";

type TrackPoint = {
  id: number;
  latitude: number;
  longitude: number;
  elevation?: number;
  created_at: string;
};

export default function RealtimeTrackMap({ trackId }: { trackId: string }) {
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [points, setPoints] = useState<TrackPoint[]>([]);

  /** 初始化地图 */
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      zoomControl: true,
    }).setView([31.86, 117.27], 13); // 初始点可随意

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const polyline = L.polyline([], {
      color: "#ff4d4f",
      weight: 4,
    }).addTo(map);

    mapRef.current = map;
    polylineRef.current = polyline;
  }, []);

  /** 加载已有轨迹点 */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("track_points")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: true });

      if (!data) return;

      setPoints(data);

      const latlngs = data.map(
        (p) => [p.latitude, p.longitude] as [number, number]
      );
      polylineRef.current?.setLatLngs(latlngs);
    };

    load();
  }, [trackId]);

  /** Realtime 订阅 */
  useEffect(() => {
    const channel = supabase
      .channel("track-points")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "track_points",
          filter: `track_id=eq.${trackId}`,
        },
        (payload) => {
          const p = payload.new as TrackPoint;

          setPoints((prev) => {
            const next = [...prev, p];
            polylineRef.current?.addLatLng([p.latitude, p.longitude]);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackId]);

  return <div id="map" className="h-screen w-full" />;
}
