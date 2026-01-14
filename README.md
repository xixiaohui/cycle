
## realtime实时位置轨迹页面

你这个表需要满足：
📍 记录位置（经纬度 / 可扩展海拔）
⏱ 记录时间
默认：插入时自动使用服务器当前时间
可选：支持 GPX 原始时间
🔴 支持 Supabase Realtime
🚴 支持多条轨迹 / 多用户 / 多次骑行

### "第一步"
create table public.track_points (
  id bigint generated always as identity primary key,

  -- 轨迹 / 行程 ID（一次骑行）
  track_id uuid not null,

  -- 用户（可选）
  user_id uuid references auth.users(id) on delete set null,

  -- 位置信息
  latitude double precision not null,
  longitude double precision not null,
  elevation double precision,

  -- GPX 原始时间（可选）
  gpx_time timestamptz,

  -- 服务器记录时间（默认当前）
  created_at timestamptz not null default now()
);

### "第二步"
推荐索引（非常重要）
create index track_points_track_id_idx
on public.track_points (track_id, created_at);

create index track_points_created_at_idx
on public.track_points (created_at);

### "第三步"
确保 RLS 正确  （简单开发阶段（先跑起来））
alter table public.track_points enable row level security;

create policy "public insert"
on public.track_points
for insert
with check (true);

create policy "public select"
on public.track_points
for select
using (true);


## 2026.1.14

## 以骑行为核心活动的会员协作与分享平台

核心价值：
  俱乐部成员一起骑
  实时看到彼此
  结束后能复盘 / 分享