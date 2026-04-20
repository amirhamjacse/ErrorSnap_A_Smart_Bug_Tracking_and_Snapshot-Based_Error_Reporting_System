import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { discordDetails } from "types/discord";
import { apiClient } from "utils/axios";
import { getFormattedError } from "utils/error";

export const key = "discord-details";

const useDiscordDetails = (
  projectId?: string,
  initialized = true,
  options?: Partial<UseQueryOptions<discordDetails | null>>
) => {
  const data = useQuery({
    queryKey: [key, projectId],
    queryFn: async (): Promise<discordDetails | null> => {
      const response = await apiClient.get(`/discord/details/${projectId}`);
      return response.data?.data || null;
    },
    enabled: initialized,
    ...options,
  });

  return {
    ...data,
    error: data.isError ? getFormattedError(data.error) : "",
  };
};

export default useDiscordDetails;
