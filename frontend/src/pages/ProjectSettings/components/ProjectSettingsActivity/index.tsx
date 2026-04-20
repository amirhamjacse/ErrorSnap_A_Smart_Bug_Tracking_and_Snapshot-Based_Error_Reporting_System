import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import useAuditLogs from "hooks/useAuditLogs";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return "No extra metadata";
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  if (typeof metadata === "object") {
    return Object.entries(metadata as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join("\n");
  }

  return String(metadata);
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    "project.created": "Project created",
    "project.deleted": "Project deleted",
    "error.assigned": "Error assigned",
    "error.resolved": "Error resolved",
    "team.invited": "Team invited",
    "team.invitation_link_sent": "Invitation link sent",
    "team.member_approved": "Member approved",
    "team.invitation_cancelled": "Invitation cancelled",
    "team.member_removed": "Member removed",
  };

  return labels[action] || action;
}

export default function ProjectSettingsActivity() {
  const { projectId } = useParams();
  const { data, isLoading, error } = useAuditLogs(projectId);

  const logs = useMemo(() => data || [], [data]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" mb={1}>
          Activity Log
        </Typography>
        <Typography color="text.secondary">
          Track project changes, team actions, and error workflow events.
        </Typography>
      </Box>

      <ListContainer
        loading={isLoading}
        count={logs.length}
        error={error?.message}
        emptyText="No activity recorded yet."
      >
        <Stack spacing={2}>
          {logs.map((item, index) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">{item.summary}</Typography>
                    <Chip
                      size="small"
                      label={getActionLabel(item.action)}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.actor_name} • {item.entity_type}
                    {item.entity_id ? ` • ${item.entity_id}` : ""}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
              >
                {formatMetadata(item.metadata)}
              </Typography>
              {index < logs.length - 1 && <Box mt={2} />}
            </Paper>
          ))}
        </Stack>
      </ListContainer>
    </Box>
  );
}