import Footer from "@/components/Footer";
import { Container, Grid, Typography } from "@mui/material";


function Join(){
  return (
  <>
    <Typography variant="h1" gutterBottom>
      环巢湖骑行次数累积次数达50次以上者,可以申请加入
    </Typography>
  </>
  );
}

export default function JoinPage() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Join></Join>
      </Grid>
      <Footer></Footer>
    </Container>
  );
}