import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { errorLog } from "types/errorLog";
import { apiClient } from "utils/axios";

export const key = "assigned-error";

const useAssignedErrors = (
  environment?: string,
  initialized = true,
  options?: Partial<UseQueryOptions<errorLog[]>>
) => {
  const data = useQuery({
    queryKey: [key, environment],
    queryFn: async (): Promise<errorLog[]> => {
      const response = await apiClient.get(`/assigned-errors`, {
        params: {
          environment,
        },
      });
      return response.data?.data;
    },
    enabled: initialized,
    ...options,
  });

  return data;
};

export default useAssignedErrors;
