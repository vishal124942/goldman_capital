import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

interface UserRole {
  role: string;
  investorId: string | null;
  adminId: string | null;
  isSuperAdmin: boolean;
}

import { apiRequest } from "@/lib/queryClient";

async function fetchUser(): Promise<User | null> {
  const response = await apiRequest("GET", "/api/auth/user");
  return response.json();
}

async function fetchUserRole(): Promise<UserRole | null> {
  // Use try-catch because apiRequest throws on non-2xx
  try {
    const response = await apiRequest("GET", "/api/user/role");
    return response.json();
  } catch (e) {
    return null;
  }
}

async function logout(): Promise<void> {
  await apiRequest("POST", "/api/logout");
  window.location.href = "/";
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: roleData, isLoading: isRoleLoading } = useQuery<UserRole | null>({
    queryKey: ["/api/user/role"],
    queryFn: fetchUserRole,
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.setQueryData(["/api/user/role"], null);
    },
  });

  const isLoading = isUserLoading || (!!user && isRoleLoading);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: roleData?.role === "admin" || roleData?.role === "super_admin",
    isSuperAdmin: roleData?.role === "super_admin" || roleData?.isSuperAdmin || false,
    isInvestor: roleData?.role === "investor",
    role: roleData?.role || null,
    investorId: roleData?.investorId || null,
    error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
