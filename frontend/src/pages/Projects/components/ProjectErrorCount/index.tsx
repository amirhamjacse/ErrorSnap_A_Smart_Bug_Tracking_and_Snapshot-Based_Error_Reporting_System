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
    status: errorStatus.Unresolved,
  });

  if (error) {
    return <Typography color="error">N/A</Typography>;
  }

  return isLoading ? (
    <CircularProgress size={15} />
  ) : (
    <Chip
      icon={<AlertIcon fontSize={16} />}
      label={`${errorLogs?.length} errors`}
      size="small"
      color={errorLogs?.length > 0 ? "error" : "primary"}
    />
  );
}
