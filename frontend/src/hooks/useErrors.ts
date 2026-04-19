import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { paginatedErrorLogs } from "types/errorLog";
import { apiClient } from "utils/axios";

export const key = "projects-errors";

type errorFilters = {
  projectId: string;
  query?: string | number;
  status?: string | number;
  page?: string | number;
  limit?: string | number;
};

type errorLogsResponse = {
  data: paginatedErrorLogs["data"];
  pagination: paginatedErrorLogs["pagination"];
};

const useErrors = (
  filters: errorFilters,
  initialized = true,
  options?: Partial<UseQueryOptions<errorLogsResponse>>
) => {
  const query = filters?.query || "";
  const status = filters?.status || 0;
  const page = Number(filters?.page) > 0 ? Number(filters?.page) : 1;
  const limit = Number(filters?.limit) > 0 ? Number(filters?.limit) : 10;

  const data = useQuery({
    queryKey: [key, JSON.stringify(filters)],
    queryFn: async (): Promise<errorLogsResponse> => {
      const response = await apiClient.get(
        `/error-logs/${filters?.projectId}?query=${query}&status=${status}&page=${page}&limit=${limit}`
      );
      return {
        data: response.data?.data || [],
        pagination: response.data?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    },
    enabled: initialized,
    ...options,
  });

  return data;
};

export default useErrors;
