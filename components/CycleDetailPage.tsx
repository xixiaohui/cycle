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
  Chip,
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
import CycleMap from "@/components/CycleMap";

interface Props {
  plan: RidingPlanPro;
}

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

  const handleLike = async () => {
    // if (liked) return;

    // localStorage.setItem(likeKey, "true");
    // setLiked(true);
    // setLikes(likes + 1);

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

  const routeLatLngs = useMemo(() => {
    return polyline
      .decode(plan.route_polyline)
      .map(([lat, lng]) => [lat, lng] as [number, number]);
  }, [plan.route_polyline]);

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-1">
        <div className="...">
          <CycleMap routeLatLngs={routeLatLngs} />
        </div>
        <div className="...">
          <Box className="space-y-2">
            <Typography variant="body1">{plan.description}</Typography>
            <div className="grid grid-cols-2 gap-4">
              <div className="...">
                <Typography variant="body2">
                  开始时间: {dayjs(plan.start_time).format("YYYY-MM-DD HH:mm")}
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

          <Divider />

          <Paper className="p-4 bg-gray-50 rounded shadow-sm">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 6 }}>
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
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2">
                  热量: {plan.calories} kcal
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Divider />

          {/* 训练区间 */}
          <Box>
            <Typography
              variant="body2"
              className="text-neutral-500 dark:text-neutral-400 mb-2"
            >
              训练区间 (Z1–Z5)
            </Typography>

            {Object.entries(plan.training_zones as Record<string, number>).map(
              ([zone, v]) => (
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
              )
            )}
          </Box>

          <Divider />

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

          <Divider />
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
        </div>
        <div className="...">
          <Box
            component="img"
            src={plan.map_image_url}
            alt="route"
            loading="eager"
            sx={{
              width: "50%",
              height: "50%", // or "100%" + parent 控制高度
              objectFit: "cover",
              filter: (theme) =>
                theme.palette.mode === "dark"
                  ? "brightness(0.75)"
                  : "brightness(0.95)",
            }}
          />
        </div>
        <div className="col-span-1 col-start-2 ...">
          {/* 评论区 */}
          <Paper className="p-4 space-y-2">
            <Typography variant="h6">评论</Typography>
            {loadingComments ? (
              <Typography>加载中...</Typography>
            ) : comments.length === 0 ? (
              <Typography>暂无评论</Typography>
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
                placeholder="写下你的评论..."
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
    </>
  );
}
