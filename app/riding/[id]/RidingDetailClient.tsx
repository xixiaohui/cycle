"use client";

import { supabase } from "@/lib/supabaseClient";
import CycleDetailPage from "@/components/CycleDetailPage";
import { Box, CircularProgress, Typography } from "@mui/material";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { RidingPlanPro } from "@/types/ridingPlan";

interface Props {
  planId: string;
}
export default function RidingDetailClient({ planId }: Props) {
  const [plan, setPlan] = useState<RidingPlanPro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = `ridingPlans`; //整个列表缓存
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时
    // const CACHE_DURATION = 1 * 60 * 1000; //1分钟

    async function fetchPlan() {
      setLoading(true);

      let cachedPlans: RidingPlanPro[] = [];
      let needFetch = true;

      // 1️⃣ 读取缓存
      // 1️⃣ 读取缓存列表
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();

        if (parsed.timestamp && now - parsed.timestamp < CACHE_DURATION) {
          cachedPlans = parsed.data || [];
          needFetch = false;
        } else {
          cachedPlans = parsed.data || []; // 先显示旧缓存
        }

        // 从缓存列表中找当前 plan
        console.log(cachedPlans);

        const cachedPlan = cachedPlans.find((p) => String(p.id) === planId);
        if (cachedPlan) setPlan(cachedPlan);
      }

      // 2️⃣ 拉取最新数据（缓存不存在或过期）
      if (needFetch) {
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
          .eq("id", planId)
          .single();

        if (!error && data) {
          setPlan(data);
          // 3️⃣ 更新整个列表缓存（可选择只更新单条或重新 fetch 列表）
          // 简单起见，这里直接覆盖缓存列表中该条计划
          const updatedPlans = cachedPlans.filter(
            (p) => String(p.id) !== planId
          );
          updatedPlans.push(data);

          console.log("RidingDetailClient--line 76--")
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: updatedPlans, timestamp: Date.now() })
          );
        }
      }

      setLoading(false);
    }

    fetchPlan();
  }, [planId]);

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
  if (!plan)
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Typography>没找到骑行计划</Typography>
      </Box>
    );

  return (
    <>
      {/* <Box>
        <Typography variant="h1" gutterBottom>
          {plan.title}
        </Typography>
      </Box> */}
      
      <CycleDetailPage plan={plan} />
      <Footer />
    </>
  );
}
