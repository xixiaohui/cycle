import Footer from "@/components/Footer";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

function Join(){
  return (
  <Box sx={{
    display:'flex',
    flexDirection:"column"
  }}>
    <Typography variant="h2" gutterBottom>
      环巢湖骑行累积次数达50次以上
    </Typography>
  </Box>
  );
}


function StartCycling(){

  // const trackId = uuidv4();
  const trackId = 'f7c72055-f831-4f0d-a1fe-be632de5b4c8';

  return(
    <Box>
      <Link href={`/tracks/${trackId}`}>
        <Button>
          <Typography variant="subtitle1" gutterBottom>骑行直播</Typography>
        </Button>
      </Link>
    </Box>
  );
}

export default function JoinPage() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Join></Join>
      </Grid>

      <StartCycling></StartCycling>
      <Footer></Footer>
    </Container>
  );
}