import Footer from "@/components/Footer";
import TrainingZonesTable from "@/components/TrainingZonesTable";
import { Box, Container, Typography } from "@mui/material";

export default function TestPage() {
  return (
    <Container maxWidth="lg">
      <Box>
        <Typography gutterBottom variant="h1">
          环巢湖骑行Club
        </Typography>

        
      </Box>

      <TrainingZonesTable></TrainingZonesTable>
      <Footer></Footer>
    </Container>
  );
}
