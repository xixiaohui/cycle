
import { RidingPlanApi, RidingPlanListQuery, RidingPlanUpdate } from "../api/ridingPlanApi";
import { supabase } from "../supabaseClient";
import { RidingPlanPro } from '../../types/ridingPlan';

export const supabaseRidingPlanApi: RidingPlanApi = {
  async create(plan: RidingPlanPro): Promise<RidingPlanPro> {
    const { data, error } = await supabase
      .from("riding_plans")
      .insert([plan])
      .select()
      .single();

    if (error) throw error;

    await supabase.from("riding_plan_participants").insert([
      {
        plan_id: data.id,
        name: plan.title,
      },
    ]);

    return data;
  },

  list: function (query?: RidingPlanListQuery): Promise<RidingPlanPro[]> {
    throw new Error("Function not implemented.");
  },

  getById: function (id: string): Promise<RidingPlanPro | null> {
    throw new Error("Function not implemented.");
  },

  update: function (id: string, patch: RidingPlanUpdate): Promise<RidingPlanPro> {
    throw new Error("Function not implemented.");
  },
  
  remove: function (id: string): Promise<void> {
    throw new Error("Function not implemented.");
  }
};
