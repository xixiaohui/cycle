"use client";

import Footer from "@/components/Footer";
import { loadGPX } from "@/lib/util";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import { calculateEndTime, encodePolyline, GpxResult, parseGpx } from "@/components/GpxUploader";
import { supabase } from "@/lib/supabaseClient";

const path = "20250817.gpx";

const PATH_ARRAY = [
  "20250817.gpx",
  "20250824.gpx",
  "20250903.gpx",
  "20250907.gpx",
  "20250914.gpx",
  "20250920.gpx",
  "20250922.gpx",
  "20250926.gpx",
  "20250928.gpx",
  "20250930.gpx",
  "20251002.gpx",
  "20251004.gpx",
  "20251010.gpx",
  "20251014.gpx",
  "20251018.gpx",
  "20251022.gpx",
  "20251101.gpx",
  "20251109.gpx",
  "20251123.gpx",
  "20251126.gpx",
  "20251130.gpx",
  "20251207.gpx",
  "20251214.gpx",
  "20251227.gpx",
];

function GpxListContent({ gpxPath }: { gpxPath: string }) {
  const [points, setPoints] = useState<GpxResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gpxPath) return;

    let cancelled = false;

    async function fetchGPX() {
      try {
        setLoading(true);

        const gpxText = await loadGPX(gpxPath);
        const parsed = parseGpx(gpxText);

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

//1.新增一条骑行计划
async function addRidingPlan() {
  const random_img_id = Math.floor(Math.random() * 201) + 100;
  const newPlan = {
    title: `新的骑行记录 ${random_img_id}`,
    description: "轻松骑行，呼吸新鲜空气",
    start_time: null,
    end_time: null,
    start_location: null,
    end_location: null,
    distance_km: null,
    duration_min: 0,
    difficulty: 4,
    route_polyline: "",
    map_image_url: `https://picsum.photos/id/${random_img_id}/800/450`,
    weather: { temp: 22, summary: "晴", wind_speed: 3 },
    training_zones: {
      Z1: 25,
      Z2: 30,
      Z3: 20,
      Z4: 10,
      Z5: 5,
    },
    ftp: 100,
    estimated_power: 200,
    calories: 100,
    tss: 70,
    likes: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("riding_plans")
    .insert([newPlan])
    .select("id")
    .single();

  if (error) {
    console.error(error);
    alert("新增失败");
    return;
  }

  await supabase
    .from("riding_plan_participants")
    .insert([
      {
        plan_id: data.id,
        user_id: "8b8c9be1-8de3-46f7-a6bd-4d7e6bdb6467",
        name: "天复小哥",
        avatar_url: "/static/images/avatar/3.jpg",
      },
    ])
    .select()
    .single();

  console.log("新增成功:", data);
  alert("新增成功");

  return data.id;
}


//2.读取supabase storage 数据填充
async function readStorageWriteToRidingPlans(props: {
  planId: string;
  gpxPath: string;
  onDone?: (res: unknown) => void;
}) {
  try {
    const gpxText = await loadGPX(props.gpxPath);
    const { points, times, metadata } = parseGpx(gpxText);

    // console.log(points);
    // console.log(times);
    // console.log(metadata);

    if (!points || points.length < 2)
      throw new Error("No track points found or too few points.");

    // encode polyline
    const encoded = encodePolyline(points);

    // update supabase riding_plans
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (props.gpxPath) updatePayload.title = props.gpxPath;

    const { data, error: upErr } = await supabase
      .from("riding_plans")
      .update(updatePayload)
      .eq("id", props.planId)
      .select()
      .single();

    if (upErr) throw upErr;

    if (props.onDone) props.onDone(data);
  } catch (e: unknown) {
    console.error(e);
  } finally {
  }

}

function GpxCard(props: { fileName: string }) {

  const [loading, setLoading] = useState(false);


  async function handleClick() {
    setLoading(true);

    console.log(props.fileName);

    //1.创建一个riding plan
    const planId = await addRidingPlan();
    // const planId = "";

    if(!planId){
      alert("创建骑行计划失败");
    }
    console.log("planId is ",planId);
    //2.读取数据填充
    readStorageWriteToRidingPlans({
      planId: planId,
      gpxPath: props.fileName,
      onDone: (res) => {
        setLoading(false);
      },
    });
  }

  return (
    <Card
      sx={{
        m: 1,
        borderRadius: 2,
        transition: "0.2s",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Typography
          gutterBottom
          sx={{
            color: "text.secondary",
            fontSize: 14,
            wordBreak: "break-all",
          }}
        >
          {props.fileName}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          px: 2,
          pb: 2,
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          variant="contained"
          disabled={loading}
          onClick={handleClick}
        >
          {loading ? "提交中…" : "提交"}
        </Button>

        {loading && (
          <LinearProgress
            sx={{
              ml: 2,
              flex: 1,
              height: 6,
              borderRadius: 3,
            }}
          />
        )}
      </CardActions>
    </Card>
  );
}

function GpxCardList() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {PATH_ARRAY.map((name) => (
        <GpxCard key={name} fileName={name}></GpxCard>
      ))}
    </Box>
  );
}

export default function GpxListPage() {
  return (
    <Container maxWidth="lg">
      {/* <Grid container spacing={1} sx={{ mb: 1 }}>
        <GpxListContent gpxPath={path}></GpxListContent>
      </Grid> */}
      <Typography variant="h1">GPX List</Typography>
      <GpxCardList></GpxCardList>
      <Footer></Footer>
    </Container>
  );
}
