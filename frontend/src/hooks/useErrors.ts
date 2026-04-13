import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { errorLog } from "types/errorLog";
import { apiClient } from "utils/axios";

export const key = "projects-errors";

type errorFilters = {
  projectId: string;
  query?: string | number;
  status?: string | number;
};

const useErrors = (
  filters: errorFilters,
  initialized = true,
  options?: Partial<UseQueryOptions<errorLog[]>>
) => {
  const query = filters?.query || "";
  const status = filters?.status || 0;
  const data = useQuery({
    queryKey: [key, JSON.stringify(filters)],
    queryFn: async (): Promise<errorLog[]> => {
      const response = await apiClient.get(
        `/error-logs/${filters?.projectId}?query=${query}&status=${status}`
      );
      return response.data?.data;
    },
    enabled: initialized,
    ...options,
  });

  return data;
};

export default useErrors;
