import { Box, CircularProgress, Paper, Tooltip, Typography } from "@mui/material";
import { useIsFetching } from "@tanstack/react-query";
import React from "react";
import { cssColor } from "utils/colors";

export default function GlobalFetchingLoader() {
  const isFetching = useIsFetching();

  if (isFetching === 0) {
    return null;
  }

  return (
    <Tooltip title="Syncing data..">
      <Paper
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRadius: 999,
          px: 2,
          py: 1,
          backgroundColor: "rgba(13, 20, 34, 0.9)",
        }}
      >
        <CircularProgress sx={{ color: cssColor("textSecondary") }} size={20} />
        <Typography variant="caption" color="text.secondary">
          Syncing
        </Typography>
      </Paper>
    </Tooltip>
  );
}
