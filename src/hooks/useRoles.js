import { useMemo } from "react";
import { useAuth } from "./useAuth";

/**
 * Hook optimizado para manejar roles y permisos basado en el nuevo campo roles array
 * Reemplaza el sistema anterior basado en teams
 */
export function useRoles() {
  const { user, isLoading: authLoading } = useAuth();

  // Calcular datos de roles basado en el campo roles del perfil
  const roleData = useMemo(() => {
    // Estado por defecto cuando no hay usuario
    if (!user?.profile?.roles) {
      return {
        roles: [],
        isRoot: false,
        isAdmin: false,
        isOps: false,
        isDriver: false,
        primaryRole: "anonymous",
        profile: null,
        isLoading: authLoading,
      };
    }

    const profile = user.profile;
    const roles = Array.isArray(profile.roles) ? profile.roles : [];

    // Determinar roles específicos
    const isRoot = roles.includes("root");
    const isAdmin = roles.includes("admin");
    const isOps = roles.includes("ops");
    const isDriver = roles.includes("driver");

    // Determinar rol principal (orden de prioridad: Root > Admin > Ops > Driver > Anonymous)
    let primaryRole = "anonymous";
    if (isRoot) {
      primaryRole = "root";
    } else if (isAdmin) {
      primaryRole = "admin";
    } else if (isOps) {
      primaryRole = "ops";
    } else if (isDriver) {
      primaryRole = "driver";
    }

    return {
      roles,
      isRoot,
      isAdmin,
      isOps,
      isDriver,
      primaryRole,
      profile,
      isLoading: authLoading,
    };
  }, [user?.profile, authLoading]);

  // Funciones de permisos memoizadas basadas en la nueva estructura de roles
  const permissions = useMemo(
    () => ({
      // === GESTIÓN DE USUARIOS ===
      // Crear usuarios
      createUsers: () => roleData.isRoot || roleData.isAdmin || roleData.isOps,
      createRootUsers: () => roleData.isRoot,
      createAdminUsers: () => roleData.isRoot || roleData.isAdmin,
      createOpsUsers: () => roleData.isRoot || roleData.isAdmin,
      createDriverUsers: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,

      // Ver usuarios
      viewAllUsers: () => roleData.isRoot || roleData.isAdmin,
      viewOpsAndDrivers: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,
      viewOnlyDrivers: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,

      // Editar usuarios
      editAnyUser: () => roleData.isRoot || roleData.isAdmin,
      editOpsAndDrivers: () => roleData.isRoot || roleData.isAdmin,
      editOnlyDrivers: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,

      // === GESTIÓN DE PERFIL ===
      editOwnProfile: () =>
        roleData.isRoot ||
        roleData.isAdmin ||
        roleData.isOps ||
        roleData.isDriver,
      viewOwnProfile: () =>
        roleData.isRoot ||
        roleData.isAdmin ||
        roleData.isOps ||
        roleData.isDriver,

      // === ADMINISTRACIÓN GENERAL ===
      manageCompanies: () => roleData.isRoot || roleData.isAdmin,
      manageBuckets: () => roleData.isRoot || roleData.isAdmin,
      accessAdminPanel: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,
      accessUsersManagement: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,

      // === GESTIÓN DE VEHÍCULOS ===
      manageAllVehicles: () => roleData.isRoot || roleData.isAdmin,
      manageAssignedVehicles: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,
      viewAssignedVehicles: () =>
        roleData.isRoot ||
        roleData.isAdmin ||
        roleData.isOps ||
        roleData.isDriver,

      // === GESTIÓN DE VIAJES ===
      manageAllTrips: () => roleData.isRoot || roleData.isAdmin,
      manageCompanyTrips: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,
      manageOwnTrips: () =>
        roleData.isRoot ||
        roleData.isAdmin ||
        roleData.isOps ||
        roleData.isDriver,

      // === REPORTES Y ANÁLISIS ===
      viewAllReports: () => roleData.isRoot || roleData.isAdmin,
      viewCompanyReports: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,
      viewOwnReports: () =>
        roleData.isRoot ||
        roleData.isAdmin ||
        roleData.isOps ||
        roleData.isDriver,

      // === CONFIGURACIÓN DEL SISTEMA ===
      accessSystemSettings: () => roleData.isRoot,
      accessAdminSettings: () => roleData.isRoot || roleData.isAdmin,
      accessCompanySettings: () =>
        roleData.isRoot || roleData.isAdmin || roleData.isOps,

      // === AUDITORÍA ===
      viewAuditLogs: () => roleData.isRoot || roleData.isAdmin,
      exportData: () => roleData.isRoot || roleData.isAdmin,
    }),
    [roleData]
  );

  // Helper para verificar permisos específicos
  const hasRole = useMemo(
    () =>
      (requiredRoles = []) => {
        if (!Array.isArray(requiredRoles)) {
          requiredRoles = [requiredRoles];
        }
        return requiredRoles.some((role) => roleData.roles.includes(role));
      },
    [roleData.roles]
  );

  // Helper para verificar si tiene al menos uno de los roles
  const hasAnyRole = useMemo(
    () =>
      (requiredRoles = []) => {
        if (!Array.isArray(requiredRoles)) {
          requiredRoles = [requiredRoles];
        }
        return requiredRoles.some((role) => roleData.roles.includes(role));
      },
    [roleData.roles]
  );

  // Helper para verificar si tiene todos los roles
  const hasAllRoles = useMemo(
    () =>
      (requiredRoles = []) => {
        if (!Array.isArray(requiredRoles)) {
          requiredRoles = [requiredRoles];
        }
        return requiredRoles.every((role) => roleData.roles.includes(role));
      },
    [roleData.roles]
  );

  // Helper para verificar permisos específicos con compatibilidad hacia atrás
  const hasPermission = useMemo(
    () => (permissionName) => {
      const permissionFunction = permissions[permissionName];
      return typeof permissionFunction === "function"
        ? permissionFunction()
        : false;
    },
    [permissions]
  );

  return {
    // Datos principales
    roles: roleData.roles,
    primaryRole: roleData.primaryRole,
    profile: roleData.profile,
    isLoading: roleData.isLoading,

    // Roles individuales
    isRoot: roleData.isRoot,
    isAdmin: roleData.isAdmin,
    isOps: roleData.isOps,
    isDriver: roleData.isDriver,

    // Funciones de permisos
    can: permissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,

    // Helpers de compatibilidad
    isAuthenticated:
      roleData.isRoot ||
      roleData.isAdmin ||
      roleData.isOps ||
      roleData.isDriver,
  };
}

export default useRoles;
