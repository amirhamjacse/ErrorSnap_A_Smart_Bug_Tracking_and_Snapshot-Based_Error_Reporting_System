import { useQuery } from "@tanstack/react-query";
import { billingSummary } from "types/billing";
import { apiClient } from "utils/axios";

export const key = "billing-summary";

const useBillingSummary = (projectId?: string, periodKey?: string) => {
  return useQuery({
    queryKey: [key, projectId, periodKey],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<billingSummary> => {
      const response = await apiClient.get(`/billing/summary/${projectId}`, {
        params: {
          periodKey,
        },
      });
      return response.data?.data;
    },
  });
};

export default useBillingSummary;
