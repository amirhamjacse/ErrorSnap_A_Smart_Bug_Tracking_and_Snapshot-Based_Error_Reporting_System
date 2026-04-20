import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Collapse,
  useTheme,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";
import { useState } from "react";
import { errorLog } from "types/errorLog";

interface FixSuggestion {
  title: string;
  description: string;
  code_snippet: string;
  explanation: string;
  risk_level: "low" | "medium" | "high";
  implementation_steps: string[];
  affected_areas: string[];
}

interface FixSuggestionsResponse {
  fixes: FixSuggestion[];
  root_cause: string;
  prevention_tips: string[];
  overall_difficulty: "easy" | "medium" | "hard";
  model: string;
  is_fallback: boolean;
}

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

const difficultyColor = (level: string) => {
  switch (level) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "error";
    default:
      return "default";
  }
};

export default function ErrorFixSuggestions({ error }: { error: errorLog }) {
  const theme = useTheme();
  const [data, setData] = useState<FixSuggestionsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedFix, setExpandedFix] = useState<number | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/fix/suggest/${error.id}`);
      return response.data?.data as FixSuggestionsResponse;
    },
  });

  const handleGenerate = async () => {
    setErrorMessage("");
    setExpandedFix(null);
    try {
      const result = await mutateAsync();
      setData(result);
    } catch (mutationError) {
      setErrorMessage("Failed to generate fix suggestions.");
    }
  };

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
            <Typography variant="h6">Fix Suggestions</Typography>
            <Typography variant="body2" color="text.secondary">
              Get AI-powered code fix recommendations using Gemini free tier.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={isPending}
          >
            {isPending ? "Analyzing..." : data ? "Regenerate" : "Generate"}
          </Button>
        </Box>

        <Divider />

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {data ? (
          <Stack spacing={2}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label={data.model}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`Difficulty: ${data.overall_difficulty}`}
                color={difficultyColor(data.overall_difficulty)}
                variant="outlined"
              />
              <Chip
                size="small"
                label={data.is_fallback ? "Fallback Mode" : "AI Powered"}
                color={data.is_fallback ? "warning" : "success"}
                variant="outlined"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Root Cause Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.root_cause}
              </Typography>
            </Box>

            {data.prevention_tips?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Prevention Tips
                </Typography>
                <Stack spacing={0.5}>
                  {data.prevention_tips.map((tip) => (
                    <Typography key={tip} variant="body2" color="text.secondary">
                      • {tip}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}

            <Divider sx={{ my: 1 }} />

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Suggested Fixes ({data.fixes.length})
              </Typography>
              <Stack spacing={1}>
                {data.fixes.map((fix, index) => (
                  <Card
                    key={index}
                    sx={{
                      cursor: "pointer",
                      border: `1px solid ${cssColor("divider")}`,
                      "&:hover": {
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
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
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {fix.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {fix.description}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={fix.risk_level}
                          color={riskLevelColor(fix.risk_level) as any}
                          variant="outlined"
                        />
                      </Box>

                      <Collapse in={expandedFix === index} timeout="auto">
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Code Snippet
                            </Typography>
                            <Paper
                              sx={{
                                p: 1.5,
                                mt: 1,
                                backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                                overflow: "auto",
                                maxHeight: 200,
                              }}
                            >
                              <Typography
                                component="pre"
                                variant="caption"
                                sx={{
                                  fontFamily: "monospace",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {fix.code_snippet}
                              </Typography>
                            </Paper>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Explanation
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {fix.explanation}
                            </Typography>
                          </Box>

                          {fix.implementation_steps?.length ? (
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Implementation Steps
                              </Typography>
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                {fix.implementation_steps.map((step, stepIndex) => (
                                  <Typography
                                    key={stepIndex}
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {stepIndex + 1}. {step}
                                  </Typography>
                                ))}
                              </Stack>
                            </Box>
                          ) : null}

                          {fix.affected_areas?.length ? (
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Affected Areas
                              </Typography>
                              <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                {fix.affected_areas.map((area) => (
                                  <Chip key={area} label={area} size="small" variant="filled" />
                                ))}
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
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click Generate to get AI-powered fix suggestions for this error.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
