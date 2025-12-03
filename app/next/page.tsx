
import CycleCard from "@/components/CycleCard";
import { Box, Container, Grid, Typography } from "@mui/material";

export default function NextPage() {
  return (
    <Container maxWidth="lg">
        <Grid container columns={12}>
          <Grid size={{xs:12,md:4}}>
            <Box sx={{ display:'flex',flexDirection:'column'}}>
              <Typography variant="h1" gutterBottom>骑行记录</Typography>
              <CycleCard single={false} href="/"></CycleCard>
            </Box>
          </Grid>

        </Grid>
    </Container>
  );
}
