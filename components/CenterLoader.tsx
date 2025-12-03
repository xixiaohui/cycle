import { Box, CircularProgress } from "@mui/material";

export function CenterLoader() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}
