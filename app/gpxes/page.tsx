"use client";

import Footer from "@/components/Footer";
import { loadGPX, parseGPX } from "@/lib/util";

import { Container, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";

type GPXPoint = {
  lat: number;
  lon: number;
  ele?: string;
};

const path = "20250817.gpx";

function GpxListContent({ gpxPath }: { gpxPath: string }) {
  const [points, setPoints] = useState<GPXPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gpxPath) return;

    let cancelled = false;

    async function fetchGPX() {
      try {
        setLoading(true);

        const gpxText = await loadGPX(gpxPath);
        const parsed = parseGPX(gpxText);

        if (!cancelled) {
          setPoints(parsed);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as string) || "Load GPX failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchGPX();
    return () => {
      cancelled = true; // 防止组件卸载后 setState
    };
  }, [gpxPath]);

  if (points) {
    console.log(points);
  }
  if (loading)
    return (
      <Typography variant="h2" gutterBottom>
        加载轨迹中…
      </Typography>
    );
  if (error)
    return (
      <Typography variant="h2" gutterBottom>
        出错：{error}
      </Typography>
    );

  return (
    <>
      <Typography variant="h1">GPX List</Typography>
    </>
  );
}

export default function GpxListPage() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <GpxListContent gpxPath={path}></GpxListContent>
      </Grid>
      <Footer></Footer>
    </Container>
  );
}
