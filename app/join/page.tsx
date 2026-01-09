"use client"

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
} from "@mui/material"
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike"

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

function Join(){
  return (
  <Box sx={{
    display:'flex',
    flexDirection:"column"
  }}>
    <Typography variant="h2" gutterBottom>
      正在开发...
    </Typography>
  </Box>
  );
}


function StartCycling(){
  const [tracks, setTracks] = useState<[string, string][]>([])
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {

    const fetchTracks = async () => {
      const { data, error } = await supabase
        .from("track_points")
        .select("track_id, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      // 去重：只保留每个 track_id 最新时间
      const map = new Map<string, string>()
      data.forEach(row => {
        if (!map.has(row.track_id)) {
          map.set(row.track_id, row.created_at)
        }
      })

      setTracks(Array.from(map.entries()))
    }

    fetchTracks()

  }, [])

  if (error) return <div>加载失败：{error}</div>

  return(
    <Box>
      <Paper elevation={3}>
        <List disablePadding>
          {tracks.map(([trackId, time]) => (
            <ListItemButton
              key={trackId}
              component={Link}
              href={`/tracks/${trackId}`}
            >
              <ListItemText
                primary={`轨迹 ${trackId.slice(0, 8)}…`}
                secondary={new Date(time).toLocaleString()}
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