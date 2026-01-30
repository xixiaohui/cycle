"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";

type TrackPoint = {
  lat: number;
  lon: number;
  recorded_at: string;
};

type Props = {
  tracks: {
    id: string;
    user_id: string;
    name?: string;
  }[];
  highlightTrackId?: string;
};

export default function SessionTracksLive({
  tracks,
  highlightTrackId,
}: Props) {
  const [pointsMap, setPointsMap] = useState<
    Record<string, TrackPoint[]>
  >({});

  // 1️⃣ 初始加载每条 track 的 points
  useEffect(() => {
    tracks.forEach(async (track) => {
      const res = await fetch(
        `/api/tracks/${track.id}/points`
      );
      const data = await res.json();

      setPointsMap((prev) => ({
        ...prev,
        [track.id]: data,
      }));
    });
  }, [tracks]);

  return (
    <div className="h-[400px] rounded overflow-hidden">
      <MapContainer
        center={[25.033, 121.5654]}
        zoom={15}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tracks.map((track, index) => {
          const points = pointsMap[track.id];
          if (!points || points.length === 0) return null;

          return (
            <Polyline
              key={track.id}
              positions={points.map((p) => [p.lat, p.lon])}
              pathOptions={{
                color:
                  track.id === highlightTrackId
                    ? "#22c55e" // 绿色：我
                    : COLORS[index % COLORS.length],
                weight:
                  track.id === highlightTrackId ? 6 : 4,
                opacity: 0.9,
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
];
