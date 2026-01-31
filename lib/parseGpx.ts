/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/parseGpx.ts
import { XMLParser } from "fast-xml-parser";

export interface GpxPoint {
  lat: number;
  lng: number;
  recorded_at?: string;
}

export function parseGpx(content: string): GpxPoint[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  const json = parser.parse(content);

  const trkpts =
    json?.gpx?.trk?.trkseg?.trkpt ??
    json?.gpx?.trk?.[0]?.trkseg?.trkpt ??
    [];

  return trkpts.map((p: any) => ({
    lat: Number(p.lat),
    lon: Number(p.lon),
    recorded_at: p.time,
  }));
}
