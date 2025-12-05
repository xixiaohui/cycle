"use client";
import CycleCard from "@/components/CycleCard";
import CycleCardPro from "@/components/CycleCardPro";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { RidingPlanPro } from "@/types/ridingPlan";
import { BikeScooter } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function NextPage() {
  const [plans, setPlans] = useState<RidingPlanPro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      const { data, error } = await supabase
        .from("riding_plans")
        .select(
          `
          *,
          participants:riding_plan_participants (
          id,
          user_id,
          name,
          avatar_url
          )
        `
        )
        .order("start_time", { ascending: false })
        .limit(10);

      if (error) {
        console.error("获取骑行计划失败:", error);
        setPlans([]);
      } else {
        console.log(data)
        setPlans(data || []);
      }
      setLoading(false);
    }

    fetchPlans();
  }, []); // 空依赖数组，组件挂载时执行一次

  if (loading)
    return (
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
    <Container
      maxWidth="lg"
      // sx={{ border: "1px solid red" }}
    >
      <Grid
        container
        spacing={2}
        // sx={{ border: "1px solid blue" }}
      >
        <Grid
          size={12}
          // sx={{ border: "1px solid blue" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {xs:"column",md:"row"},
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h1" gutterBottom>
              Cycling record
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <Typography variant="body1" gutterBottom>
                <BikeScooter /> 骑行记录
              </Typography>
            </Box>
          </Box>
        </Grid>


        <Box className="p-1 w-full" >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <CycleCardPro key={plan.id} data={plan} />
            ))}
          </div>
        </Box>

      </Grid>
      <Footer></Footer>
    </Container>
  );
}
