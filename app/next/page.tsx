"use client";

import CycleCardPro from "@/components/CycleCardPro";
import Footer from "@/components/Footer";
import { ridingPlanApi } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { RidingPlanPro } from "@/types/ridingPlan";
import { AddAlarm, BikeScooter } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const CACHE_KEY = "ridingPlans";
const saveToLocalCache = (newRecord: RidingPlanPro) => {
  const cached = localStorage.getItem(CACHE_KEY);
  let list: RidingPlanPro[] = [];

  if (cached) {
    try {
      const parsed = JSON.parse(cached);

      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === "object") {
        // 处理几种常见的“不是数组但包含数组”的场景
        if (Array.isArray(parsed.data)) {
          list = parsed.data; // e.g. { data: [...] }
        } else if (Array.isArray(parsed.items)) {
          list = parsed.items; // e.g. { items: [...] }
        } else {
          // parsed 是单个对象（单条记录），把它包成数组
          list = [parsed];
        }
      } else {
        // parsed 是其他类型（数字/字符串/false），重置为空数组
        list = [];
      }
    } catch (err) {
      console.warn("解析缓存失败，重建缓存：", err);
      list = [];
    }
  }

  // 把新记录放最前面，并且去重（以 id 为准）
  const newId = newRecord?.id;
  if (newId) {
    list = [newRecord, ...list.filter((it) => it?.id !== newId)];
  } else {
    // 没有 id 的情形，直接插到前面
    list.unshift(newRecord);
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(list));
};

export default function NextPage() {
  const [plans, setPlans] = useState<RidingPlanPro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddRidingPlan = async () => {
    const random_img_id = Math.floor(Math.random() * 201) + 100;
    const newPlan = {
      title: `新的骑行记录 ${random_img_id}`,
      description: "轻松骑行，呼吸新鲜空气",
      start_time: new Date().toISOString(),
      distance_km: 0,
      duration_min: 0,
      elevation_m:0,
      route_polyline: "",
      start_location: {name:'',lat:0,lng:0},
      end_location:  {name:'',lat:0,lng:0},
      ftp: 100,
      estimated_power: 200,
      calories: 100,
      tss: 70,
      difficulty: 3,
      map_image_url: `https://picsum.photos/id/${random_img_id}/800/450`,
      weather: { temp: 22, summary: "晴", wind_speed: 3 },
      training_zones: {
        Z1: 25,
        Z2: 30,
        Z3: 20,
        Z4: 10,
        Z5: 5,
      },
      likes: 0,
      comments_count:0,
      is_public:true,
      points_count:0,
      decrease:0,
      created_at: new Date().toISOString(),
      user_id:"8b8c9be1-8de3-46f7-a6bd-4d7e6bdb6467",
      name: "天复小哥",
      avatar_url: "/static/images/avatar/3.jpg",
    };

    // const { data, error } = await supabase
    //   .from("riding_plans")
    //   .insert([newPlan])
    //   .select()
    //   .single();

    // if (error) {
    //   console.error(error);
    //   alert("新增失败");
    //   return;
    // }


    ridingPlanApi
      .create(newPlan as unknown as RidingPlanPro)
      .then((data) => {
        alert("新增成功");

        setRefreshKey((p) => p + 1);

        //写入本地localStorage
        saveToLocalCache(data);
      })
      .catch((err) => {
        console.log("没有插入成功")
        console.log(err);
      })
      .finally(() => {});

    // await supabase
    //   .from("riding_plan_participants")
    //   .insert([
    //     {
    //       plan_id: data.id,
    //       user_id: "8b8c9be1-8de3-46f7-a6bd-4d7e6bdb6467",
    //       name: "天复小哥",
    //       avatar_url: "/static/images/avatar/3.jpg",
    //     },
    //   ])
    //   .select()
    //   .single();

    // console.log("新增成功:", data);
    // alert("新增成功");

    // 🔥 触发 useEffect 重新跑
    setRefreshKey((prev) => prev + 1);

    // //写入本地localStorage
    // saveToLocalCache(data);
  };

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);

      // const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时
      // const CACHE_DURATION = 1 * 60 * 1000; //1分钟

      // 1️⃣ 先尝试从 localStorage 读取
      // const cached = localStorage.getItem(CACHE_KEY);
      // let shouldFetch = true;

      // if (cached) {
      //   const parsed = JSON.parse(cached);
      //   const now = Date.now();

      //   // 判断缓存是否过期
      //   if (parsed.timestamp && now - parsed.timestamp < CACHE_DURATION) {
      //     setPlans(parsed.data || []);
      //     shouldFetch = false; // 缓存有效，可以延迟刷新
      //     console.log("从没有过期的缓存获取数据" + parsed.data);
      //   } else {
      //     setPlans(parsed.data || []); // 先显示缓存，即使过期
      //     console.log("从过期缓存获取数据" + parsed.data);
      //   }
      // }

      // 2️⃣ 拉取最新数据（总是拉一次，保持同步）
      // if (shouldFetch) {
        // const { data, error } = await supabase
        //   .from("riding_plans")
        //   .select(
        //     `
        //   *,
        //   participants:riding_plan_participants (
        //   id,
        //   user_id,
        //   name,
        //   avatar_url
        //   )
        // `
        //   )
        //   .order("start_time", { ascending: false })
        //   .limit(100);

        // if (!error && data) {
        //   console.log("从supabase获取数据" + data);
        //   setPlans(data); // 更新页面显示最新数据

        //   // 3️⃣ 更新缓存
        //   localStorage.setItem(
        //     CACHE_KEY,
        //     JSON.stringify({ data, timestamp: Date.now() })
        //   );
        // } else if (error && !cached) {
        //   setPlans([]); // 缓存也不存在，显示空
        //   console.error("获取骑行计划失败:", error);
        // }
      // }

      ridingPlanApi
        .list({ limit: 50 })
        .then((data) => {
          console.log("从数据库获取数据");
          console.log(data);
          setPlans(data); // 更新页面显示最新数据

          // 3️⃣ 更新缓存
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        })
        .catch((error) => {
          setPlans([]); // 缓存也不存在，显示空
          console.error("获取骑行计划失败:", error);
        })
        .finally(() => {
          setLoading(false);
        });

      // setLoading(false);
    }

    fetchPlans();
  }, [refreshKey]); // 空依赖数组，组件挂载时执行一次

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
              Cycling records
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <Box
                sx={{
                  // display: { xs: "none" },
                  flexDirection: "row",
                }}
              >
                <Tooltip title="增加记录" onClick={handleAddRidingPlan}>
                  <AddAlarm></AddAlarm>
                </Tooltip>
                <Typography variant="subtitle1" gutterBottom>
                  骑行
                  <BikeScooter /> 记录
                </Typography>
              </Box>
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
