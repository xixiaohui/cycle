import { supabaseRidingPlanApi } from "../impl/ridingPlan.supabase";
import { postgresRidingPlanApi } from "../impl/ridingPlan.postgres";
import { RidingPlanApi } from "./ridingPlanApi";

const usePostgres = process.env.USE_SUPABASE === "true";

export const ridingPlanApi: RidingPlanApi = usePostgres
  ? supabaseRidingPlanApi
  : postgresRidingPlanApi;
