import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import PageContainer from "components/PageContainer";
import useAssignedErrors from "hooks/useAssignedErrors";
import React from "react";
import { Link } from "react-router-dom";
import useFilterChange from "hooks/useFilterChange";
import {
  environmentColorMap,
  environmentOptions,
  normalizeEnvironmentLabel,
} from "types/environment";
import { cssColor } from "utils/colors";
import { getBrowserIcon } from "utils/icon";
import { getTimeAgo } from "utils/time";

export default function AssignedErrors() {
  const { value: environment, handleChange: handleEnvironmentChange } =
    useFilterChange("environment", "");
  const { data, isLoading, error } = useAssignedErrors(String(environment));

  return (
    <PageContainer>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6">All assigned errors</Typography>
        <TextField
          select
          size="small"
          label="Environment"
          value={environment}
          onChange={(e) => handleEnvironmentChange(e.target.value)}
          sx={{ minWidth: 170 }}
        >
          {environmentOptions.map((item) => (
            <MenuItem key={item.value || "all"} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <ListContainer
        count={data?.length}
        loading={isLoading}
        error={error?.message}
      >
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#22252B",
            mt: 3,
          }}
        >
          <Table sx={{ minWidth: 650, "& td, & th": { border: 0 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Details</TableCell>
                <TableCell>OS</TableCell>
                <TableCell>Environment</TableCell>
                <TableCell>Browser</TableCell>
                <TableCell>First seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((error) => (
                <TableRow
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: cssColor("background"),
                    },
                  }}
                  key={error?.id}
                >
                  <TableCell component="th" scope="row">
                    <Link
                      to={`/projects/${error.project_id}/errors/${error?.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography>{error?.message}</Typography>
                    </Link>
                  </TableCell>
                  <TableCell>{error?.os}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={normalizeEnvironmentLabel(error?.environment)}
                      color={environmentColorMap[error?.environment] || "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getBrowserIcon(error?.browser)} {error?.browser}
                    </Box>
                  </TableCell>
                  <TableCell>{getTimeAgo(error?.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ListContainer>
    </PageContainer>
  );
}
