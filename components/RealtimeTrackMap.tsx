"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabaseClient";

type TrackPoint = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  elevation?: number | null;
  created_at: string;
};

export default function RealtimeTrackMap({ trackId }: { trackId: string }) {
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const pointsLayerRef = useRef<L.LayerGroup | null>(null);
  const [points, setPoints] = useState<TrackPoint[]>([]);

  /** 初始化地图 */
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      zoomControl: true,
    }).setView([31.86, 117.27], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const polyline = L.polyline([], {
      color: "#ff4d4f",
      weight: 7,
      opacity: 0.9,
    }).addTo(map);

    const pointsLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    polylineRef.current = polyline;
    pointsLayerRef.current = pointsLayer;
  }, []);

  /** 加载已有轨迹点 */
  useEffect(() => {
    const load = async () => {
      if (!mapRef.current || !polylineRef.current || !pointsLayerRef.current) return;

      const { data } = await supabase
        .from("track_points")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: true });

      if (!data || data.length === 0) return;

      // 过滤掉无效坐标
      const validData = data.filter((p) => p.latitude != null && p.longitude != null);
      if (validData.length === 0) return;

      setPoints(validData);

      const latlngs = validData.map((p) => [p.latitude!, p.longitude!] as [number, number]);
      polylineRef.current.setLatLngs(latlngs);

      validData.forEach((p) => {
        L.circleMarker([p.latitude!, p.longitude!], {
          radius: 1,
          color: "#1890ff",
          fillColor: "#ff4d4f",
          fillOpacity: 0.9,
        }).addTo(pointsLayerRef.current!);
      });

      mapRef.current.setView(latlngs[latlngs.length - 1], 15);
    };

    load();
  }, [trackId]);

  /** Realtime 订阅 */
  useEffect(() => {
    if (!mapRef.current || !polylineRef.current || !pointsLayerRef.current) return;

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

          if (p.latitude == null || p.longitude == null) return;

          setPoints((prev) => {
            const next = [...prev, p];

            // 更新轨迹线
            polylineRef.current?.addLatLng([p.latitude!, p.longitude!]);

            // 绘制圆点
            L.circleMarker([p.latitude!, p.longitude!], {
              radius: 1,
              color: "#1890ff",
              fillColor: "#ff4d4f",
              fillOpacity: 0.9,
            }).addTo(pointsLayerRef.current!);

            // 地图跟随最新点
            mapRef.current?.setView([p.latitude!, p.longitude!], mapRef.current.getZoom());

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
