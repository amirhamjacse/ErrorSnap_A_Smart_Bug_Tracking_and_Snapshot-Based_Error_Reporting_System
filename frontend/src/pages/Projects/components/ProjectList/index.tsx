import { Grid2 as Grid } from "@mui/material";
import Project from "../Project";
import ListContainer from "components/ListContainer";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { queryStringParse } from "utils/querystring";
import useProjects from "hooks/useProjects";

export default function ProjectList() {
  const location = useLocation();
  const queryString = useMemo(
    () => queryStringParse(location.search),
    [location.search]
  );

  const {
    data: projects,
    isLoading,
    error,
  } = useProjects({ filterBy: queryString?.filterBy });

  return (
    <ListContainer
      count={projects?.length}
      loading={isLoading}
      error={error?.message}
      emptyText="No project found!"
    >
      <Grid container spacing={2}>
        {projects?.map((project) => (
          <Grid key={project.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Project project={project} />
          </Grid>
        ))}
      </Grid>
    </ListContainer>
  );
}
