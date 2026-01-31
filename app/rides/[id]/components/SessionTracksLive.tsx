"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false },
);

type TrackPoint = {
  lat: number;
  lon: number;
  recorded_at: string;
};

type Track = {
  id: string;
  user_id: string;
  name?: string;
};

type Props = {
  tracks: Track[];
  highlightTrackId?: string;
};

/* ---------- 工具函数 ---------- */

function offsetPoints(points: TrackPoint[], index: number): [number, number][] {
  const OFFSET = 0.00003;
  const delta = OFFSET * (index - 1);
  return points.map((p) => [p.lat + delta, p.lon + delta]);
}

function collectBounds(
  pointsMap: Record<string, TrackPoint[]>,
  visibleTrackIds: string[],
) {
  const all = visibleTrackIds.flatMap(
    (id) => pointsMap[id] ?? [],
  );
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

/* ---------- 轨迹切换 UI ---------- */

function TrackSwitcher({
  tracks,
  visibleTrackIds,
  activeTrackId,
  onToggle,
  onActivate,
}: {
  tracks: Track[];
  visibleTrackIds: string[];
  activeTrackId?: string;
  onToggle: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  return (
    <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur rounded shadow p-2 space-y-1">
      {tracks.map((t) => {
        const visible = visibleTrackIds.includes(t.id);
        const active = activeTrackId === t.id;

        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
              ${active ? "bg-green-100" : "hover:bg-gray-100"}
            `}
            onClick={() => onActivate(t.id)}
          >
            <input
              type="checkbox"
              checked={visible}
              onChange={() => onToggle(t.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm">
              {t.name ?? t.id.slice(0, 6)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 主组件 ---------- */

export default function SessionTracksLive({
  tracks,
  highlightTrackId,
}: Props) {
  const [pointsMap, setPointsMap] = useState<Record<string, TrackPoint[]>>({});
  const [visibleTrackIds, setVisibleTrackIds] = useState<string[]>(
    () => tracks.map((t) => t.id),
  );
  const [activeTrackId, setActiveTrackId] = useState<string | undefined>(
    highlightTrackId,
  );

  /* 加载 points */
  useEffect(() => {
    if (!tracks.length) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        tracks.map(async (track) => {
          const res = await fetch(`/api/tracks/${track.id}/points`);
          const data = await res.json();
          return [track.id, data] as const;
        }),
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
    () => collectBounds(pointsMap, visibleTrackIds),
    [pointsMap, visibleTrackIds],
  );

  function toggleTrack(id: string) {
    setVisibleTrackIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  }

  return (
    <div className="relative h-[400px] rounded overflow-hidden">
      <TrackSwitcher
        tracks={tracks}
        visibleTrackIds={visibleTrackIds}
        activeTrackId={activeTrackId}
        onToggle={toggleTrack}
        onActivate={setActiveTrackId}
      />

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

        {tracks
          .filter((t) => visibleTrackIds.includes(t.id))
          .map((track, index) => {
            const points = pointsMap[track.id];
            if (!points || points.length === 0) return null;

            const isActive = track.id === activeTrackId;

            return (
              <Polyline
                key={track.id}
                positions={offsetPoints(points, index)}
                pathOptions={{
                  color: isActive
                    ? "#22c55e"
                    : COLORS[index % COLORS.length],
                  weight: isActive ? 4 : 2,
                  opacity: isActive ? 1 : 0.7,
                  dashArray: isActive ? undefined : "6 8",
                }}
              />
            );
          })}
      </MapContainer>
    </div>
  );
}

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#14b8a6"];
