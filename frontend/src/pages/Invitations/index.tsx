import {
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
import useAllInvitations from "hooks/useAllInvitations";
import React from "react";
import InvitationsListRow from "./components/InvitationsListRow";

export default function Invitations() {
  const { data, isFetching, error } = useAllInvitations();

  return (
    <PageContainer>
      <Typography variant="h6">All project invitations</Typography>

      <ListContainer
        loading={isFetching}
        error={error?.message}
        count={data?.length}
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
                <TableCell>Project name</TableCell>
                <TableCell>Project description</TableCell>
                <TableCell>Invited by</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((invitation) => (
                <InvitationsListRow
                  key={invitation.id}
                  invitation={invitation}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ListContainer>
    </PageContainer>
  );
}
