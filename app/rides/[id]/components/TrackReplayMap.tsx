"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Stack, Typography } from "@mui/material";

const MovingMarker = dynamic(() => import("./MovingMarker"), { ssr: false });

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
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});

type TrackPoint = {
  lat: number;
  lon: number;
};

export default function TrackReplayMap({ trackId }: { trackId: string }) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  // 读取所有轨迹点
  useEffect(() => {
    fetch(`/api/tracks/${trackId}/points?all=1`)
      .then((r) => r.json())
      .then((data: TrackPoint[]) => {
        // console.log("----------1---------1-----");
        // console.log(data);
        setPoints(data.map((p) => [p.lat, p.lon]));
      });
  }, [trackId]);

  // 播放动画
  useEffect(() => {
    if (!playing) return;
    if (currentIndex >= points.length - 1) return;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 30); // 控制速度

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, currentIndex, points.length]);

  const reset = () => {
    setPlaying(false);
    setCurrentIndex(0);
  };

  
  if (points.length === 0) return <div>Loading...</div>;



  return (
    <Box>
      <MapContainer
       
        center={points[0]}
        zoom={15}
        style={{ height: 500, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 已经走过的轨迹 */}
        <Polyline positions={points.slice(0, currentIndex)} />

        {/* 当前骑行位置 */}
        <MovingMarker
          position={points[currentIndex]}
          next={points[currentIndex + 1]}
        />
      </MapContainer>

      {/* 控制条 */}
      <Stack direction="row" spacing={2} mt={2} alignItems="center">
        <Button variant="contained" onClick={() => setPlaying((p) => !p)}>
          {playing ? "暂停" : "播放"}
        </Button>

        <Button variant="outlined" onClick={reset}>
          重置
        </Button>

        <Typography>
          {currentIndex} / {points.length}
        </Typography>
      </Stack>
    </Box>
  );
}



// function startRecording() {
//   const canvas = mapRef.current?.querySelector("canvas");
//   if (!canvas) return;

//   const stream = (canvas as HTMLCanvasElement).captureStream(60);

//   const recorder = new MediaRecorder(stream, {
//     mimeType: "video/webm;codecs=vp9",
//   });

//   const chunks: Blob[] = [];

//   recorder.ondataavailable = (e) => {
//     if (e.data.size) chunks.push(e.data);
//   };

//   recorder.onstop = () => {
//     const blob = new Blob(chunks, { type: "video/webm" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "track-replay.webm";
//     a.click();
//   };

//   recorder.start();

//   // 回放结束时停止
//   setTimeout(() => recorder.stop(), replayDurationMs);
// }
