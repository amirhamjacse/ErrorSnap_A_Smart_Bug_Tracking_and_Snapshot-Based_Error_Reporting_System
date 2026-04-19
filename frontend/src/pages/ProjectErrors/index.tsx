import { Button, Grid2 as Grid } from "@mui/material";
import ErrorTable from "./components/ErrorTable";
import { useNavigate } from "react-router-dom";
import PageContainer from "components/PageContainer";
import ErrorFilters from "./components/ErrorFilters";
import ListContainer from "components/ListContainer";
import ProjectErrorsHeader from "./components/ProjectErrorsHeader";
import useProject from "hooks/useProject";
import BackIcon from "icons/BackIcon";
import useProjectId from "hooks/useProjectId";

export default function ProjectErrors() {
  const projectId = useProjectId();
  const navigate = useNavigate();
  const {
    data: project,
    isLoading,
    error,
  } = useProject(projectId, true, {
    retry: false,
  });

  const handleGoBackPage = () => {
    navigate(`/projects`);
  };

  return (
    <>
      <PageContainer>
        <ListContainer loading={isLoading} error={error}>
          <Grid container rowSpacing={2}>
            <Grid size={12}>
              <Button
                color="white"
                onClick={handleGoBackPage}
                startIcon={<BackIcon />}
                sx={{ p: 0 }}
              >
                Go back
              </Button>
            </Grid>
            <Grid size={12}>
              <ProjectErrorsHeader projectName={project?.name} />
            </Grid>

            <Grid size={12}>
              <ErrorFilters />
            </Grid>
            <Grid size={12}>
              <ErrorTable />
            </Grid>
          </Grid>
        </ListContainer>
      </PageContainer>
    </>
  );
}
