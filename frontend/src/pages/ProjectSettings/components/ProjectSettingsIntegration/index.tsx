import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import useDiscordDetails from "hooks/useDiscordDetails";
import useSlackDetails from "hooks/useSlackDetails";
import React from "react";
import { useParams } from "react-router-dom";
import ProjectSettingsDiscordIntegrationAdd from "./components/ProjectSettingsDiscordIntegrationAdd";
import ProjectSettingsDiscordIntegrationDetails from "./components/ProjectSettingsDiscordIntegrationDetails";
import ProjectSettingsSlackIntegrationAdd from "./components/ProjectSettingsSlackIntegrationAdd";
import ProjectSettingsSlackIntegrationDetails from "./components/ProjectSettingsSlackIntegrationDetails";
import { cssColor } from "utils/colors";
import UsageGuide from "pages/Projects/components/UsageGuide";

export default function ProjectSettingsIntegration() {
  const { projectId } = useParams();
  const {
    data: slackData,
    isLoading: isSlackLoading,
    error: slackError,
  } = useSlackDetails(projectId, Boolean(projectId), {
    retry: false,
  });
  const {
    data: discordData,
    isLoading: isDiscordLoading,
    error: discordError,
  } = useDiscordDetails(projectId, Boolean(projectId), {
    retry: false,
  });
  const isLoading = isSlackLoading || isDiscordLoading;
  const error = slackError || discordError;

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

  return (
    <>
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <UsageGuide />
        </Grid2>
        <Grid2 size={12}>
          {slackData ? (
            <ProjectSettingsSlackIntegrationDetails data={slackData} />
          ) : (
            <ProjectSettingsSlackIntegrationAdd />
          )}
        </Grid2>
        <Grid2 size={12}>
          {discordData ? (
            <ProjectSettingsDiscordIntegrationDetails data={discordData} />
          ) : (
            <ProjectSettingsDiscordIntegrationAdd />
          )}
        </Grid2>
      </Grid2>
    </>
  );
}
