import { RidingPlanPro } from "@/types/ridingPlan";
import {
  RidingPlanApi,
  RidingPlanListQuery,
  RidingPlansPage,
  RidingPlanUpdate,
} from "../api/ridingPlanApi";

export const postgresRidingPlanApi: RidingPlanApi = {
  async create(plan: RidingPlanPro): Promise<RidingPlanPro> {
    const res = await fetch("/api/riding-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });

    if (!res.ok) {
      throw new Error("PostgreSQL insert failed");
    }

    return res.json();
  },

  async list(query?: RidingPlanListQuery) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = new URLSearchParams(query as any).toString();
    const res = await fetch(`/api/riding-plans?${params}`, {
      cache: "no-store",
    });

    const json = await res.json();
    return json.data;
  },

  async getById(id: string) {
    const res = await fetch(`/api/riding-plans/${id}`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.data ?? null;
  },

  async update(id: string, patch: RidingPlanUpdate) {
    const res = await fetch(`/api/riding-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    return res.json();
  },

  async remove(id: string) {
    await fetch(`/api/riding-plans/${id}`, { method: "DELETE" });
  },
};

export async function fetchRidingPlans(offset: number, limit = 10) {
  const res = await fetch(`/api/riding-plans?limit=${limit}&offset=${offset}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("获取骑行计划失败");
  }

  return res.json();
}