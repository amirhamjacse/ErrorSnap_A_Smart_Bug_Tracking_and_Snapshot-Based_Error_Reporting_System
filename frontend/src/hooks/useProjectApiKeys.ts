import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApiKey } from "types/apiKey";
import { apiClient } from "utils/axios";

export const key = "project-api-keys";

const useProjectApiKeys = (projectId?: string) => {
  return useQuery({
    queryKey: [key, projectId],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<projectApiKey[]> => {
      const response = await apiClient.get(`/project-api-keys/${projectId}`);
      return response.data?.data || [];
    },
  });
};

export const useCreateProjectApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      projectId: string;
      label: string;
      rateLimitPerMinute: number;
    }) => {
      const response = await apiClient.post("/project-api-keys", values);
      return response.data?.data as projectApiKey;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [key, variables.projectId],
      });
    },
  });
};

export const useRevokeProjectApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { projectId: string; keyId: number }) => {
      const response = await apiClient.post(
        `/project-api-keys/${values.keyId}/revoke`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [key, variables.projectId],
      });
    },
  });
};

export default useProjectApiKeys;
