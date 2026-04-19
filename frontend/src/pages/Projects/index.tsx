import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import AddIcon from "icons/AddIcon";
import { useState } from "react";
import AddProject from "./components/AddProject";
import ProjectList from "./components/ProjectList";
import PageContainer from "components/PageContainer";
import FilterProject from "./components/FilterProject";

export default function Projects() {
  const [openAddProjectPopup, setOpenAddProjectPopup] = useState(false);

  const handleToggleProjectPopup = () => {
    setOpenAddProjectPopup((prev) => !prev);
  };

  return (
    <>
      <PageContainer>
        <Grid container rowSpacing={3}>
          <Grid size={12}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography display="block" color="white">
                All Projects
              </Typography>

              <Button
                onClick={handleToggleProjectPopup}
                variant="contained"
                startIcon={<AddIcon />}
              >
                Add project
              </Button>
            </Box>
          </Grid>
          <Grid size={12}>
            <FilterProject />
          </Grid>
          <Grid size={12}>
            <ProjectList />
          </Grid>
        </Grid>
      </PageContainer>
      {openAddProjectPopup ? (
        <AddProject onClose={() => setOpenAddProjectPopup(false)} />
      ) : null}
    </>
  );
}
