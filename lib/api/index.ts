import { supabaseRidingPlanApi } from "../impl/ridingPlan.supabase";
import { postgresRidingPlanApi } from "../impl/ridingPlan.postgres";
import { RidingPlanApi } from "./ridingPlanApi";

const usePostgres = false;


export const ridingPlanApi: RidingPlanApi = usePostgres
  ? supabaseRidingPlanApi
  : postgresRidingPlanApi;