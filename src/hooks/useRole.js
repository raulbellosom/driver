import { useQuery } from "@tanstack/react-query";
import { getMemberships } from "../lib/appwrite";
import { getUserProfile } from "../api/auth";
import { env } from "../lib/env";

export function useRole() {
  const { data: memberships, isLoading: loadingMemberships } = useQuery({
    queryKey: ["memberships"],
    queryFn: getMemberships,
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    retry: false,
  });

  const teamIds = (memberships || []).map((m) => m.teamId);
  const isAdmin = teamIds.includes(env.TEAM_ADMINS_ID);
  const isDriver = teamIds.includes(env.TEAM_DRIVERS_ID);

  // Determinar rol basado únicamente en teams
  let role = "anonymous";
  if (isAdmin) {
    role = "admin";
  } else if (isDriver) {
    role = "driver";
  }

  const isLoading = loadingMemberships || loadingProfile;

  // Debug logs
  console.log("[ROLE] Debug:", {
    memberships,
    teamIds,
    isAdmin,
    isDriver,
    role,
    isLoading,
    TEAM_ADMINS_ID: env.TEAM_ADMINS_ID,
    TEAM_DRIVERS_ID: env.TEAM_DRIVERS_ID,
  });

  // Funciones de utilidad para permisos
  const can = {
    createUsers: () => isAdmin,
    editAnyUser: () => isAdmin,
    viewAllUsers: () => isAdmin,
    editOwnProfile: () => isAdmin, // Solo admins pueden editar perfiles
    viewOwnProfile: () => isAdmin || isDriver, // Drivers pueden ver pero no editar
    manageCompanies: () => isAdmin,
    manageBuckets: () => isAdmin,
    accessAdminPanel: () => isAdmin,
  };

  return {
    role,
    teamIds,
    isLoading,
    isAdmin,
    isDriver,
    profile,
    can,
    // Helper para verificar permisos específicos
    hasPermission: (requiredRoles = []) => requiredRoles.includes(role),
  };
}
