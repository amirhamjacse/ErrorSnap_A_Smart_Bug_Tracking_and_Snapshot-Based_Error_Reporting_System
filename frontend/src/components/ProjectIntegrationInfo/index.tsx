import { Box, Paper, Typography } from "@mui/material";
import Copy from "components/Copy";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { cssColor } from "utils/colors";

export default function ProjectIntegrationInfo() {
  const { projectId } = useParams();
  const scriptRef = useRef<HTMLPreElement | null>(null);

  if (!projectId) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: "16px",
        border: `1px solid ${cssColor("divider")}`,
        background:
          "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
      }}
    >
      <Typography variant="subtitle1" mb={1}>
        Project ID
      </Typography>
      <Copy sx={{ justifyContent: "flex-start" }}>
        <Typography color="text.secondary">{projectId}</Typography>
      </Copy>

      <Copy targetRef={scriptRef} sx={{ mt: 2, alignItems: "center" }}>
        <Typography color="text.secondary">
          Add this script to your package.json:
        </Typography>
      </Copy>

      <Box
        ref={scriptRef}
        component="pre"
        sx={{
          mt: 1,
          m: 0,
          p: 2,
          borderRadius: "10px",
          overflowX: "auto",
          color: cssColor("white"),
          border: `1px solid ${cssColor("divider")}`,
          backgroundColor: "rgba(15, 23, 42, 0.68)",
          fontFamily: '"Fira Code", "JetBrains Mono", monospace',
          fontSize: "0.85rem",
          lineHeight: 1.55,
        }}
      >
{`"scripts": {
  "postbuild": "errorsnap-upload -p ${projectId} -d <dist_folder>"
}`}
      </Box>
    </Paper>
  );
}
