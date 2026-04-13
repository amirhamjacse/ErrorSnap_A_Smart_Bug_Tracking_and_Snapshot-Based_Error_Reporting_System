import { useQuery } from "@tanstack/react-query";
import { apiClient } from "utils/axios";

export const key = "has-invitations";

export default function useHasInvitation(initialized = true) {
  const data = useQuery({
    queryKey: [key],
    queryFn: async (): Promise<boolean> => {
      const response = await apiClient.get("has-invitations");
      return response.data?.data;
    },
    enabled: initialized,
  });

  return data;
}
