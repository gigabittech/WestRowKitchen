import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { queryKeys } from "@/lib/queryKeys";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: queryKeys.user(),
    retry: false,
  });

  console.log("useAuth hook - user:", user, "isLoading:", isLoading, "isAuthenticated:", !!user);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
