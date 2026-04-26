import { Box, Paper, Typography } from "@mui/material";
import Copy from "components/Copy";
import useProjectId from "hooks/useProjectId";
import { useRef } from "react";
import { cssColor } from "utils/colors";

export default function UsageGuide() {
  const projectId = useProjectId();
  const scriptRef = useRef<HTMLPreElement | null>(null);
  const sourceMapRef = useRef<HTMLPreElement | null>(null);
  const scriptSnippet = `<script>\n  window.addEventListener('load', () => {\n    const script = document.createElement('script');\n    script.src = "https://errorsnap-sdk.netlify.app/";\n    script.onload = () => {\n      const app = new ErrorSnap({\n        projectId: "${projectId}",\n      });\n      app.initialize();\n    };\n    document.body.appendChild(script);\n  });\n</script>`;
  const sourceMapSnippet = `"scripts": {\n  "postbuild": "errorsnap-upload -p ${projectId} -d <dist folder>"\n}`;

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

      <Copy
        targetRef={scriptRef}
        copyText={scriptSnippet}
        sx={{ mt: 2.5, alignItems: "center" }}
      >
        <Typography color="text.secondary">
          Add this script to your website to start capturing errors and
          snapshots.
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
        {scriptSnippet}
      </Box>

      <Copy
        targetRef={sourceMapRef}
        copyText={sourceMapSnippet}
        sx={{ mt: 2.5, alignItems: "center" }}
      >
        <Typography color="text.secondary">
          For source map support add this script in <b>package.json</b> file in
          your project.
        </Typography>
      </Copy>

      <Box
        ref={sourceMapRef}
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
        {sourceMapSnippet}
      </Box>
    </Paper>
  );
}
