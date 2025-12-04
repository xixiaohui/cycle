
## Getting Started

create table riding_plans (
  id uuid primary key default uuid_generate_v4(),

  title text not null,                     -- 标题：如「巢湖环湖 120km」
  description text,                        -- 内容描述
  start_time timestamptz not null,         -- 开始时间
  end_time timestamptz,                    -- 结束时间（可选）

  location text,                           -- 地点描述，如「巢湖市滨湖绿道入口」
  latitude double precision,               -- GPS 纬度（可选）
  longitude double precision,              -- GPS 经度（可选）

  distance_km numeric(6,2),                -- 预计公里数，如 80.50
  difficulty text default '普通',        -- 难度：简单 / 普通 / 困难

  cover_url text,                          -- 封面图 URL（可选）

  created_at timestamptz default now(),
  user_id uuid references auth.users(id)   -- 创建者
);



