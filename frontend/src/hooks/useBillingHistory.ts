import { useQuery } from "@tanstack/react-query";
import { billingHistoryItem } from "types/billing";
import { apiClient } from "utils/axios";

export const key = "billing-history";

const useBillingHistory = (projectId?: string, limit = 12) => {
  return useQuery({
    queryKey: [key, projectId, limit],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<billingHistoryItem[]> => {
      const response = await apiClient.get(`/billing/history/${projectId}`, {
        params: {
          limit,
        },
      });
      return response.data?.data || [];
    },
  });
};

export default useBillingHistory;