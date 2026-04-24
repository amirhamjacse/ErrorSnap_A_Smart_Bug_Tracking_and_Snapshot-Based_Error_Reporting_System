import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { cssColor } from "utils/colors";
import { useState } from "react";
import { errorLog } from "types/errorLog";
import useErrorAnalysis, { ErrorAnalysisFix } from "hooks/useErrorAnalysis";

const riskLevelColor = (level: string) => {
  switch (level) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "error";
    default:
      return "default";
  }
};

const getFixTitle = (fix: ErrorAnalysisFix, index: number) => {
  return fix.title || `Fix ${index + 1}`;
};

export default function ErrorAiExplanation({ error }: { error: errorLog }) {
  const theme = useTheme();
  const [expandedFix, setExpandedFix] = useState<number | null>(null);

  const {
    data,
    isLoading,
    error: errorMessage,
  } = useErrorAnalysis(error?.id, true);

  const toggleFix = (index: number) => {
    setExpandedFix(expandedFix === index ? null : index);
  };

  return (
    <Paper
      sx={{
        mt: 2,
        p: 2.5,
        borderRadius: 1,
        border: `1px solid ${cssColor("divider")}`,
      }}
    >
      <Stack spacing={1.5}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h6">AI Error Analysis</Typography>
            <Typography variant="body2" color="text.secondary">
              Analysis and suggested fixes are generated automatically when this
              page loads.
            </Typography>
          </Box>
        </Box>

        <Divider />

        {errorMessage ? (
          <Alert severity="error">Failed to generate analysis.</Alert>
        ) : isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Generating analysis...
          </Typography>
        ) : data ? (
          <Stack spacing={1.5}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip size="small" label={data.model} variant="outlined" />
              <Chip
                size="small"
                label={`${data.confidence}% confidence`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.summary}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Likely Cause
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.likely_cause}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Explanation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.explanation}
              </Typography>
            </Box>

            {data.key_signals?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Key Signals
                </Typography>
                <Stack spacing={0.5}>
                  {data.key_signals.map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      color="text.secondary"
                    >
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}

            {data.suggested_fixes?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Fixes ({data.suggested_fixes.length})
                </Typography>
                <Stack spacing={0.5}>
                  {data.suggested_fixes.map((fix, index) => (
                    <Card
                      key={`${getFixTitle(fix, index)}-${index}`}
                      sx={{
                        cursor: "pointer",
                        border: `1px solid ${cssColor("divider")}`,
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.02)",
                        },
                      }}
                      onClick={() => toggleFix(index)}
                    >
                      <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          gap={1}
                        >
                          <Box flex={1}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {getFixTitle(fix, index)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {fix.description}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={fix.risk_level}
                            color={riskLevelColor(fix.risk_level)}
                            variant="outlined"
                          />
                        </Box>

                        <Collapse in={expandedFix === index} timeout="auto">
                          <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {fix.implementation_steps?.length ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Implementation Steps
                                </Typography>
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  {fix.implementation_steps.map(
                                    (step, stepIndex) => (
                                      <Typography
                                        key={`${step}-${stepIndex}`}
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {stepIndex + 1}. {step}
                                      </Typography>
                                    ),
                                  )}
                                </Stack>
                              </Box>
                            ) : null}

                            {fix.code_snippet ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Code Snippet
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    p: 1,
                                    mt: 0.5,
                                    borderRadius: 1,
                                    backgroundColor:
                                      theme.palette.mode === "dark"
                                        ? "rgba(255,255,255,0.08)"
                                        : "rgba(0,0,0,0.04)",
                                    whiteSpace: "pre-wrap",
                                    overflowX: "auto",
                                    fontSize: 12,
                                    margin: 0,
                                  }}
                                >
                                  {fix.code_snippet}
                                </Box>
                              </Box>
                            ) : null}
                          </Stack>
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ) : null}

            {data.what_to_check?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  What to Check
                </Typography>
                <Stack spacing={0.5}>
                  {data.what_to_check.map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      color="text.secondary"
                    >
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}

            <Typography variant="caption" color="text.secondary">
              Generated at {new Date(data.generated_at).toLocaleString()}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Analysis is not available yet.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
