import { Box, Paper, Typography } from "@mui/material";
import Copy from "components/Copy";
import { useRef } from "react";
import { cssColor } from "utils/colors";

const SDK_POSTBUILD_SCRIPT = `"scripts": {
  "postbuild": "errorsnap-upload -p <project_id> -d <dist_folder>"
}`;

export default function UsageGuide() {
  const scriptRef = useRef<HTMLPreElement | null>(null);

  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: "16px",
        border: `1px solid ${cssColor("divider")}`,
        background:
          "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
      }}
    >
      <Typography variant="h6" mb={2}>
        ErrorSnap Usage Guide
      </Typography>

      <Box component="ol" sx={{ pl: 2.5, m: 0, display: "grid", gap: 1.5 }}>
        <Box component="li">
          <Typography>
            Click your created project and copy your project ID. Edit the
            script below, paste in your project_id, then copy the full code.
          </Typography>
        </Box>
      </Box>

      <Copy targetRef={scriptRef} sx={{ mt: 2.5, alignItems: "center" }}>
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
        {SDK_POSTBUILD_SCRIPT}
      </Box>
    </Paper>
  );
}
