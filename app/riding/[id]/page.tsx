// app/riding/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import CycleDetailPage from "@/components/CycleDetailPage";
import { Box, Typography } from "@mui/material";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function RidingDetail({ params }: Props) {
  const { id } = await params; // ← 必须 await！否则 params 是 Promise

  const { data, error } = await supabase
    .from("riding_plans")
    .select(
       `
          *,
          participants:riding_plan_participants (
          id,
          user_id,
          name,
          avatar_url
          )
        `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <p className="text-8xl text-white tracking-tighter text-balance">
        未找到骑行计划
      </p>
    );
  }else{
    console.log(data)
  }

  return (
    <>
      <Box>
        <Typography variant="h1" gutterBottom>
          {data.title}
        </Typography>
      </Box>
      <CycleDetailPage plan={data} />
      <Footer></Footer>
    </>
  );
}
