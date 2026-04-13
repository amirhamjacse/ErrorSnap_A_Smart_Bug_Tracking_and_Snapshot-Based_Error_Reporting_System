import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { errorLog } from "types/errorLog";
import { apiClient } from "utils/axios";
import { getFormattedError } from "utils/error";

export const key = "single-error";

const useError = (
  id,
  initialized = true,
  options?: Partial<UseQueryOptions<errorLog>>
) => {
  const data = useQuery({
    queryKey: [key, id],
    queryFn: async (): Promise<errorLog> => {
      const response = await apiClient.get(`/errors/${id}`);
      return response.data?.data;
    },
    enabled: initialized,
    ...options,
  });

  return {
    ...data,
    error: data.isError ? getFormattedError(data.error) : "",
  };
};

export default useError;
