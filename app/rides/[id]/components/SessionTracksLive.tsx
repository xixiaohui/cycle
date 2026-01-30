"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

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
import { useMap } from "react-leaflet"; // ✅ 正确
import "leaflet/dist/leaflet.css";

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

/* ---------- 工具函数 ---------- */

function offsetPoints(
  points: TrackPoint[],
  index: number
): [number, number][] {
  const OFFSET = 0.00003; // ~3m
  const delta = OFFSET * (index - (points.length % 2));

  return points.map((p) => [
    p.lat + delta,
    p.lon + delta,
  ]);
}

function collectBounds(pointsMap: Record<string, TrackPoint[]>) {
  const all = Object.values(pointsMap).flat();
  if (!all.length) return null;

  return all.map((p) => [p.lat, p.lon]) as [number, number][];
}

/* ---------- Map Helper ---------- */

function FitBounds({ points }: { points: [number, number][] | null }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    map.fitBounds(points, { padding: [30, 30] });
  }, [points, map]);

  return null;
}

/* ---------- 主组件 ---------- */

export default function SessionTracksLive({
  tracks,
  highlightTrackId,
}: Props) {
  const [pointsMap, setPointsMap] = useState<
    Record<string, TrackPoint[]>
  >({});

  /* 加载所有 track points */
  useEffect(() => {
    if (!tracks.length) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        tracks.map(async (track) => {
          const res = await fetch(`/api/tracks/${track.id}/points`);
          const data = await res.json();
          return [track.id, data] as const;
        })
      );

      if (cancelled) return;

      const map: Record<string, TrackPoint[]> = {};
      for (const [id, points] of results) {
        map[id] = points;
      }

      setPointsMap(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [tracks]);

  const bounds = useMemo(
    () => collectBounds(pointsMap),
    [pointsMap]
  );

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

        <FitBounds points={bounds} />

        {tracks.map((track, index) => {
          const points = pointsMap[track.id];
          if (!points || points.length === 0) return null;

          const isHighlight = track.id === highlightTrackId;

          return (
            <Polyline
              key={track.id}
              positions={offsetPoints(points, index)}
              pathOptions={{
                color: isHighlight
                  ? "#22c55e"
                  : COLORS[index % COLORS.length],
                weight: isHighlight ? 6 : 4,
                opacity: isHighlight ? 1 : 0.85,
                dashArray: isHighlight ? undefined : "6 8",
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
