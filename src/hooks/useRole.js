// Alias de compatibilidad para useRoles
// Este archivo mantiene la API anterior para evitar romper componentes existentes
import { useRoles } from "./useRoles";

export function useRole() {
  const rolesHook = useRoles();

  // Mapear la nueva API a la antigua para compatibilidad
  return {
    // Nuevos campos
    ...rolesHook,

    // Compatibilidad con la API anterior
    role: rolesHook.primaryRole,
    teamIds: [], // Deprecated - ya no se usan teams

    // Mantener las funciones de permisos con nombres anteriores si existen
    profile: rolesHook.profile,
    can: rolesHook.can,
    hasPermission: rolesHook.hasPermission,
  };
}

export default useRole;
