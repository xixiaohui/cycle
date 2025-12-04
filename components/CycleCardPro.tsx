"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import Image from "next/image";
import { AccessTime, FavoriteBorder } from "@mui/icons-material";
import { RidingPlanPro } from "@/types/ridingPlan";
import { formatDayjs } from "@/lib/util";



interface CycleCardProps {
  data: RidingPlanPro;
}

export default function CycleCardPro({ data }: CycleCardProps) {
  return (
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
          className="object-cover brightness-95 dark:brightness-75"
        />

        <Box className="absolute top-3 left-3 flex gap-2">
          <Chip label={`${data.weather.summary} · ${data.weather.temp}°C`} color="primary" />
          <Chip label={`风 ${data.weather.wind_speed} km/h`} color="default" />
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
          <Typography variant="caption" className="text-neutral-400 block mt-1">
            出发时间：{formatDayjs(data.start_time)}
          </Typography>
        </Box>

        {/* 指标数据栏 */}
        <Box className="grid grid-cols-3 gap-3 text-center">
          <Box>
            <Typography variant="body2" className="text-neutral-500 dark:text-neutral-400">
              距离
            </Typography>
            <Typography className="font-semibold">{data.distance_km} km</Typography>
          </Box>
          <Box>
            <Typography variant="body2" className="text-neutral-500 dark:text-neutral-400">
              时长
            </Typography>
            <Typography className="font-semibold">
              {Math.round(data.duration_min / 60)}h {data.duration_min % 60}m
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" className="text-neutral-500 dark:text-neutral-400">
              爬升
            </Typography>
            <Typography className="font-semibold">{data.elevation_m} m</Typography>
          </Box>
        </Box>

        {/* 难度 */}
        <Box className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded ${
                i < data.difficulty
                  ? "bg-green-500"
                  : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            />
          ))}
          <Typography className="text-sm text-neutral-500">难度 {data.difficulty}/5</Typography>
        </Box>

        <Divider />

        {/* 训练区间 */}
        <Box>
          <Typography
            variant="body2"
            className="text-neutral-500 dark:text-neutral-400 mb-2"
          >
            训练区间 (Z1–Z5)
          </Typography>

          {/* {data.training_zones.map((v, i) => (
            <Box key={i} className="mb-2">
              <Box className="flex justify-between text-xs mb-1">
                <span>Z{i + 1}</span>
                <span>{v}%</span>
              </Box>
              <LinearProgress
                variant="determinate"
                value={v}
                className="rounded-lg h-2"
              />
            </Box>
          ))} */}
        </Box>

        <Divider />

        {/* 专业指标 */}
        <Box className="grid grid-cols-2 gap-3 text-sm">
          <Box>
            <Typography className="text-neutral-500">FTP</Typography>
            <Typography className="font-semibold">{data.ftp} W</Typography>
          </Box>
          <Box>
            <Typography className="text-neutral-500">预估功率</Typography>
            <Typography className="font-semibold">{data.estimated_power} W</Typography>
          </Box>
          <Box>
            <Typography className="text-neutral-500">卡路里消耗</Typography>
            <Typography className="font-semibold">{data.calories} kcal</Typography>
          </Box>
          <Box>
            <Typography className="text-neutral-500">TSS</Typography>
            <Typography className="font-semibold">{data.tss}</Typography>
          </Box>
        </Box>

        <Divider />

        {/* 参与人 */}
        <Box className="flex justify-between items-center">
          {/* <AvatarGroup max={4}>
            {participants.map((p) => (
              <Avatar key={p.id} src={p.avatar_url} alt={p.name} />
            ))}
          </AvatarGroup> */}

          <Button variant="outlined" startIcon={<FavoriteBorder />}>
            收藏
          </Button>
        </Box>

        {/* CTA */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          className="mt-3!"
          href={`/riding/${data.id}`}
          startIcon={<AccessTime />}
        >
          查看计划详情
        </Button>
      </CardContent>
    </Card>
  );
}
