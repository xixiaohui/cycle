/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, Typography, Paper, LinearProgress } from "@mui/material";

// Utility: Haversine distance (meters)
function haversine(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Google encoded polyline algorithm implementation
// points: Array of [lat, lng]
export function encodePolyline(points: Array<[number, number]>) {
  let lastLat = 0;
  let lastLng = 0;
  let result = "";

  const encode = (num: number) => {
    let sgnNum = num << 1;
    if (num < 0) sgnNum = ~sgnNum;
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

type GpxMetadata = {
  startTime?: string;
  totalTime?: number;
  totalDistance?: number;
  cumulativeClimb?: number;
  cumulativeDecrease?: number;
  routeType?: number;
};

export type GpxResult = {
  points: Array<[number, number]>;
  times: string[];
  metadata: GpxMetadata;
};

// Parse GPX string into points and times
export function parseGpx(gpxText: string): GpxResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxText, "application/xml");

  // ---- 解析轨迹点 ----
  const trkpts = Array.from(doc.querySelectorAll("trkpt"));
  const pointsData = trkpts.length
    ? extractPoints(trkpts)
    : fallbackExtract(doc);

  // ---- 解析 metadata time ----
  const metadataEl = doc.querySelector("metadata > time");
  const startTime = metadataEl?.textContent?.trim();

  // ---- 解析扩展字段（extensions）----
  const extensionsMetadata = extractExtensions(doc);

  const metadata: GpxMetadata = {
    startTime,
    ...extensionsMetadata,
  };

  return {
    ...pointsData,
    metadata,
  };
}

function fallbackExtract(doc: Document) {
  const rtepts = Array.from(doc.querySelectorAll("rtept"));
  if (rtepts.length) return extractPoints(rtepts);
  const wpts = Array.from(doc.querySelectorAll("wpt"));
  if (wpts.length) return extractPoints(wpts);

  return { points: [], times: [] };
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

    const timeEl = node.getElementsByTagName("time")[0];
    if (timeEl?.textContent) {
      times.push(timeEl.textContent);
    }
  }

  return { points, times };
}

function extractExtensions(doc: Document): GpxMetadata {
  const ext = doc.querySelector("extensions");
  if (!ext) return {};

  const getNumber = (tag: string): number | undefined => {
    const el = ext.querySelector(tag);
    if (!el || !el.textContent) return undefined;
    const v = parseFloat(el.textContent);
    return Number.isFinite(v) ? v : undefined;
  };

  return {
    totalTime: getNumber("totalTime"),
    totalDistance: getNumber("totalDistance"),
    cumulativeClimb: getNumber("cumulativeClimb"),
    cumulativeDecrease: getNumber("cumulativeDecrease"),
    routeType: getNumber("routeType"),
  };
}

export function calculateEndTime(startTime: string, totalTimeSec: number): string {
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + totalTimeSec * 1000);
  return endDate.toISOString();
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
    const file_name = file.name.replace(".gpx", "");
    setLoading(true);
    try {
      const text = await file.text();
      const { points, times, metadata } = parseGpx(text);


      if (!points || points.length < 2)
        throw new Error("No track points found or too few points.");

      // encode polyline
      const encoded = encodePolyline(points);

      // update supabase riding_plans
      const updatePayload: any = {
        route_polyline: encoded,
        distance_km: Math.round(metadata.totalDistance! / 1000),
        points_count: points.length,
      };
      if (metadata.totalTime !== null)
        updatePayload.duration_min = Math.round(metadata.totalTime! / 60);
      if (metadata.startTime) updatePayload.start_time = metadata.startTime;
      if (metadata.totalTime)
        updatePayload.end_time = calculateEndTime(
          metadata.startTime!,
          metadata.totalTime!
        );
      if (metadata.cumulativeClimb)
        updatePayload.elevation_m = Math.round(metadata.cumulativeClimb);
      if (metadata.cumulativeDecrease)
        updatePayload.decrease = Math.round(metadata.cumulativeDecrease);
      if (file_name) updatePayload.title = file_name;

      const { data, error: upErr } = await supabase
        .from("riding_plans")
        .update(updatePayload)
        .eq("id", planId)
        .select()
        .single();

      if (upErr) throw upErr;

      setStats({
        distance_km: updatePayload.distance_km,
        duration_min: updatePayload.duration_min,
        points: points.length,
      });
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
      <GpxUploaderUI
        error={error}
        loading={loading}
        stats={stats}
        handleInputChange={handleInputChange}
      ></GpxUploaderUI>
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
  stats: {
    distance_km: number;
    duration_min: number | null;
    points: number;
  } | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Paper
      elevation={2}
      className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-100"
    >
      <Typography variant="subtitle1" className="mb-3 font-semibold">
        上传 GPX 文件
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
            <span>处理中...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-2 text-red-400 text-sm">错误: {error}</div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-3 text-sm space-y-1 text-neutral-300">
            <div>🚴 Distance: {stats.distance_km} km</div>

            {stats.duration_min != null && (
              <div>⏱️ Duration: {stats.duration_min} min</div>
            )}

            <div>📍 Points: {stats.points}</div>
          </div>
        )}
      </Box>
    </Paper>
  );
}
