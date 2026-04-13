import { Box, CircularProgress, Typography } from "@mui/material";
import useSlackDetails from "hooks/useSlackDetails";
import React from "react";
import { useParams } from "react-router-dom";
import ProjectSettingsSlackIntegrationAdd from "./components/ProjectSettingsSlackIntegrationAdd";
import ProjectSettingsSlackIntegrationDetails from "./components/ProjectSettingsSlackIntegrationDetails";
import { cssColor } from "utils/colors";

export default function ProjectSettingsIntegration() {
  const { projectId } = useParams();
  const { data, isLoading, error } = useSlackDetails(projectId, true, {
    retry: false,
  });

  if (isLoading) {
    return (
      <Box textAlign="center">
        <CircularProgress size={25} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box width="100%" textAlign="center" p={4}>
        <Typography color={cssColor("error")}>{error}</Typography>
      </Box>
    );
  }

  return data ? (
    <ProjectSettingsSlackIntegrationDetails data={data} />
  ) : (
    <ProjectSettingsSlackIntegrationAdd />
  );
}
