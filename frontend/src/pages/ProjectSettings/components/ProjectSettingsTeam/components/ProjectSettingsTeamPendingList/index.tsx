import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ListContainer from "components/ListContainer";
import useDeleteDialog from "hooks/useConfirmDialog";
import useTeamPendingList, { key } from "hooks/useTeamPendingList";
import CloseIcon from "icons/CloseIcon";
import React from "react";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

export default function ProjectSettingsTeamPendingList() {
  const queryClient = useQueryClient();
  const { isLoading, data, error } = useTeamPendingList(true, {
    retry: false,
  });
  const { mutateAsync } = useMutation({
    mutationFn: async (memberId: number) => {
      return await apiClient.post(`/cancel-invitation/${memberId}`);
    },
  });

  const { component, handleDelete } = useDeleteDialog(mutateAsync, {
    onAfterDelete: () => queryClient.invalidateQueries({ queryKey: [key] }),
    title: "Cancel invitation",
    description: "Are you sure you want to cancel the invitation",
    successMessage: "Invitation successfully revoked",
  });

  return (
    <>
      {component}
      <ListContainer
        loading={isLoading}
        count={data?.length}
        error={error}
        emptyText={"No pending invitation!"}
      >
        <Paper>
          <List>
            {data?.map((member, index) => (
              <React.Fragment key={member.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {member.username}
                      </Box>
                    }
                    secondary={member.email}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CloseIcon fontSize={16} />}
                      onClick={() => handleDelete(member.id)}
                      sx={{
                        color: cssColor("error"),
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </ListContainer>
    </>
  );
}
