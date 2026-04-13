import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import SlackIcon from "icons/SlackIcon";
import React from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

export default function ProjectSettingsSlackIntegrationAdd() {
  const { projectId } = useParams();

  const { mutate } = useMutation({
    mutationFn: async (projectId: string) => {
      const result = await apiClient.get(
        `/slack/oauth/start?projectId=${projectId}`
      );
      return result?.data;
    },
  });

  const connectToSlack = () => {
    mutate(projectId, {
      onSuccess: ({ data }) => {
        window.open(data, "_self", "noopener,noreferrer");
      },
      onError: () => {
        toast.error("Something went wrong!");
      },
    });
  };

  return (
    <Grid
      container
      sx={{
        borderRadius: 2,
        p: 2,
        alignItems: "center",
        backgroundColor: cssColor("backgroundShade"),
      }}
      spacing={1}
    >
      <Grid size={{ xs: 12, sm: 8, md: 9 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <SlackIcon />
          <Typography variant="h5">Slack</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          connect your slack workspace to get your project error messages <br />{" "}
          directly in your slack workspace
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }} textAlign="right">
        <Button
          sx={{ width: "100%" }}
          onClick={connectToSlack}
          variant="contained"
          color="white"
        >
          <Typography variant="body1" fontWeight={600} noWrap color={"black"}>
            Connect to slack
          </Typography>
        </Button>
      </Grid>
    </Grid>
  );
}
