"use client";
import { extendTheme } from "@mui/material/styles";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
          default: "#f8fafc",
          paper: "#ffffff",
        },
        text: {
          primary: "#0f172a",
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
          default: "#0f172a",
          paper: "#1e2937",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#cbd5e1",
        },
      },
    },
  },


  typography: {
    fontFamily: `${geistSans.style.fontFamily},${geistMono.style.fontFamily}`,
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
