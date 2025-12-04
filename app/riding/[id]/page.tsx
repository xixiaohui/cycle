// app/riding/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import CycleDetailPage from "@/components/CycleDetailPage";
import { Box, Container, Grid, Typography } from "@mui/material";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function RidingDetail({ params }: Props) {
  const { id } = await params; // ← 必须 await！否则 params 是 Promise

  const { data, error } = await supabase
    .from("riding_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return <p className="p-4">未找到骑行计划</p>;
  }

  return (
    <Container maxWidth="lg">
      <Grid size={12}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h1" gutterBottom>
            详情
          </Typography>
        </Box>
      </Grid>
      <CycleDetailPage plan={data} />

    </Container>
  );
}
