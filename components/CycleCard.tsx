"use client";
import { formatKeepUTC } from "../lib/util";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RidingPlan } from "../lib/util";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";

type CycleCardProps = {
  single?: boolean;
  href?:string;
};

export default function CycleCard({ single = false , href='/next'}: CycleCardProps) {
  const [plans, setPlans] = useState<RidingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
            .from("riding_plans")
            .select("*")
            .order("start_time", { ascending: false });
      if (error) {
        console.error(error);
      } else {
        const list = data as RidingPlan[];
        console.log(single)
        setPlans(single ? list.slice(0, 1) : list);
      }
      setLoading(false);
    }

    loadData();
  }, [single]);

  if (loading)
    return (
      // <Box sx={{ minHeight: 200, border: "1px solid #eee" }}>
      //   <CenterLoader />
      // </Box>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          p: 4,
        }}
      >
        <CircularProgress size={24}></CircularProgress>
      </Box>
    );
  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {plans.map((item) => (
          <Link href={href} key={item.id}>
            <Card variant="outlined">
              <CardMedia
                component="img"
                alt="骑行预报"
                image={item.cover_url || "https://picsum.photos/id/121/800/450"}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {item.title}
                </Typography>
                <Typography gutterBottom variant="body1" component="div">
                  {formatKeepUTC(item.start_time)}
                </Typography>
                <Typography variant="body1">{item.location}</Typography>
                <Typography variant="body1">{item.description}</Typography>
                <Typography variant="body1">{item.difficulty},{item.distance_km}</Typography>
               
                <Typography variant="body1">{formatKeepUTC(item.end_time!)}</Typography>

              </CardContent>
              <CardActions sx={{ display: { xs: "flex", md: "none" } }}>
                <Button>查看</Button>
              </CardActions>
            </Card>
          </Link>
        ))}
      </Box>
    </>
  );
}
