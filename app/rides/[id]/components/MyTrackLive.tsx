"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

type TrackPoint = {
  id: string;
  lat: number;
  lon: number;
  speed?: number;
  accuracy?:number;
  recorded_at: string;
};

//只画我自己的
export default function MyTrackLive({ trackId }: { trackId: string }) {
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchPoints() {
      const res = await fetch(`/api/tracks/${trackId}/points?limit=50`);
      const data = await res.json();
      setPoints(data);
      setLoading(false);
    }

    fetchPoints();

    const timer = setInterval(fetchPoints, 3000); // 3 秒轮询
    return () => clearInterval(timer);
  }, [trackId]);

  if (loading) {
    return <div>Loading track...</div>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          TrackId:{trackId}, {points.length}
        </Typography>

        <Stack spacing={1}>
          {points.map((p) => (
            <Typography key={p.id} variant="body2" color="text.secondary">
              {new Date(p.recorded_at).toLocaleTimeString()} —{" "}
              {p.lat.toFixed(5)}, {p.lon.toFixed(5)}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
