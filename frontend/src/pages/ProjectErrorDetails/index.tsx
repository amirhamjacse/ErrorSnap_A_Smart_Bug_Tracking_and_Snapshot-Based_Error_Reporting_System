import { Box, Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import ErrorBox from "./components/ErrorBox";
import ErrorMeta from "./components/ErrorMeta";
import ErrorAiExplanation from "./components/ErrorAiExplanation";
import PageContainer from "components/PageContainer";
import useError from "hooks/useError";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "components/Loader";
import { cssColor } from "utils/colors";
import BugIcon from "icons/BugIcon";
import BackIcon from "icons/BackIcon";

export default function ProjectErrorDetails() {
  const navigate = useNavigate();
  const { errorId, projectId } = useParams();

  const { data, isLoading, isFetching, refetch, error } = useError(
    errorId,
    true,
  );

  const handleUpdate = async () => {
    await refetch();
  };

  const handleGoBackPage = () => {
    navigate(`/projects/${projectId}/errors`);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Box width="100%" textAlign="center" p={4}>
        <Typography color={cssColor("error")}>{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      <PageContainer>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Button
              color="white"
              onClick={handleGoBackPage}
              startIcon={<BackIcon />}
            >
              Go back
            </Button>
          </Grid>
          <Grid size={12}>
            <Box
              sx={{
                p: [2, 3],
                border: `1px solid ${cssColor("divider")}`,
                borderRadius: 1,
                color: cssColor("white"),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <BugIcon /> <Typography variant="h5">{data?.message}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, lg: 9 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <ErrorBox error={data} />
              </Grid>
              <Grid size={12}>
                <ErrorAiExplanation error={data} />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Stack spacing={2}>
              <ErrorMeta
                error={data}
                loading={isFetching}
                update={handleUpdate}
              />
            </Stack>
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
}
