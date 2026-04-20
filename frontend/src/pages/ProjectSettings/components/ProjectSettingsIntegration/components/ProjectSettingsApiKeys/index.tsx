import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import Copy from "components/Copy";
import useProjectId from "hooks/useProjectId";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import useProjectApiKeys, {
  useCreateProjectApiKey,
  useRevokeProjectApiKey,
} from "hooks/useProjectApiKeys";

export default function ProjectSettingsApiKeys() {
  const projectId = useProjectId();
  const { data, isLoading, error } = useProjectApiKeys(projectId);
  const createMutation = useCreateProjectApiKey();
  const revokeMutation = useRevokeProjectApiKey();
  const [label, setLabel] = useState("Production key");
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [generatedKey, setGeneratedKey] = useState("");

  const activeKeys = useMemo(() => data || [], [data]);

  const handleCreateKey = async () => {
    if (!projectId) {
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        projectId,
        label,
        rateLimitPerMinute,
      });
      setGeneratedKey(result?.api_key || "");
      toast.success("API key created successfully");
    } catch (createError) {
      toast.error("Unable to create API key");
    }
  };

  const handleRevoke = async (keyId: number) => {
    if (!projectId) {
      return;
    }

    try {
      await revokeMutation.mutateAsync({ projectId, keyId });
      toast.success("API key revoked");
    } catch {
      toast.error("Unable to revoke API key");
    }
  };

  return (
    <Paper
      sx={{
        mt: 3,
        p: { xs: 2.5, md: 3 },
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" gutterBottom>
            API Keys
          </Typography>
          <Typography color="text.secondary">
            Use a project API key in the SDK to authenticate error ingestion and
            enforce per-project rate limiting.
          </Typography>
        </Box>

        <Divider />

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1.3fr 0.7fr 0.5fr" }} gap={2}>
          <TextField
            label="Key label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
          />
          <TextField
            label="Requests / minute"
            type="number"
            value={rateLimitPerMinute}
            onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1, step: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleCreateKey}
            disabled={createMutation.isPending}
            sx={{ minHeight: 56 }}
          >
            Create key
          </Button>
        </Box>

        {generatedKey ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15, 23, 42, 0.68)",
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Copy this key now. It is shown only once.
            </Typography>
            <Copy copyText={generatedKey}>
              <Typography sx={{ wordBreak: "break-all" }}>{generatedKey}</Typography>
            </Copy>
          </Box>
        ) : null}

        <ListContainer
          loading={isLoading}
          error={error?.message}
          count={activeKeys.length}
          emptyText="No API keys created yet."
        >
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Label</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Rate limit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last used</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeKeys.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>
                      <Chip size="small" label={item.masked_key} variant="outlined" />
                    </TableCell>
                    <TableCell>{item.rate_limit_per_minute} / min</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.is_active ? "Active" : "Revoked"}
                        color={item.is_active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {item.last_used_at
                        ? formatDistanceToNow(new Date(item.last_used_at), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={!item.is_active || revokeMutation.isPending}
                        onClick={() => handleRevoke(item.id)}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ListContainer>
      </Stack>
    </Paper>
  );
}
