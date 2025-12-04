"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";

interface Props {
  routeLatLngs: [number, number][];
}

const FitBounds = ({ routeLatLngs }: { routeLatLngs: [number, number][]; }) => {
  const map = useMap();
  useEffect(() => {
    if (routeLatLngs.length > 0) {
      map.fitBounds(routeLatLngs, { padding: [50, 50] });
    }
  }, [routeLatLngs, map]);
  return null;
};

export default function CycleMap({ routeLatLngs }: Props) {
  if (!routeLatLngs || routeLatLngs.length === 0) return null;

  const startMarker = routeLatLngs[0];
  const endMarker = routeLatLngs[routeLatLngs.length - 1];

  // 用 DivIcon 包装 MUI Icon
  const startIcon = L.divIcon({
    className: "",
    html: `<div style="color: green; font-size: 24px;">⏱️</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const endIcon = L.divIcon({
    className: "",
    html: `<div style="color: red; font-size: 24px;">🏁</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <MapContainer center={startMarker} zoom={13} className="w-full h-[400px]">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Polyline positions={routeLatLngs} color="blue" />

      <Marker position={startMarker} icon={startIcon}>
        <Popup>起点</Popup>
      </Marker>

      <Marker position={endMarker} icon={endIcon}>
        <Popup>终点</Popup>
      </Marker>
      <FitBounds routeLatLngs={routeLatLngs} />
    </MapContainer>
  );
}
