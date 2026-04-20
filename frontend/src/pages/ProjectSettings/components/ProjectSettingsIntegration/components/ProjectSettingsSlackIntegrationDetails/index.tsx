import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useProjectId from "hooks/useProjectId";
import { key as slackDetailsKey } from "hooks/useSlackDetails";
import SlackIcon from "icons/SlackIcon";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { slackDetails } from "types/slack";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

export default function ProjectSettingsSlackIntegrationDetails({
  data,
}: {
  data: slackDetails;
}) {
  const projectId = useProjectId();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [channelId, setchannelId] = useState(data?.channel_id || "");
  const { mutate: addChannelMutate, isPending: isAddChannelPending } =
    useMutation({
      mutationFn: async (data: { channelId: string; projectId: string }) => {
        const result = await apiClient.post(`/slack/add-channel`, data);
        return result?.data;
      },
    });
  const { mutate: removeIntegrationMutate, isPending: isRemovePending } =
    useMutation({
      mutationFn: async (payload: { projectId: string }) => {
        const result = await apiClient.post(`/slack/disconnect`, payload);
        return result?.data;
      },
    });
  const isPending = isAddChannelPending || isRemovePending;

  const handleAddChannelId = () => {
    if (!channelId) return;

    addChannelMutate(
      { channelId, projectId },
      {
        onSuccess: () => {
          toast.success("Channel added successfully");
        },
        onError: () => {
          toast.error("Failed to add channel");
        },
      },
    );
  };

  const removeIntegration = () => {
    if (!projectId) return;

    removeIntegrationMutate(
      { projectId },
      {
        onSuccess: ({ message }) => {
          toast.success(message || "Slack integration removed");
          queryClient.invalidateQueries({
            queryKey: [slackDetailsKey, projectId],
          });
        },
        onError: () => {
          toast.error("Something went wrong!");
        },
      },
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
        <Box mt={2}>
          <Button
            variant="outlined"
            color="error"
            disabled={isPending}
            onClick={removeIntegration}
          >
            Remove Slack Integration
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
