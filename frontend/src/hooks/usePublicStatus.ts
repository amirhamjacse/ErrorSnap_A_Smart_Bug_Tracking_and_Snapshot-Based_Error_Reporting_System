import { useQuery } from "@tanstack/react-query";
import { apiClient } from "utils/axios";

interface PublicStatusSummary {
  total_errors: number;
  unresolved: number;
  pending: number;
  resolved: number;
  errors_last_24h: number;
  errors_last_7d: number;
}

interface PublicStatusIncident {
  id: string;
  message: string;
  status: number;
  environment: string;
  browser: string;
  os: string;
  created_at: string;
}

interface PublicStatusResponse {
  project: {
    id: string;
    name: string;
  };
  environment: string;
  generated_at: string;
  status: {
    level: "operational" | "degraded" | "outage";
    label: string;
    message: string;
  };
  summary: PublicStatusSummary;
  incidents: PublicStatusIncident[];
}

export default function usePublicStatus(
  projectId: string | null | undefined,
  environment: string = "production",
  options?: { enabled?: boolean }
) {
  return useQuery<PublicStatusResponse>({
    queryKey: ["public-status", projectId, environment],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const response = await apiClient.get(`/public/status/${projectId}`, {
        params: { environment },
      });

      return response.data;
    },
    enabled: Boolean(projectId) && (options?.enabled ?? true),
    refetchInterval: 60_000,
  });
}
