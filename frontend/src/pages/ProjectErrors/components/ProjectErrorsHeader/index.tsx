import { Button, Grid2 as Grid, Typography } from "@mui/material";
import DownloadIcon from "icons/DownloadIcon";
import SettingsIcon from "icons/SettingsIcon";
import React from "react";
import { Link, useParams } from "react-router-dom";

export default function ProjectErrorsHeader({
  projectName,
}: {
  projectName: string;
}) {
  const { projectId } = useParams();

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h5" gutterBottom>
          {projectName}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} textAlign="right">
        <Button
          disabled={true}
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ mr: 2 }}
        >
          Export Logs
        </Button>
        <Link to={`/projects/${projectId}/settings/team`}>
          <Button variant="contained" startIcon={<SettingsIcon />}>
            Settings
          </Button>
        </Link>
      </Grid>
    </Grid>
  );
}
