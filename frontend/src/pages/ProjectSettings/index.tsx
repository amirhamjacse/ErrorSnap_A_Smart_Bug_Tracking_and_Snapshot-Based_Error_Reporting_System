import { Box, Typography } from "@mui/material";
import PageContainer from "components/PageContainer";
import SettingsIcon from "icons/SettingsIcon";
import UsersIcon from "icons/UsersIcon";
import SettingsWithSidebarContainer, {
  menuItem,
} from "./components/SettingsWithSidebarContainer";
import ProjectSettingsTeam from "./components/ProjectSettingsTeam";
import ProjectSettingsGeneral from "./components/ProjectSettingsGeneral";
import ProjectSettingsIntegration from "./components/ProjectSettingsIntegration";
import PlugIcon from "icons/PlugIcon";

const menuItems: menuItem[] = [
  {
    icon: <SettingsIcon fontSize={20} color="white" />,
    label: "General",
    component: <ProjectSettingsGeneral />,
    path: (projectId) => `/projects/${projectId}/settings/general`,
  },
  {
    icon: <UsersIcon fontSize={20} color="white" />,
    label: "Team",
    component: <ProjectSettingsTeam />,
    path: (projectId) => `/projects/${projectId}/settings/team`,
  },
  {
    icon: <PlugIcon fontSize={20} color="white" />,
    label: "Integration",
    component: <ProjectSettingsIntegration />,
    path: (projectId) => `/projects/${projectId}/settings/integration`,
  },
];

export default function ProjectSettings() {
  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Settings
        </Typography>
        <Typography color="text.secondary">
          Manage your project team and preferences
        </Typography>
      </Box>

      <SettingsWithSidebarContainer items={menuItems} />
    </PageContainer>
  );
}
