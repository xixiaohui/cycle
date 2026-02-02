/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Track } from "@/modules/tracking/domain/Track";


type TrackPoint = {
  lat: number;
  lon: number;
};

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#14b8a6"];

function FitBounds({ pointsMap, visibleIds }: any) {
  const map = useMap();

  useEffect(() => {
    const all: L.LatLngExpression[] = [];

    Object.entries(pointsMap).forEach(([id, points]: any) => {
      if (!visibleIds.has(id)) return;

      points.forEach((p: any) => {
        all.push([p.lat, p.lon]);
      });
    });

    if (all.length) {
      map.fitBounds(L.latLngBounds(all), { padding: [30, 30] });
    }
  }, [pointsMap, visibleIds, map]);

  return null;
}

export default function LeafletMap({
  tracks,
  highlightTrackId,
  visibleIds,
}: {
  tracks: Track[];
  highlightTrackId?: string;
  visibleIds: Set<string>;
}) {
  const [pointsMap, setPointsMap] = useState<
    Record<string, TrackPoint[]>
  >({});

  useEffect(() => {
    if (!tracks.length) return;

    (async () => {
      const results = await Promise.all(
        tracks.map(async (track) => {
          const id = track.id.toString();

          const res = await fetch(
            `/api/tracks/${id}/points/?all=1`
          );
          const data = await res.json();
          return [id, data] as const;
        })
      );

      const map: Record<string, TrackPoint[]> = {};
      for (const [id, points] of results) {
        map[id] = points;
      }
      setPointsMap(map);
    })();
  }, [tracks]);

  return (
    <div className="relative h-[500px] rounded overflow-hidden">
      <MapContainer
        center={[23.7, 121]}
        zoom={14}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds pointsMap={pointsMap} visibleIds={visibleIds} />

        {tracks.map((track, index) => {
          const id = track.id.toString();   // ✅ UI 层解包

          if (!visibleIds.has(id)) return null; 

          const points = pointsMap[id];
          if (!points?.length) return null;

          const isActive = id === highlightTrackId;

          return (
            <Polyline
              key={id}
              positions={points.map(
                (p) => [p.lat, p.lon] as [number, number]
              )}
              pathOptions={{
                color: isActive
                  ? "#22c55e"
                  : COLORS[index % COLORS.length],
                weight: isActive ? 4 : 2,
                opacity: isActive ? 1 : 0.6,
                dashArray: isActive ? undefined : "6 8",
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
