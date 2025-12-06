"use client";

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

      const CACHE_KEY = "ridingPlans";
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时
      // const CACHE_DURATION = 1 * 60 * 1000; //1分钟

      // 1️⃣ 先尝试从 localStorage 读取
      const cached = localStorage.getItem(CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();

        // 判断缓存是否过期
        if (parsed.timestamp && now - parsed.timestamp < CACHE_DURATION) {
          setPlans(parsed.data || []);
          shouldFetch = false; // 缓存有效，可以延迟刷新
          console.log("从没有过期的缓存获取数据" + parsed.data);
        } else {
          setPlans(parsed.data || []); // 先显示缓存，即使过期
          console.log("从过期缓存获取数据" + parsed.data);
        }
      }

      // 2️⃣ 拉取最新数据（总是拉一次，保持同步）
      if (shouldFetch) {
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
          .limit(100);

        if (!error && data) {
          console.log("从supabase获取数据" + data);
          setPlans(data); // 更新页面显示最新数据
          // 3️⃣ 更新缓存
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } else if (error && !cached) {
          setPlans([]); // 缓存也不存在，显示空
          console.error("获取骑行计划失败:", error);
        }
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
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid
          size={12}
          // sx={{ border: "1px solid blue" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
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

        <Box className="p-1 w-full">
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
