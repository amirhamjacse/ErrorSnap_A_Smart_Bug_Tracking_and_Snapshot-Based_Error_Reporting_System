import { Box, Typography } from "@mui/material";
import TabsContainer from "components/TabsContainer";
import { useState } from "react";
import { cssColor } from "utils/colors";
import ProjectSettingsTeamList from "./components/ProjectSettingsTeamList";
import UsersIcon from "icons/UsersIcon";
import WatchIcon from "icons/WatchIcon";
import ProjectSettingsTeamPendingList from "./components/ProjectSettingsTeamPendingList";
import useProjectByUser from "hooks/useProjectByUser";
import Loader from "components/Loader";

export default function ProjectSettingsTeam() {
  const [currentTab, setCurrentTab] = useState(1);

  const handleChange = (_event, value: number) => {
    setCurrentTab(value);
  };

  const { data, isLoading } = useProjectByUser();
  const isProjectOwner = !!data?.length;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Typography mb={1} variant="h5">
        Members
      </Typography>
      <Typography color={cssColor("textSecondary")}>
        Members Manage team members and invitations
      </Typography>
      <Box sx={{ my: 2, borderBottom: 1, borderColor: cssColor("divider") }}>
        <TabsContainer value={currentTab} onChange={handleChange}>
          <TabsContainer.item Icon={UsersIcon} label="Team Members" value={1} />
          {isProjectOwner ? (
            <TabsContainer.item
              Icon={WatchIcon}
              label="Pending Invitations"
              value={2}
            />
          ) : null}
        </TabsContainer>
      </Box>

      {currentTab === 1 ? (
        <ProjectSettingsTeamList isProjectOwner={isProjectOwner} />
      ) : (
        <ProjectSettingsTeamPendingList />
      )}
    </>
  );
}
