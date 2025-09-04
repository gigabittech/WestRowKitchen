import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { queryKeys } from "@/lib/queryKeys";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: queryKeys.user(),
    queryFn: getQueryFn({ on401: "returnNull" }), // Return null on 401 instead of throwing
    retry: false,
  });


  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
