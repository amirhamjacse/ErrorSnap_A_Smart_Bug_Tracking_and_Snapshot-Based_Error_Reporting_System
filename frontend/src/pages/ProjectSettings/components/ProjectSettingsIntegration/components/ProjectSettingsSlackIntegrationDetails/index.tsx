import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import SlackIcon from "icons/SlackIcon";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { slackDetails } from "types/slack";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

export default function ProjectSettingsSlackIntegrationDetails({
  data,
}: {
  data: slackDetails;
}) {
  const { projectId } = useParams();
  const inputRef = useRef();
  const [channelId, setchannelId] = useState(data?.channel_id || "");
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { channelId: string; projectId: string }) => {
      const result = await apiClient.post(`/slack/add-channel`, data);
      return result?.data;
    },
  });

  const handleAddChannelId = () => {
    if (!channelId) return;

    mutate(
      { channelId, projectId },
      {
        onSuccess: () => {
          toast.success("Channel added successfully");
        },
        onError: (error: AxiosError<{ message: string }>) => {
          const errorMessage = error?.response?.data?.message;
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2,
        backgroundColor: cssColor("backgroundShade"),
      }}
    >
      <Box>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <SlackIcon />
          <Typography variant="h5">Slack</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1">Channel Id:</Typography>
          <Typography variant="caption" color="textSecondary">
            {data?.channel_id || "NULL"}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="body1">Workspace name:</Typography>
          <Typography variant="caption" color="textSecondary">
            {data?.team_name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box display="flex" flexDirection="column">
            <TextField
              value={channelId}
              onChange={(e) => setchannelId(e.target.value)}
              ref={inputRef}
              label="Channel Id"
              sx={{ maxWidth: "250px", width: "100%" }}
              disabled={isPending || !!data?.channel_id}
            />
            <FormHelperText>
              The errorSnap bot will be added to the given channel
            </FormHelperText>
          </Box>
          <Button
            disabled={isPending || !!data?.channel_id}
            startIcon={isPending ? <CircularProgress size={15} /> : null}
            variant="contained"
            onClick={handleAddChannelId}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
