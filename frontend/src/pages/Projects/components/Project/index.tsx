import { Box, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { project } from "types/project";
import { cssColor } from "utils/colors";
import { format } from "date-fns";
import ProjectErrorCount from "../ProjectErrorCount";

export default function Project({ project }: { project: project }) {
  const navigate = useNavigate();

  const handleProjectClick = () => {
    navigate(`/projects/${project.id}/errors`);
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          cursor: "pointer",
          p: 0.25,
          borderRadius: 4,
          transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
          border: `1px solid ${cssColor("divider")}`,
          background:
            "linear-gradient(180deg, rgba(14, 20, 34, 0.96) 0%, rgba(9, 15, 28, 0.96) 100%)",
          "&:hover": {
            transform: "translateY(-4px)",
            border: `1px solid rgba(108, 140, 255, 0.3)`,
            boxShadow: "0 24px 60px rgba(2, 6, 23, 0.35)",
          },
        }}
        onClick={handleProjectClick}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="h6" component="h2">
              {project.name}
            </Typography>

            <ProjectErrorCount projectId={project?.id} />
          </Box>

          <Typography color="text.secondary">{project.description}</Typography>
          {project?.last_error_at ? (
            <Typography variant="body2" color="text.secondary">
              Last error: {format(project?.last_error_at, "do MMM")}
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
