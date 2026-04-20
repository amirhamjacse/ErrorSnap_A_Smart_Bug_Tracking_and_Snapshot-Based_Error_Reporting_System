import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";
import { useState } from "react";
import { errorLog } from "types/errorLog";

interface AiExplanation {
  model: string;
  used_fallback: boolean;
  generated_at: string;
  summary: string;
  likely_cause: string;
  explanation: string;
  confidence: number;
  key_signals: string[];
  fix_steps: string[];
  what_to_check: string[];
}

export default function ErrorAiExplanation({ error }: { error: errorLog }) {
  const [data, setData] = useState<AiExplanation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/ai/error-explanation/${error.id}`);
      return response.data?.data as AiExplanation;
    },
  });

  const handleGenerate = async () => {
    setErrorMessage("");
    try {
      const result = await mutateAsync();
      setData(result);
    } catch (mutationError) {
      setErrorMessage("Failed to generate AI explanation.");
    }
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
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
          <Box>
            <Typography variant="h6">AI Error Explanation</Typography>
            <Typography variant="body2" color="text.secondary">
              Generate a plain-language explanation using Gemini free tier when configured.
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Generating..." : data ? "Regenerate" : "Generate"}
          </Button>
        </Box>

        <Divider />

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {data ? (
          <Stack spacing={1.5}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip size="small" label={data.model} variant="outlined" />
              <Chip size="small" label={`${data.confidence}% confidence`} color="primary" variant="outlined" />
              <Chip size="small" label={data.used_fallback ? "Fallback" : "Gemini"} color={data.used_fallback ? "warning" : "success"} variant="outlined" />
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
                    <Typography key={item} variant="body2" color="text.secondary">
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}

            {data.fix_steps?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Fixes
                </Typography>
                <Stack spacing={0.5}>
                  {data.fix_steps.map((item) => (
                    <Typography key={item} variant="body2" color="text.secondary">
                      • {item}
                    </Typography>
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
                    <Typography key={item} variant="body2" color="text.secondary">
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
            Click Generate to get an AI explanation for this error.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
