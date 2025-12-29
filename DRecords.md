## 添加主表

create table if not exists riding_plans (
  id uuid primary key default gen_random_uuid(),

  -- 基础信息
  title text not null,
  description text,
  start_time timestamptz not null,

  -- 路线信息
  distance_km numeric,
  duration_min int,
  elevation_m int,
  route_polyline text,
  start_location jsonb,
  end_location jsonb,

  -- 训练信息
  ftp int,
  estimated_power int,
  calories int,
  tss int,
  difficulty int check (difficulty between 1 and 5),
  training_zones jsonb, -- {Z1:30,Z2:40,...}

  -- 天气
  weather jsonb, -- {summary,temp,wind_speed,...}

  -- 图像
  map_image_url text,

  -- 社交
  likes int default 0,
  comments_count int default 0,
  is_public boolean default true,

  --新增
  points_count int,
  decrease int,

  created_at timestamptz default now()
);

## SQL：riding_plan_participants（参与者表）

create table if not exists riding_plan_participants (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references riding_plans(id) on delete cascade,
  user_id uuid not null,
  name text,
  avatar_url text
);

## SQL：riding_plan_comments（评论表）

create table if not exists riding_plan_comments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references riding_plans(id) on delete cascade,
  user_id uuid,
  content text,
  created_at timestamptz default now()
);

## SQL：route_segments（路线分段表，用于海拔图）

create table if not exists route_segments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references riding_plans(id) on delete cascade,
  index int,
  distance_m numeric,
  elevation_m numeric,
  slope numeric
);

### 把现有的 CycleCard / riding_plans 系统扩展为一个“社区 + 路线市场 + 训练分析 + 实时协作”的专业级骑行平台，
### 支持高并发 GPX/实时轨迹、段（segment）竞速、社交、推荐与训练负荷分析，并能水平扩展到数十万活跃用户。

