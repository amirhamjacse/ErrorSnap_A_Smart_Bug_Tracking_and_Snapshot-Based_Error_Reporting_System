import { Box, Button, Typography } from "@mui/material";
import { format } from "date-fns";
import { errorLog, errorLogStatus } from "types/errorLog";
import { cssColor } from "utils/colors";
import { getBrowserIcon } from "utils/icon";
import Assignee from "../Assignee";
import { zeroArgsFunction } from "types/function";
import useConfirmDialog from "hooks/useConfirmDialog";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/axios";
import CheckIcon from "icons/CheckIcon";
import Copy from "components/Copy";

interface ErrorMetaProps {
  error: errorLog;
  loading: boolean;
  update: zeroArgsFunction;
}

export default function ErrorMeta({ error, loading, update }: ErrorMetaProps) {
  const { mutateAsync } = useMutation({
    mutationFn: async (values: { errorId: string }) => {
      return await apiClient.post("/resolve-error", values);
    },
  });

  const { component, handleDelete: handleResolve } = useConfirmDialog(
    mutateAsync,
    {
      onAfterDelete: async () => await update(),
      description: "Are you sure you want to Resolve this error?",
      title: "Error resolve",
      successMessage: "Well done, Error is resolved.",
      startIcon: <CheckIcon />,
    }
  );

  const handleResolveError = () => {
    handleResolve({ errorId: error?.id });
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: cssColor("backgroundShade"),
          p: [2, 3],
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">Id</Typography>
        <Typography variant="body1" mb={2}>
          <Copy>{error?.id}</Copy>
        </Typography>
        <Typography variant="body2">First seen</Typography>
        <Typography variant="body1" mb={2}>
          {format(new Date(error.created_at), "d.M.yyyy")}
        </Typography>
        <Typography variant="body2">Browser</Typography>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          {getBrowserIcon(error?.browser)}
          <Typography variant="body1">{error?.browser}</Typography>
        </Box>
        <Typography variant="body2">OS</Typography>
        <Typography variant="body1" mb={2}>
          {error?.os}
        </Typography>

        <Assignee
          loading={loading}
          resolved={error?.status === errorLogStatus.RESOLVED}
          update={update}
          assigneeId={error?.assignee_id}
        />

        {error?.assignee_id ? (
          <Button
            onClick={handleResolveError}
            sx={{ mt: 2 }}
            fullWidth
            variant="contained"
            color={"primary"}
            disabled={error?.status === errorLogStatus.RESOLVED}
          >
            Resolved
          </Button>
        ) : null}
      </Box>

      {component}
    </>
  );
}
