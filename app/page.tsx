"use client";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CYCLE_TEXT } from "./lib/util";

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
          // border:"1px solid red",
          width: "100%",
        }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              // border: "1px solid red",
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
            // border: "1px solid red",
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

// 标题
function Content() {
  return (
    <>
      <Box
        sx={{
          display: "flex",
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
                <Box
                  sx={{
                    height: "100%",
                  }}
                >
                  <Link href="/next">
                    <Card variant="outlined">
                      <CardMedia
                        component="img"
                        alt="骑行预报"
                        height="140"
                        image="https://picsum.photos/id/112/800/450"
                      />
                      <CardContent >
                        <Typography gutterBottom variant="h6" component="div">
                          骑行预报
                        </Typography>
                        <Typography gutterBottom variant="body1" component="div">
                          2025年12月7日8:30
                        </Typography>
                          <Typography variant="body2">环巢湖 百戏城 </Typography>
                      </CardContent>

                    </Card>
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
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
