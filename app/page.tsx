"use client";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CYCLE_TEXT} from "../lib/util";
import CycleCard from "@/components/CycleCard";

//content
function Title() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          my: { xs: 1, md: 2 },
          width: "100%",
        }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Typography variant={isSmall ? "h2" : "h1"}>
              Chaohucycling Club
            </Typography>
            {/* <p className="text-4xl color[#1c1f33] tracking-tighter text-balance">
                Chaohucycling Club
              </p> */}
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {CYCLE_TEXT[0]}
            </Typography>
          </Box>
        </Grid>
      </Box>
    </>
  );
}

// 内容 在移动端隐藏
function Content() {
  return (
    <>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              // border: "1px solid red",
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="body2">{CYCLE_TEXT[1]}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              // border: "1px solid red",
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="body2">{CYCLE_TEXT[2]}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  height: "100%",
                }}
              >
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="body2">{CYCLE_TEXT[3]}</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  height: "100%",
                }}
              >
                <Card sx={{ flex: 1 }}>
                  <CardMedia
                    component="img"
                    src="chaohu3.svg"
                    alt="chaohu"
                    sx={{
                      p: 3,
                    }}
                  ></CardMedia>
                  <CardContent>
                    <Typography variant="body2">{CYCLE_TEXT[4]}</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }} offset={{ xs: 0, md: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: "100%",
                  // border: "1px solid red",
                }}
              >
                <Typography variant="h6">最新</Typography>
                <CycleCard single={true}></CycleCard>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <Grid size={12}>
          <CycleCard single={true}></CycleCard>
        </Grid>
      </Box>
    </>
  );
}



export default function Home() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={1}>
        <Title></Title>
        <Content></Content>
      </Grid>
    </Container>
  );
}
