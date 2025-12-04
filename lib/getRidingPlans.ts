// lib/getRidingPlans.ts
import { supabase } from "./supabaseClient";
import { RidingPlanPro } from "@/types/ridingPlan";

export async function getRidingPlans(limit = 10): Promise<RidingPlanPro[]> {
  const { data, error } = await supabase
    .from("riding_plans")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase 获取骑行数据失败:", error);
    return [];
  }

  return data || [];
}
