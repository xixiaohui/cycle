"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { RidingPlanPro } from "@/types/ridingPlan";
import Image from "next/image";
import { formatDayjs } from "@/lib/util";

type CycleCardProps = {
  single?: boolean;
  href?: string;
};

export default function CycleCard({
  single = false,
  href = "/next",
}: CycleCardProps) {
  const [plans, setPlans] = useState<RidingPlanPro[]>([]);
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
        const list = data as RidingPlanPro[];
        console.log(single);
        setPlans(single ? list.slice(0, 1) : list);
      }
      setLoading(false);
    }

    loadData();
  }, [single]);

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
    <>
      {plans.map((data) => (
        <Link href={href} key={data.id}>
          <Card
            className="
                    rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800
                    bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-300
                  "
          >
            {/* Banner */}
            <Box className="relative w-full h-48 md:h-56">
              <Image
                src={data.map_image_url}
                alt="route"
                fill
                sizes="800px"
                className="object-cover brightness-95 dark:brightness-75"
              />

              <Box className="absolute top-3 left-3 flex gap-2">
                <Chip
                  label={`${data.weather.summary} · ${data.weather.temp}°C`}
                  color="primary"
                />
                <Chip
                  label={`风 ${data.weather.wind_speed} km/h`}
                  color="default"
                />
              </Box>
            </Box>

            <CardContent className="space-y-4">
              {/* 标题 */}
              <Box>
                <Typography variant="h6" className="font-bold">
                  {data.title}
                </Typography>
                {data.description && (
                  <Typography
                    variant="body2"
                    className="text-neutral-500 dark:text-neutral-400"
                  >
                    {data.description}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className="text-neutral-400 block mt-1"
                >
                  出发时间：{formatDayjs(data.start_time)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
}
