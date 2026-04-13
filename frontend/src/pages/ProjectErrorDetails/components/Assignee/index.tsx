import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import useProjectTeamList from "hooks/useProjectTeamList";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { zeroArgsFunction } from "types/function";
import { teamMember } from "types/team";
import { apiClient } from "utils/axios";

type postAssignMember = {
  userId: number;
  errorId: string;
};

type AssigneeProps = {
  assigneeId: number;
  loading: boolean;
  resolved: boolean;
  update: zeroArgsFunction;
};

export default function Assignee({
  assigneeId,
  loading,
  resolved,
  update,
}: AssigneeProps) {
  const { errorId } = useParams();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (projectData: postAssignMember) => {
      return await apiClient.post("/assign-error", projectData);
    },
  });
  const { isLoading: isTeamLoading, data } = useProjectTeamList(true, {
    refetchOnWindowFocus: false,
  });

  const assigneeUser = data?.find((team) => team.user_id === assigneeId);

  const handleChangeAssignee = (_event, selectedItem: teamMember) => {
    const data = {
      userId: selectedItem?.user_id || null,
      errorId: errorId,
    };

    mutate(data, {
      onSuccess: async () => {
        await update();
        toast.success("Assigned user successfully");
      },
      onError: () => {
        toast.error("Error assigning member!");
      },
    });
  };

  return (
    <Autocomplete
      open={open}
      disabled={resolved || isPending || loading}
      value={assigneeUser || null}
      onChange={handleChangeAssignee}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) =>
        option?.user_id === value?.user_id
      }
      getOptionLabel={(option) => option?.username}
      options={data || []}
      loading={isTeamLoading || isPending || loading}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label="Assign to"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isTeamLoading || isPending || loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
    />
  );
}
