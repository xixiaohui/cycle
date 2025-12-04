
// types/ridingPlan.ts
export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface TrainingZones {
  Z1: number;
  Z2: number;
  Z3: number;
  Z4: number;
  Z5: number;
}

export interface Weather {
  summary: string;
  temp: number;
  wind_speed: number;
}

export interface RidingPlanPro {
  id: number;
  title: string;
  description: string;
  start_time: string;
  distance_km: number;
  duration_min: number;
  elevation_m: number;
  route_polyline: string;
  start_location: Location;
  end_location: Location;
  ftp: number;
  estimated_power: number;
  calories: number;
  tss: number;
  difficulty: number;
  training_zones: TrainingZones;
  weather: Weather;
  map_image_url: string;
  likes: number;
  comments_count: number;
  is_public: boolean;
  created_at: string;
}

export interface Comment {
  id:number;
  plan_id:number;
  content:string;
  created_at:string;
}