"use client";

import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  TextField,
  AvatarGroup,
  Avatar,
  LinearProgress,
  Divider,
} from "@mui/material";

import { Favorite, FavoriteBorder } from "@mui/icons-material";
import CommentIcon from "@mui/icons-material/Comment";
import { useEffect, useMemo, useState } from "react";
import { RidingPlanPro, Comment } from "@/types/ridingPlan";

import dayjs from "dayjs";
import polyline from "polyline";

// Supabase
import { supabase } from "@/lib/supabaseClient";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import dynamic from "next/dynamic";

interface Props {
  plan: RidingPlanPro;
}

const Map = dynamic(() => import("../components/CycleMap"), {
  ssr: false,
});

export default function CycleDetailPage({ plan }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);

  const [likes, setLikes] = useState(plan.likes);
  const [liked, setLiked] = useState(false);

  // 获取评论
  useEffect(() => {
    async function fetchComments() {
      setLoadingComments(true);

      // 1️⃣ 尝试读取本地缓存
      const cached = localStorage.getItem(`comments-${plan.id}`);
      if (cached) {
        setComments(JSON.parse(cached));
        setLoadingComments(false); // 先显示缓存
      }

      // 2️⃣ 再从 Supabase 拉取最新数据
      const { data, error } = await supabase
        .from("riding_plan_comments")
        .select("*")
        .eq("plan_id", plan.id)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("获取评论失败", error);
        if (!cached) setComments([]); // 缓存不存在时显示空
      } else {
        setComments(data || []);
        // 3️⃣ 缓存到 localStorage
        localStorage.setItem(`comments-${plan.id}`, JSON.stringify(data));
      }
      setLoadingComments(false);
    }
    async function isHaveliked() {
      const stored = localStorage.getItem(`liked-${plan.id}`);
      if (stored === "true") {
        setLiked(true);
      }
    }

    fetchComments();
    isHaveliked();
  }, [plan.id]);

  const handleLike = async () => {
    if (liked) return;

    setLiked(true);
    setLikes(likes + 1);
    localStorage.setItem(`liked-${plan.id}`, "true");

    // 更新 localStorage 缓存
    const cached = localStorage.getItem("ridingPlans");

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        console.log(parsed.data)
        const updatedPlans = parsed.data.map((p:RidingPlanPro) =>
          p.id === plan.id ? { ...p, likes: p.likes + 1 } : p
        );
        console.log(updatedPlans)

        localStorage.setItem("ridingPlans", JSON.stringify(updatedPlans));

      } catch (err) {
        console.error("解析 ridingPlans 缓存失败:", err);
      }

    }

    const { error } = await supabase
      .from("riding_plans")
      .update({ likes: likes + 1 })
      .eq("id", plan.id);

    if (error) {
      console.error("更新数据库失败:", error);
      // 回滚本地状态和缓存
      setLikes(likes);
      setLiked(false);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          localStorage.setItem("ridingPlans", JSON.stringify(parsed));
        } catch {}
      }
    }
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

    // 1️⃣ 更新页面显示
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // 2️⃣ 更新本地缓存
    localStorage.setItem(
      `comments-${plan.id}`,
      JSON.stringify(updatedComments)
    );

    // 3️⃣ 清空输入框
    setCommentInput("");

    // 4️⃣ 异步插入数据库
    const { error } = await supabase
      .from("riding_plan_comments")
      .insert({ plan_id: plan.id, content: newComment.content });

    if (error) {
      console.error("发送评论失败", error);
      // 可选：回滚缓存或显示错误提示
    }
  };

  const routeLatLngs = useMemo(() => {
    return polyline
      .decode(plan.route_polyline)
      .map(([lat, lng]) => [lat, lng] as [number, number]);
  }, [plan.route_polyline]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="m-2 grid md:grid-cols-2">
          <div className="md:col-start-2">
            <Box className="space-y-2">
              <Typography variant="body1">{plan.description}</Typography>
              <div className="grid grid-cols-2 gap-4">
                <div className="...">
                  <Typography variant="body2">
                    开始时间:{" "}
                    {dayjs(plan.start_time).format("YYYY-MM-DD HH:mm")}
                  </Typography>
                  <Typography variant="body2">
                    距离: {plan.distance_km} km
                  </Typography>
                  <Typography variant="body2">
                    时长: {plan.duration_min} min
                  </Typography>
                </div>
                <div className="...">
                  <Typography variant="body2">
                    爬升: {plan.elevation_m} m
                  </Typography>
                  <Typography variant="body2">
                    天气: {plan.weather.summary} {plan.weather.temp}°C
                  </Typography>
                  <Typography variant="body2">
                    风速: {plan.weather.wind_speed} km/h
                  </Typography>
                </div>
              </div>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Paper className="p-4 bg-gray-50 rounded shadow-sm">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 5 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2">难度：</Typography>
                    {[1, 2, 3, 4, 5].map((i) =>
                      i <= plan.difficulty ? (
                        <StarIcon
                          key={i}
                          fontSize="small"
                          sx={{ color: "#FFD700" }}
                        />
                      ) : (
                        <StarBorderIcon
                          key={i}
                          fontSize="small"
                          sx={{ color: "#FFD700" }}
                        />
                      )
                    )}
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <Typography variant="body2">TSS: {plan.tss}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <Typography variant="body2">FTP: {plan.ftp}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2">
                    热量: {plan.calories} kcal
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Divider sx={{ my: 1 }} />

            {/* 训练区间 */}
            <Box>
              <Typography
                variant="body2"
                className="text-neutral-500 dark:text-neutral-400 mb-2"
              >
                训练区间 (Z1–Z5)
              </Typography>

              {Object.entries(
                plan.training_zones as Record<string, number>
              ).map(([zone, v]) => (
                <Box key={zone} className="mb-2">
                  <Box className="flex justify-between text-xs mb-1">
                    <span>{zone}</span>
                    <span>{v}%</span>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={v}
                    className="rounded-lg h-2"
                  />
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box className="flex justify-between items-center mt-0.5">
              <AvatarGroup max={9}>
                {(plan.participants ?? []).map((p) => (
                  <Avatar
                    key={p.id}
                    src={p.avatar_url}
                    alt={p.name}
                    sx={{ width: 27, height: 27 }}
                  />
                ))}
              </AvatarGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* 点赞和评论 */}
            <Box className="flex items-center space-x-4">
              <IconButton color="error" onClick={handleLike}>
                {liked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <Typography>{likes}</Typography>

              <IconButton color="primary">
                <CommentIcon />
              </IconButton>
              <Typography>{comments.length}</Typography>
            </Box>

            <Box
              className="md:hidden"
              component="img"
              src={plan.map_image_url}
              alt="route"
              loading="eager"
              sx={{
                width: "100%",
                objectFit: "cover",

                filter: (theme) =>
                  theme.palette.mode === "dark"
                    ? "brightness(0.75)"
                    : "brightness(0.95)",
              }}
            />
          </div>
        </div>

        <div className="m-2 grid md:grid-cols-5">
          <div className="md:col-start-2 md:col-end-5">
            {/* 留言区 */}
            <Paper className="p-4 space-y-2">
              <Typography variant="h6">留言</Typography>
              {loadingComments ? (
                <Typography>加载中...</Typography>
              ) : comments.length === 0 ? (
                <Typography>暂无留言</Typography>
              ) : (
                comments.map((c) => (
                  <Box key={c.id} className="border-b py-1">
                    <Typography variant="body2">{c.content}</Typography>
                    <Typography variant="caption">
                      {dayjs(c.created_at).format("YYYY-MM-DD HH:mm")}
                    </Typography>
                  </Box>
                ))
              )}
              <Box className="flex gap-2 mt-2">
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="这里可以留言..."
                  fullWidth
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendComment}
                >
                  发送
                </Button>
              </Box>
            </Paper>
          </div>
        </div>
      </div>
      <div className="m-2 grid grid-cols-1">
        <div className="m-2">
          <Map routeLatLngs={routeLatLngs} />
        </div>
      </div>
    </>
  );
}
