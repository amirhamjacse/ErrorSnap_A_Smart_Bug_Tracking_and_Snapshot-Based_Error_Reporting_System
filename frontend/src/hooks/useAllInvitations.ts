import { useQuery } from "@tanstack/react-query";
import { invitation } from "types/invitation";
import { apiClient } from "utils/axios";

export const key = "all-invitations";

const useAllInvitations = (initialized = true) => {
  const data = useQuery({
    queryKey: [key],
    queryFn: async (): Promise<invitation[]> => {
      const response = await apiClient.get("all-invitation");
      return response.data?.data;
    },
    enabled: initialized,
  });

  return data;
};

export default useAllInvitations;
