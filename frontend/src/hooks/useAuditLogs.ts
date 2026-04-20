import { useQuery } from "@tanstack/react-query";
import { auditLog } from "types/auditLog";
import { apiClient } from "utils/axios";

export const key = "audit-logs";

const useAuditLogs = (projectId?: string) => {
  const data = useQuery({
    queryKey: [key, projectId],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<auditLog[]> => {
      const response = await apiClient.get(`/audit-logs/${projectId}`);
      return response.data?.data || [];
    },
  });

  return data;
};

export default useAuditLogs;