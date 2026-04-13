import { useQuery } from "@tanstack/react-query";
import { sourcemapHistory } from "types/sourcemapHistory";
import { apiClient } from "utils/axios";

export const key = "sourcemap-history";

const useSourcemapHistory = (projectId: string) => {
  const data = useQuery({
    queryKey: [key],
    queryFn: async (): Promise<sourcemapHistory[]> => {
      const response = await apiClient.get(`/sourcemap-history/${projectId}`);
      return response.data?.data;
    },
  });

  return data;
};

export default useSourcemapHistory;
