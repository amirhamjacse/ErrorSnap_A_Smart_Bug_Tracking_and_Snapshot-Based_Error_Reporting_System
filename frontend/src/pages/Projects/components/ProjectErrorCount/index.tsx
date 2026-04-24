import { Chip, CircularProgress, Typography } from "@mui/material";
import useErrors from "hooks/useErrors";
import AlertIcon from "icons/AlertIcon";
import React from "react";
import { errorStatus } from "types/logs";

export default function ProjectErrorCount({
  projectId,
}: {
  projectId: string;
}) {
  const {
    data: errorLogs,
    isLoading,
    error,
  } = useErrors({
    projectId,
    status: "active",
  });

  if (error) {
    return <Typography color="error">N/A</Typography>;
  }

  return isLoading ? (
    <CircularProgress size={15} />
  ) : (
    <Chip
      icon={<AlertIcon fontSize={16} />}
      label={`${errorLogs?.pagination?.total || 0} errors`}
      size="small"
      color={(errorLogs?.pagination?.total || 0) > 0 ? "error" : "primary"}
    />
  );
}
