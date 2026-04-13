import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import PageContainer from "components/PageContainer";
import useAssignedErrors from "hooks/useAssignedErrors";
import React from "react";
import { Link } from "react-router-dom";
import { cssColor } from "utils/colors";
import { getBrowserIcon } from "utils/icon";
import { getTimeAgo } from "utils/time";

export default function AssignedErrors() {
  const { data, isLoading, error } = useAssignedErrors();

  return (
    <PageContainer>
      <Typography variant="h6">All assigned errors</Typography>
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
