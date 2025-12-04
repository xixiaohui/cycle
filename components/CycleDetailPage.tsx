"use client";

import { useEffect, useState } from "react";
import { RidingPlanPro, Comment } from "@/types/ridingPlan";
import dayjs from "dayjs";

// MUI
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";


import polyline from "polyline";

// Supabase
import { supabase } from "@/lib/supabaseClient";

interface Props {
  plan: RidingPlanPro;
}

import dynamic from "next/dynamic";

const CycleMap = dynamic(() => import("@/components/CycleMap"), {
  ssr: false,
});

export default function CycleDetailPage({ plan }: Props) {
  const [likes, setLikes] = useState(plan.likes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);

  // 获取评论
  useEffect(() => {
    async function fetchComments() {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("riding_plan_comments")
        .select("*")
        .eq("plan_id", plan.id)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("获取评论失败", error);
      } else {
        setComments(data || []);
      }
      setLoadingComments(false);
    }

    fetchComments();
  }, [plan.id]);

  // 点赞
  const handleLike = async () => {
    setLikes(likes + 1);
    await supabase
      .from("riding_plans")
      .update({ likes: likes + 1 })
      .eq("id", plan.id);
  };

  // 发送评论
  const handleSendComment = async () => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      plan_id: plan.id,
      content: commentInput,
      created_at: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    setCommentInput("");

    await supabase
      .from("riding_plan_comments")
      .insert({ plan_id: plan.id, content: newComment.content });
  };

  // 解析路线
  const routeLatLngs: [number, number][] = polyline
    .decode(plan.route_polyline)
    .map(([lat, lng]) => [lat, lng]);


  return (
    <Box className="p-4 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Box className="space-y-2">
        <Button
          variant="text"
          color="primary"
          onClick={() => window.history.back()}
        >
          ← 返回
        </Button>
        <Typography variant="h4" component="h1" className="font-bold">
          {plan.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {plan.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          开始时间: {dayjs(plan.start_time).format("YYYY-MM-DD HH:mm")} | 距离: {plan.distance_km} km | 时长: {plan.duration_min} min | 爬升: {plan.elevation_m} m
        </Typography>
        <Typography variant="body2" color="text.secondary">
          天气: {plan.weather.summary} {plan.weather.temp}°C 风速 {plan.weather.wind_speed} km/h
        </Typography>
      </Box>

      <Paper className="rounded overflow-hidden shadow-md h-[400px]">
        <CycleMap routeLatLngs={routeLatLngs} />
      </Paper>

      {/* 训练数据 */}
      <Paper className="p-4 bg-gray-50 rounded shadow-sm">
        <Grid container spacing={2}>
          <Grid size={{ xs:6,md:3}}>难度: {plan.difficulty} ⭐</Grid>
          <Grid size={{ xs:6,md:3}}>TSS: {plan.tss}</Grid>
          <Grid size={{ xs:6,md:3}}>FTP: {plan.ftp}</Grid>
          <Grid size={{ xs:6,md:3}}>热量: {plan.calories} kcal</Grid>
          <Grid size={{ xs:6,md:3}}>Z1: {plan.training_zones.Z1}</Grid>
          <Grid size={{ xs:6,md:3}}>Z2: {plan.training_zones.Z2}</Grid>
          <Grid size={{ xs:6,md:3}}>Z3: {plan.training_zones.Z3}</Grid>
          <Grid size={{ xs:6,md:3}}>Z4: {plan.training_zones.Z4}</Grid>
          <Grid size={{ xs:6,md:3}}>Z5: {plan.training_zones.Z5}</Grid>
        </Grid>
      </Paper>

      {/* 点赞和评论 */}
      <Box className="flex items-center space-x-4">
        <IconButton color="error" onClick={handleLike}>
          <FavoriteIcon />
        </IconButton>
        <Typography>{likes}</Typography>

        <IconButton color="primary">
          <CommentIcon />
        </IconButton>
        <Typography>{comments.length}</Typography>
      </Box>

      {/* 评论区 */}
      <Paper className="p-4 space-y-2">
        <Typography variant="h6">评论</Typography>
        {loadingComments ? (
          <Typography color="text.secondary">加载中...</Typography>
        ) : comments.length === 0 ? (
          <Typography color="text.secondary">暂无评论</Typography>
        ) : (
          comments.map((c) => (
            <Box key={c.id} className="border-b py-1">
              <Typography variant="body2">{c.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(c.created_at).format("YYYY-MM-DD HH:mm")}
              </Typography>
            </Box>
          ))
        )}
        <Box className="flex gap-2 mt-2">
          <TextField
            variant="outlined"
            size="small"
            placeholder="写下你的评论..."
            fullWidth
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSendComment}>
            发送
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}