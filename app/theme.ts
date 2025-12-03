"use client";
import { extendTheme } from "@mui/material/styles";
import { Geist, Geist_Mono, Oswald } from "next/font/google";

import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const notoSans = Noto_Sans_TC({
  weight: ["400", "700"], // 正文字重 & 标题等
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-cjk",
});

const notoSerif = Noto_Serif_TC({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-cjk",
});

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#2563eb",
          light: "#60a5fa",
          dark: "#1e40af",
        },
        secondary: {
          main: "#64748b",
        },
        background: {
          default: "#1c1f33",
          paper: "#64748b",
        },
        text: {
          primary: "#1c1f33",
          secondary: "#475569",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#60a5fa",
        },
        background: {
          default: "#1c1f33",
          paper: "#1e2937",
        },
        text: {
          primary: "#f3ebd3",
          secondary: "#cbd5e1",
        },
      },
    },
  },

  typography: {
    fontFamily: `${geistSans.style.fontFamily},${geistMono.style.fontFamily}`,

    h1: {
      fontFamily: `${oswald.style.fontFamily}`,
    },

    h2:{
      fontFamily: `${oswald.style.fontFamily}`,
    },

    h3:{
      fontFamily: `${oswald.style.fontFamily}`,
    },

    body1: {
      fontFamily: `${oswald.style.fontFamily},${notoSerif.style.fontFamily},${geistSans.style.fontFamily},${geistMono.style.fontFamily}`,
    },

    body2: {
      fontFamily: `${oswald.style.fontFamily},${notoSerif.style.fontFamily},${geistSans.style.fontFamily},${geistMono.style.fontFamily}`,
    },
  },

  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: "info" },
              style: {
                backgroundColor: "#60a5fa",
              },
            },
          ],
        },
      },
    },
  },
});

export default theme;
