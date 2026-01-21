import { RidingPlanPro } from "@/types/ridingPlan";

export interface RidingPlanListQuery {
  limit?: number;
  offset?: number;
  userId?: string;
}

export interface RidingPlanUpdate {
  title?: string;
  description?: string;
  start_time?: string; // ISO 字符串
  distance_km?: number;
  duration_min?: number;
  elevation_m?: number;
}

/**
 * 统一接口（抽象）
 */
export interface RidingPlanApi {
  create(plan: RidingPlanPro): Promise<RidingPlanPro>;
  list(query?: RidingPlanListQuery): Promise<RidingPlanPro[]>;
  getById(id: string): Promise<RidingPlanPro | null>;
  update(id: string, patch: RidingPlanUpdate): Promise<RidingPlanPro>;
  remove(id: string): Promise<void>;


  
}
