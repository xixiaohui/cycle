"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";


const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

type TrackPoint = {
  lat: number;
  lon: number;
};


function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    // 动态加载 leaflet（只在浏览器）
    import("leaflet").then((L) => {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [30, 30] });
    });
  }, [positions, map]);

  return null;
}

export default function TrackMap({ trackId }: { trackId: string }) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    async function fetchAll() {
      const res = await fetch(`/api/tracks/${trackId}/points?all=1`);
      const data: TrackPoint[] = await res.json();

      // 直接转成 polyline 格式
      setPositions(data.map((p) => [p.lat, p.lon]));
    }

    fetchAll();
  }, [trackId]);

  if (positions.length === 0) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={positions[0]}
      zoom={14}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={positions} />
      <FitBounds positions={positions} />
    </MapContainer>
  );
}
