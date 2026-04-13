import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { project } from "types/project";
import { apiClient } from "utils/axios";

export const key = "project-by-user";

const useProjectByUser = (initialized = true) => {
  const { projectId } = useParams();

  const data = useQuery({
    queryKey: [key, projectId],
    queryFn: async (): Promise<project[]> => {
      const response = await apiClient.get(`/user-project/${projectId}`);
      return response.data?.data;
    },
    enabled: initialized,
    refetchOnWindowFocus: false,
  });

  return data;
};

export default useProjectByUser;
