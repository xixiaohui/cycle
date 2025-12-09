/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, Typography, Paper, LinearProgress } from "@mui/material";

// Utility: Haversine distance (meters)
function haversine([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Google encoded polyline algorithm implementation
// points: Array of [lat, lng]
function encodePolyline(points: Array<[number, number]>) {
  let lastLat = 0;
  let lastLng = 0;
  let result = "";

  const encode = (num: number) => {
    let sgnNum = num << 1;
    if (num < 0) sgnNum = ~(sgnNum);
    let output = "";
    while (sgnNum >= 0x20) {
      output += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63);
      sgnNum >>= 5;
    }
    output += String.fromCharCode(sgnNum + 63);
    return output;
  };

  for (const [lat, lng] of points) {
    const latE5 = Math.round(lat * 1e5);
    const lngE5 = Math.round(lng * 1e5);
    const dLat = latE5 - lastLat;
    const dLng = lngE5 - lastLng;
    result += encode(dLat);
    result += encode(dLng);
    lastLat = latE5;
    lastLng = lngE5;
  }

  return result;
}

// Parse GPX string into points and times
function parseGpx(gpxText: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxText, "application/xml");
  const trkpts = Array.from(doc.querySelectorAll("trkpt"));
  if (trkpts.length === 0) {
    // fallback: track points in rtept or wpt
    const rtepts = Array.from(doc.querySelectorAll("rtept"));
    if (rtepts.length) return extractPoints(rtepts);
    const wpts = Array.from(doc.querySelectorAll("wpt"));
    if (wpts.length) return extractPoints(wpts);
  }
  return extractPoints(trkpts);
}

function extractPoints(nodes: Element[]) {
  const points: Array<[number, number]> = [];
  const times: string[] = [];
  for (const node of nodes) {
    const lat = parseFloat(node.getAttribute("lat") || "0");
    const lon = parseFloat(node.getAttribute("lon") || "0");
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      points.push([lat, lon]);
    }
    const timeEl = node.querySelector("time");
    if (timeEl && timeEl.textContent) times.push(timeEl.textContent);
  }
  return { points, times };
}

type Props = {
  planId: string;
  onDone?: (res: any) => void;
};

export default function GpxUploader({ planId, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  async function handleFile(file?: File) {
    setError(null);
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const { points, times } = parseGpx(text);
      if (!points || points.length < 2) throw new Error("No track points found or too few points.");

      // compute distance
      let total = 0;
      for (let i = 1; i < points.length; i++) {
        total += haversine(points[i - 1], points[i]);
      }

      // compute start/end/duration if times available
      let startTime: string | null = null;
      let endTime: string | null = null;
      let durationS: number | null = null;
      if (times && times.length) {
        // some GPX have times per point, else first/last
        const parseISO = (s: string) => new Date(s);
        const t0 = parseISO(times[0]);
        const t1 = parseISO(times[times.length - 1] || times[0]);
        if (!isNaN(t0.getTime()) && !isNaN(t1.getTime())) {
          startTime = t0.toISOString();
          endTime = t1.toISOString();
          durationS = Math.round((t1.getTime() - t0.getTime()) / 1000);
        }
      }

      // encode polyline
      const encoded = encodePolyline(points);

      // update supabase riding_plans
      const updatePayload: any = {
        route_polyline: encoded,
        distance_km: Math.round(total / 1000),
        points_count: points.length,
      };
      if (durationS !== null) updatePayload.duration_min = Math.round(durationS / 60);
      if (startTime) updatePayload.start_time = startTime;
      if (endTime) updatePayload.end_time = endTime;

      const { data, error: upErr } = await supabase
        .from("riding_plans")
        .update(updatePayload)
        .eq("id", planId)
        .select()
        .single();

      if (upErr) throw upErr;

      setStats({ distance_km: updatePayload.distance_km, duration_min: updatePayload.duration_min, points: points.length });
      if (onDone) onDone(data);
    } catch (e: any) {
      setError(e.message || String(e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  }

  return (
    <>
        <GpxUploaderUI error={error} loading={loading} stats={stats} handleInputChange={handleInputChange}></GpxUploaderUI>
    </>
  );
}

function GpxUploaderUI({
  loading,
  error,
  stats,
  handleInputChange,
}: {
  loading: boolean;
  error: string | null;
  stats: { distance_km: number; duration_min: number | null; points: number } | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Paper
      elevation={2}
      className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-100"
    >
      <Typography variant="subtitle1" className="mb-3 font-semibold">
        Upload GPX File
      </Typography>

      {/* GPX Upload Input */}
      <Box className="flex flex-col gap-3">
        <input
          type="file"
          accept=".gpx,application/gpx+xml"
          onChange={handleInputChange}
          className="
            block w-full text-sm 
            file:mr-4 file:py-2 file:px-4 
            file:rounded-md file:border-0 
            file:text-sm file:font-medium
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
            cursor-pointer
          "
        />

        {/* Loading */}
        {loading && (
          <div className="mt-2 flex items-center gap-2 text-blue-400 text-sm">
            <LinearProgress className="w-full" />
            <span>Processing...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-2 text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {/* Stats */}
        {/* {stats && (
          <div className="mt-3 text-sm space-y-1 text-neutral-300">
            <div>🚴 Distance: {(stats.distance_km / 1000).toFixed(2)} km</div>

            {stats.duration_min != null && (
              <div>⏱️ Duration: {stats.duration_min} min</div>
            )}

            <div>📍 Points: {stats.points}</div>
          </div>
        )} */}
      </Box>
    </Paper>
  );
}
