import { useQuery } from "@tanstack/react-query";
import { apiClient } from "utils/axios";

interface Pattern {
  pattern: string;
  example_message: string;
  occurrence_count: number;
  percentage: string;
  affected_browsers: string[];
  affected_os: string[];
  affected_environments: string[];
  resolution_status: {
    unresolved: number;
    pending: number;
    resolved: number;
  };
  first_occurrence: string;
  last_occurrence: string;
  error_samples: Array<{
    id: string;
    message: string;
    created_at: string;
    status: number;
  }>;
}

interface PatternResponse {
  patterns: Pattern[];
  total_errors: number;
  total_patterns: number;
  period_days: string;
  environment: string;
}

export default function useErrorPatterns(
  projectId: string | null,
  environment: string | number = "production",
  days: string | number = 30
) {
  const envStr = String(environment);
  const daysNum = typeof days === "string" ? parseInt(days, 10) : days;

  return useQuery<PatternResponse>({
    queryKey: ["error-patterns", projectId, envStr, daysNum],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const response = await apiClient.get(`/patterns/${projectId}`, {
        params: {
          environment: envStr,
          days: daysNum,
        },
      });

      return response.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
