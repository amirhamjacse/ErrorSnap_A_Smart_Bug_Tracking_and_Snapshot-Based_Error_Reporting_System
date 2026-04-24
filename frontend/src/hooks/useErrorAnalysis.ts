import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "utils/axios";
import { getFormattedError } from "utils/error";

export type ErrorAnalysisFix = {
  title: string;
  description: string;
  risk_level: "low" | "medium" | "high";
  implementation_steps: string[];
  code_snippet: string;
};

export type ErrorAnalysis = {
  model: string;
  generated_at: string;
  summary: string;
  likely_cause: string;
  explanation: string;
  confidence: number;
  key_signals: string[];
  what_to_check: string[];
  suggested_fixes: ErrorAnalysisFix[];
  error_id: string;
  project_id: string;
  browser: string;
  os: string;
  environment: string;
};

export const key = "error-analysis";

const useErrorAnalysis = (
  errorId?: string,
  initialized = true,
  options?: Partial<UseQueryOptions<ErrorAnalysis>>,
) => {
  const data = useQuery({
    queryKey: [key, errorId],
    queryFn: async (): Promise<ErrorAnalysis> => {
      const response = await apiClient.get(`/ai/analysis/${errorId}`);
      return response.data?.data;
    },
    enabled: Boolean(errorId) && initialized,
    retry: false,
    staleTime: 1000 * 60 * 10,
    ...options,
  });

  return {
    ...data,
    error: data.isError ? getFormattedError(data.error) : "",
  };
};

export default useErrorAnalysis;
