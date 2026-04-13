import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import useAuthUser from "hooks/useAuthUser";
import React, { ReactNode } from "react";
import { cssColor } from "utils/colors";

export default function AppLoader({ children }: { children: ReactNode }) {
  const { isInitialized } = useAuthUser();

  return isInitialized ? (
    children
  ) : (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at center, rgba(108, 140, 255, 0.14), transparent 42%), rgba(2, 6, 23, 0.82)",
        backdropFilter: "blur(10px)",
        px: 2,
      }}
    >
      <Paper
        sx={{
          px: 4,
          py: 3,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          background:
            "linear-gradient(180deg, rgba(13, 20, 34, 0.98), rgba(9, 15, 28, 0.98))",
        }}
      >
        <CircularProgress size={24} sx={{ color: cssColor("primary") }} />
        <Box>
          <Typography variant="subtitle1">Loading ErrorSnap</Typography>
          <Typography variant="caption" color="text.secondary">
            Preparing your workspace
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
