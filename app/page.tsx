"use client";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CYCLE_TEXT } from "../lib/util";
import CycleCard from "@/components/CycleCard";
import Footer from "@/components/Footer";


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
              ChaohuCycling Club
            </Typography>
            {/* <p classNameName="text-4xl color[#1c1f33] tracking-tighter text-balance">
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
            <Grid size={{ xs: 12, md: 3 }} offset={{ md: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <CycleCard single={true}></CycleCard>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>



      <div className="block w-full sm:hidden ">
        <CycleCard single={true}></CycleCard>
      </div>
    </>
  );
}

function HeroSection(){

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: "url('https://picsum.photos/id/347/5000/3334')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-indigo-900/40 to-violet-900/40"></div>
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute top-20 left-10 w-4 h-4 bg-sky-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-violet-500 rounded-full animate-float opacity-40"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-blue-400 rounded-full animate-float opacity-70"></div>
        <div className="absolute bottom-20 right-32 w-5 h-5 bg-indigo-500 rounded-full animate-float opacity-50"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <i
                className="fas fa-music text-6xl md:text-8xl text-sky-400 mb-4 animate-pulse"
                aria-hidden="true"
              ></i>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 bg-clip-text text-transparent animate-pulse-slow">
                CHAOHU CYCLING CLUB
              </span>
            </h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <p className="text-2xl md:text-3xl text-gray-100 mb-4 font-semibold">
                <i className="fas fa-calendar-alt mr-3 text-sky-400">
                  环巢湖骑行俱乐部
                </i>
              </p>
            </div>
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
              {CYCLE_TEXT[0]}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-sky-500/30 flex items-center justify-center">
                <a href="/join">
                  <i className="fas fa-ticket-alt mr-3"></i>加入我们
                </a>
              </button>
              <a
                href="/next"
                className="border-2 border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <i className="fas fa-list mr-3"></i>下次骑行
              </a>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          aria-hidden="true"
        >
          <i className="fas fa-chevron-down text-2xl text-white/60"></i>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection></HeroSection>

      <Container maxWidth="lg">
        <Grid container spacing={1} sx={{ my: 7 }}>
          <Content></Content>
        </Grid>
        <Footer></Footer>
      </Container>
    </>
  );
}
