import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { project } from "types/project";
import { apiClient } from "utils/axios";

export const key = "user-projects";

const useProjects = (
  filters,
  initialized = true,
  options?: Partial<UseQueryOptions<project[]>>
) => {
  const data = useQuery({
    queryKey: [key, filters?.filterBy],
    queryFn: async (): Promise<project[]> => {
      const response = await apiClient.get(
        `/user-projects?filterBy=${filters?.filterBy}`
      );
      return response.data?.data;
    },
    enabled: initialized,
    ...options,
  });

  return data;
};

export default useProjects;
