import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { queryKeys } from "@/lib/queryKeys";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, refetch, error } = useQuery<User>({
    queryKey: queryKeys.user(),
    retry: false,
  });


  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
