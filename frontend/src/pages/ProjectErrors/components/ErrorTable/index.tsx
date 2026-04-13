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
import { cssColor } from "utils/colors";
import { Link, useLocation, useParams } from "react-router-dom";
import ListContainer from "components/ListContainer";
import { errorStatus } from "types/logs";
import { getTimeAgo } from "utils/time";
import { getBrowserIcon } from "utils/icon";
import useErrors from "hooks/useErrors";
import useFilterChange from "hooks/useFilterChange";

export default function ErrorTable() {
  const { value: status } = useFilterChange("status", 0);
  const { value: query } = useFilterChange("query", "");
  const location = useLocation();
  const { projectId } = useParams();

  const {
    data: errorLogs,
    isLoading,
    error,
  } = useErrors({
    projectId,
    query,
    status,
  });

  return (
    <ListContainer
      loading={isLoading}
      error={error?.message}
      count={errorLogs?.length}
    >
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#22252B",
          mt: 3,
        }}
      >
        <Table sx={{ minWidth: 800, "& td, & th": { border: 0 } }}>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Browser</TableCell>
              <TableCell>First seen</TableCell>
              <TableCell>Assigned</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorLogs?.map((error) => (
              <TableRow
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: cssColor("background"),
                  },
                }}
                key={error?.id}
              >
                <TableCell>{error?.id}</TableCell>
                <TableCell component="th" scope="row">
                  <Link
                    to={`${location.pathname}/${error?.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography>{error?.message}</Typography>
                  </Link>
                </TableCell>
                <TableCell>{errorStatus[error?.status]}</TableCell>
                <TableCell>{error?.os}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getBrowserIcon(error?.browser)} {error?.browser}
                  </Box>
                </TableCell>
                <TableCell>{getTimeAgo(error?.created_at)}</TableCell>
                <TableCell>{error?.assignee_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ListContainer>
  );
}
