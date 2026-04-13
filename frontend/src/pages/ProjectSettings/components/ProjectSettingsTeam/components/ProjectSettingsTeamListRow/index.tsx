import React from "react";
import { Box, Chip, IconButton, ListItem, ListItemText } from "@mui/material";
import { teamMember } from "types/team";
import DeleteIcon from "icons/DeleteIcon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useConfirmDialog from "hooks/useConfirmDialog";
import { apiClient } from "utils/axios";
import { key } from "hooks/useProjectTeamList";
import useAuthUser from "hooks/useAuthUser";

export default function ProjectSettingsTeamListRow({
  member,
  projectOwner,
}: {
  member: teamMember;
  projectOwner: boolean;
}) {
  const { user } = useAuthUser();
  const isSelfAccount = member.email === user.email;

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (memberId: number) => {
      return await apiClient.post(`/remove-member/${memberId}`);
    },
  });

  const { component, handleDelete } = useConfirmDialog(mutateAsync, {
    onAfterDelete: () => queryClient.invalidateQueries({ queryKey: [key] }),
    description: "Are you sure you want to remove this user from the team?",
    title: "Remove Member",
    successMessage: "Successfully removed from team",
  });

  const accessDelete = !isSelfAccount && projectOwner;

  return (
    <>
      {component}
      <ListItem
        secondaryAction={
          accessDelete ? (
            <IconButton
              edge="end"
              aria-label="delete"
              sx={{ color: "error.main" }}
              onClick={() => handleDelete(member?.id)}
            >
              <DeleteIcon fontSize={18} />
            </IconButton>
          ) : null
        }
      >
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {member.username}
              {isSelfAccount ? (
                <Chip label={"you"} size="small" color="primary" />
              ) : null}
            </Box>
          }
          secondary={member.email}
        />
      </ListItem>
    </>
  );
}
