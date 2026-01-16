/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { subscribeTrackPoints } from "@/lib/realtime/trackPoints";
import { colorByIndex } from "@/lib/map/colors";
import L from "leaflet";

type Track = {
  track_id: string;
  user_id: string;
};

type TrackPointDTO = {
  track_id: string;
  lat: number;
  lon: number;
  recorded_at: string;
};

export function LiveRideMap({ tracks }: { tracks: Track[] }) {
  const [points, setPoints] = useState<
    Record<string, TrackPointDTO[]>
  >({});

  // 订阅 realtime
  useEffect(() => {
    const unsubscribers = tracks.map((t) =>
      subscribeTrackPoints(t.track_id, (point) => {
        setPoints((prev) => ({
          ...prev,
          [t.track_id]: [...(prev[t.track_id] ?? []), point],
        }));
      })
    );

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [tracks]);

  // 地图中心：取第一个点
  const center = useMemo(() => {
    const firstTrack = Object.values(points)[0];
    if (!firstTrack || firstTrack.length === 0) {
      return [31.2304, 121.4737]; // 默认：上海
    }
    return [firstTrack[0].lat, firstTrack[0].lon];
  }, [points]);

  return (
    <MapContainer
      center={center as any}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {tracks.map((track, index) => {
        const pts = points[track.track_id] ?? [];
        const color = colorByIndex(index);

        if (pts.length === 0) return null;

        const positions = pts.map((p) => [p.lat, p.lon]) as any;
        const last = pts[pts.length - 1];

        return (
          <>
            <Polyline
              key={`line-${track.track_id}`}
              positions={positions}
              pathOptions={{ color, weight: 4 }}
            />

            <Marker
              key={`marker-${track.track_id}`}
              position={[last.lat, last.lon] as any}
              icon={L.divIcon({
                className: "",
                html: `<div style="
                  width:12px;
                  height:12px;
                  background:${color};
                  border-radius:50%;
                  border:2px solid white;"></div>`,
              })}
            />
          </>
        );
      })}
    </MapContainer>
  );
}
