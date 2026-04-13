import { Box, Button, TableCell, TableRow } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { key } from "hooks/useAllInvitations";
import { key as hasInvitationKey } from "hooks/useHasInvitation";
import useConfirmDialog from "hooks/useConfirmDialog";
import CheckIcon from "icons/CheckIcon";
import CloseIcon from "icons/CloseIcon";
import React from "react";
import { invitation } from "types/invitation";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

export default function InvitationsListRow({
  invitation,
}: {
  invitation: invitation;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: cancelMutate } = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.post(`/cancel-invitation/${id}`);
    },
  });

  const { mutateAsync: approveMutate } = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.post(`/approve-member/${id}`);
    },
  });

  const { component: cancelDialog, handleDelete: handleCancel } =
    useConfirmDialog(cancelMutate, {
      onAfterDelete: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        queryClient.invalidateQueries({ queryKey: [hasInvitationKey] });
      },
      description: "Are you sure you want to cancel the invitation?",
      title: "Cancel Invitation?",
    });

  const { component: approveDialog, handleDelete: handleApprove } =
    useConfirmDialog(approveMutate, {
      onAfterDelete: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        queryClient.invalidateQueries({ queryKey: [hasInvitationKey] });
      },
      description: "Are you sure you want to accept the invitation?",
      title: "Accept Invitation?",
      successMessage:
        "Invitation accept, you can now find it in the project list",
      startIcon: <CheckIcon />,
    });

  return (
    <>
      {cancelDialog}
      {approveDialog}
      <TableRow
        sx={{
          "&:nth-of-type(odd)": {
            backgroundColor: cssColor("background"),
          },
        }}
      >
        <TableCell>{invitation.project_name}</TableCell>
        <TableCell>{invitation.project_description}</TableCell>
        <TableCell>{invitation.invited_by_username}</TableCell>
        <TableCell
          sx={{
            width: "1%",
            whiteSpace: "nowrap",
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Button
              sx={{
                color: cssColor("error"),
                border: `1px solid ${cssColor("error")}`,
              }}
              startIcon={<CloseIcon />}
              variant="outlined"
              onClick={() => handleCancel(invitation.id)}
            >
              Cancel
            </Button>
            <Button
              sx={{
                color: cssColor("primary"),
                border: `1px solid ${cssColor("primary")}`,
              }}
              startIcon={<CheckIcon />}
              variant="outlined"
              onClick={() => handleApprove(invitation.id)}
            >
              Approve
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}
