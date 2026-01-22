"use client";

import Footer from "@/components/Footer";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { fetchRidingPlans } from "@/lib/impl/ridingPlan.postgres";

function Join() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h2" gutterBottom>
        正在开发...
      </Typography>
    </Box>
  );
}

interface TrackPoints {
  track_id: string;
  created_at: string;
}
export interface GetTrackPoints {
  fetchTracks(): Promise<TrackPoints[]>;
}


export const postgresGetTrackPoints: GetTrackPoints = {
  async fetchTracks(): Promise<TrackPoints[]> {
    const res = await fetch("/api/tracks");
    if (!res.ok) {
      throw new Error("PostgreSQL get failed");
    }

    const json = await res.json();

    console.log(json)

    return json.data;
  },
};

export const supabaseGetTrackPoints: GetTrackPoints = {
  async fetchTracks(): Promise<TrackPoints[]> {
    const { data, error } = await supabase
      .from("track_points")
      .select("track_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Supabase get failed");
    }

    // 去重：只保留每个 track_id 最新时间
    const map = new Map<string, string>();
    data.forEach((row) => {
      if (!map.has(row.track_id)) {
        map.set(row.track_id, row.created_at);
      }
    });
    console.log(map)

    // ✅ 关键修复：转成 TrackPoints[]
    return Array.from(map.entries()).map(([track_id, created_at]) => ({
      track_id,
      created_at,
    }));
  },
};

const usePostgres = process.env.USE_SUPABASE === "false";
export const getTrackPoints:GetTrackPoints = usePostgres?supabaseGetTrackPoints:postgresGetTrackPoints;

function StartCycling() {
  const [tracks, setTracks] = useState<TrackPoints[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // const fetchTracks = async () => {
    //   const { data, error } = await supabase
    //     .from("track_points")
    //     .select("track_id, created_at")
    //     .order("created_at", { ascending: false });

    //   if (error) {
    //     setError(error.message);
    //     return;
    //   }

    //   // 去重：只保留每个 track_id 最新时间
    //   const map = new Map<string, string>();
    //   data.forEach((row) => {
    //     if (!map.has(row.track_id)) {
    //       map.set(row.track_id, row.created_at);
    //     }
    //   });

    //   setTracks(Array.from(map.entries()));
    // };

    // fetchTracks();

    getTrackPoints.fetchTracks()
    .then((data) => {
      setTracks(data);

      console.log(data);

    })
    .catch((err)=>{
      setError(err.message);
    });

    

  }, []);

  if (error) return <div>加载失败：{error}</div>;


  return (
    <Box>
      <Paper elevation={3}>
        <List disablePadding>
          {tracks && tracks.map((TrackPoints) => (
            <ListItemButton
              key={TrackPoints.track_id}
              component={Link}
              href={`/tracks/${TrackPoints.track_id}`}
            >
              <ListItemText
                primary={`轨迹 ${TrackPoints.track_id.slice(0, 8)}…`}
                secondary={new Date(TrackPoints.created_at).toLocaleString()}
              />

              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  icon={<DirectionsBikeIcon />}
                  label="骑行"
                  color="primary"
                />
              </Stack>
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default function JoinPage() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Join></Join>
      </Grid>

      <StartCycling></StartCycling>
      <Footer></Footer>
    </Container>
  );
}
