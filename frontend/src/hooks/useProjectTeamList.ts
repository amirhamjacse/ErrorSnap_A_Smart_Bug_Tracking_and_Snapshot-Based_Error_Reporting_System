import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { teamMember } from "types/team";
import { apiClient } from "utils/axios";
import { getFormattedError } from "utils/error";

export const key = "team-members";

const useProjectTeamList = (
  initialized = true,
  options?: Partial<UseQueryOptions<teamMember[]>>
) => {
  const { projectId } = useParams();

  const data = useQuery({
    queryKey: [key, projectId],
    queryFn: async (): Promise<teamMember[]> => {
      const response = await apiClient.get(`/team-members/${projectId}`);
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

export default useProjectTeamList;
