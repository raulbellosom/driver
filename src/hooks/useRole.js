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
  const isOps = teamIds.includes(env.TEAM_OPS_ID);
  const isDriver = teamIds.includes(env.TEAM_DRIVERS_ID);

  // Determinar rol basado en teams (orden de prioridad: Admin > Ops > Driver)
  let role = "anonymous";
  if (isAdmin) {
    role = "admin";
  } else if (isOps) {
    role = "ops";
  } else if (isDriver) {
    role = "driver";
  }

  const isLoading = loadingMemberships || loadingProfile;

  // Debug logs (reduced frequency)
  if (Math.random() < 0.05) {
    console.log("[ROLE] Debug:", {
      memberships,
      teamIds,
      isAdmin,
      isOps,
      isDriver,
      role,
      isLoading,
      TEAM_ADMINS_ID: env.TEAM_ADMINS_ID,
      TEAM_OPS_ID: env.TEAM_OPS_ID,
      TEAM_DRIVERS_ID: env.TEAM_DRIVERS_ID,
    });
  }

  // Funciones de utilidad para permisos
  const can = {
    // Gestión de usuarios
    createUsers: () => isAdmin || isOps,
    createAdminUsers: () => isAdmin,
    createOpsUsers: () => isAdmin,
    createDriverUsers: () => isAdmin || isOps,

    // Ver usuarios
    viewAllUsers: () => isAdmin,
    viewOpsAndDrivers: () => isAdmin || isOps,
    viewOnlyDrivers: () => isOps,

    // Editar usuarios
    editAnyUser: () => isAdmin,
    editOpsAndDrivers: () => isAdmin || isOps,
    editOnlyDrivers: () => isOps,

    // Perfiles
    editOwnProfile: () => isAdmin || isOps, // Admin y Ops pueden editar perfiles
    viewOwnProfile: () => isAdmin || isOps || isDriver, // Todos pueden ver su perfil

    // Administración general
    manageCompanies: () => isAdmin,
    manageBuckets: () => isAdmin,
    accessAdminPanel: () => isAdmin || isOps,
    accessUsersManagement: () => isAdmin || isOps,
  };

  return {
    role,
    teamIds,
    isLoading,
    isAdmin,
    isOps,
    isDriver,
    profile,
    can,
    // Helper para verificar permisos específicos
    hasPermission: (requiredRoles = []) => requiredRoles.includes(role),
  };
}
