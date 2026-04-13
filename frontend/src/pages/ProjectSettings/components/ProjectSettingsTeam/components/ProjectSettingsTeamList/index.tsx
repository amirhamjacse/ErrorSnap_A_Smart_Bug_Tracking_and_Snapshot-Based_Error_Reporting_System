import React, { useState } from "react";
import { Box, Button, Divider, List, Paper } from "@mui/material";
import AddIcon from "icons/AddIcon";
import ProjectSettingsTeamAdd from "../ProjectSettingsTeamAdd";
import useProjectTeamList from "hooks/useProjectTeamList";
import ListContainer from "components/ListContainer";
import ProjectSettingsTeamListRow from "../ProjectSettingsTeamListRow";
import { cssColor } from "utils/colors";

export default function ProjectSettingsTeamList({
  isProjectOwner,
}: {
  isProjectOwner: boolean;
}) {
  const [teamAddPopup, setTeamAddPopup] = useState(false);
  const { isLoading, data, error } = useProjectTeamList(true, {
    retry: false,
  });

  return (
    <>
      <ListContainer count={data?.length} loading={isLoading} error={error}>
        {isProjectOwner ? (
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize={18} />}
              onClick={() => setTeamAddPopup(true)}
              sx={{
                backgroundColor: cssColor("primary"),
                color: cssColor("white"),
                "&:hover": {
                  backgroundColor: "#1565C0",
                },
              }}
            >
              Invite Member
            </Button>
          </Box>
        ) : null}

        <Paper sx={{ mb: 4 }}>
          <List>
            {data?.map((member, index) => (
              <React.Fragment key={member.id}>
                {index > 0 && <Divider />}
                <ProjectSettingsTeamListRow
                  member={member}
                  projectOwner={isProjectOwner}
                />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </ListContainer>

      {teamAddPopup ? (
        <ProjectSettingsTeamAdd onClose={() => setTeamAddPopup(false)} />
      ) : null}
    </>
  );
}
