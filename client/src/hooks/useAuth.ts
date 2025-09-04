import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { queryKeys } from "@/lib/queryKeys";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: queryKeys.user(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
