/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Marker, useMap } from "react-leaflet";
import L, { Marker as LeafletMarker } from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet-rotatedmarker";

export default function MovingMarker({
  position,
  next,
}: {
  position: [number, number];
  next?: [number, number];
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const map = useMap();

  useEffect(() => {
    map.panTo(position, { animate: true });
  }, [position, map]);

  const angle =
    next
      ? (Math.atan2(next[1] - position[1], next[0] - position[0]) * 180) /
        Math.PI
      : 0;

  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current as any).setRotationAngle(angle);
    }
  }, [angle]);

  const icon = L.divIcon({
    html: "🚴",
    className: "",
    iconSize: [30, 30],
  });

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
    />
  );
}
