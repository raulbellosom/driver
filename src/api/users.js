import { account, db, teams } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query, ID, Permission, Role } from "appwrite";

// ==========================================
// USERS SERVICE - Gestión completa de usuarios
// ==========================================

export const usersService = {
  // Listar usuarios con filtros según permisos
  async getUsers(filters = {}) {
    try {
      // Intentar obtener usuarios reales de Appwrite
      try {
        // Obtener perfiles de la colección users_profile
        const profilesResponse = await db.listDocuments(
          env.DB_ID,
          env.COLLECTION_USERS_PROFILE_ID,
          []
        );

        console.log("[USERS] Profile documents:", profilesResponse.total);

        // Procesar los perfiles disponibles
        const users = profilesResponse.documents.map((profile) => {
          return {
            $id: profile.$id,
            userId: profile.userId,
            displayName: profile.displayName || profile.name || "Usuario",
            name: profile.name || "Sin nombre",
            email: profile.email || "Sin email", // Del perfil por ahora
            phone: profile.phone || null,
            isDriver: profile.isDriver || false,
            enabled: profile.enabled ?? true,
            teams: profile.teams || [],
            role: profile.isDriver ? "driver" : "admin",
            createdAt: profile.createdAt || profile.$createdAt,
            updatedAt: profile.updatedAt || profile.$updatedAt,
            profileExists: true,
            labels: [],
            status: true,
          };
        });

        console.log("[USERS] Processed users:", users.length);
        return users;
      } catch (dbError) {
        console.warn(
          "[USERS] Error obteniendo usuarios reales:",
          dbError.message
        );
      }

      // Si no hay datos reales, devolver array vacío (no fake data)
      return [];

      // CÓDIGO ANTERIOR CON DATOS SIMULADOS - REMOVIDO
      // const simulatedUsers = [
    } catch (error) {
      console.error("[USERS] Error getting users:", error);
      throw new Error(error.message || "Error al obtener usuarios");
    }
  },

  // Obtener un usuario específico por ID
  async getUserById(userId) {
    try {
      // Obtener perfil del usuario
      const profiles = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        [Query.equal("userId", userId)]
      );

      if (profiles.documents.length === 0) {
        throw new Error("Usuario no encontrado");
      }

      const profile = profiles.documents[0];

      // Obtener información de teams
      const allMemberships = await Promise.all([
        teams
          .listMemberships(env.TEAM_ADMINS_ID, [Query.equal("userId", userId)])
          .catch(() => ({ memberships: [] })),
        teams
          .listMemberships(env.TEAM_OPS_ID, [Query.equal("userId", userId)])
          .catch(() => ({ memberships: [] })),
        teams
          .listMemberships(env.TEAM_DRIVERS_ID, [Query.equal("userId", userId)])
          .catch(() => ({ memberships: [] })),
      ]);

      const userTeams = [];
      if (allMemberships[0].memberships?.length > 0)
        userTeams.push({ id: env.TEAM_ADMINS_ID, name: "Administradores" });
      if (allMemberships[1].memberships?.length > 0)
        userTeams.push({ id: env.TEAM_OPS_ID, name: "Operaciones" });
      if (allMemberships[2].memberships?.length > 0)
        userTeams.push({ id: env.TEAM_DRIVERS_ID, name: "Conductores" });

      return {
        ...profile,
        teams: userTeams,
        role: userTeams.some((t) => t.id === env.TEAM_ADMINS_ID)
          ? "admin"
          : userTeams.some((t) => t.id === env.TEAM_OPS_ID)
          ? "ops"
          : userTeams.some((t) => t.id === env.TEAM_DRIVERS_ID)
          ? "driver"
          : "none",
      };
    } catch (error) {
      console.error("[USERS] Error getting user:", error);
      throw new Error(error.message || "Error al obtener usuario");
    }
  },

  // Crear nuevo usuario completo (Appwrite + Profile)
  async createUser(userData) {
    try {
      const {
        name,
        email,
        phone,
        password,
        teams: selectedTeams = [],
        displayName,
        isDriver = false,
        enabled = true,
        companyId = null,
      } = userData;

      // Validar formato de teléfono
      if (phone && !/^\+\d{12,15}$/.test(phone)) {
        throw new Error(
          "El teléfono debe tener el formato +523221234567 (incluyendo código de país)"
        );
      }

      // 1. Crear usuario en Appwrite Auth (usando función simulada por ahora)
      // En una implementación real, esto llamaría a tu servidor
      const { createUserOnServer } = await import("./admin");
      const { user } = await createUserOnServer({
        name,
        email,
        phone,
        password,
      });

      try {
        // 2. Crear perfil en users_profile
        const profileData = {
          userId: user.$id,
          displayName: displayName || name,
          isDriver,
          enabled,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Agregar companyId si se proporcionó
        if (companyId) {
          profileData.companies = companyId;
        }

        const profile = await db.createDocument(
          env.DB_ID,
          env.COLLECTION_USERS_PROFILE_ID,
          ID.unique(),
          profileData
        );

        // 3. Agregar usuario a los teams seleccionados
        const teamPromises = selectedTeams.map((teamId) => {
          return teams.createMembership(teamId, [], email);
        });

        await Promise.all(teamPromises);

        return {
          user,
          profile,
          teams: selectedTeams,
        };
      } catch (profileError) {
        // Si falla crear el perfil, intentar eliminar el usuario de Appwrite
        console.error(
          "Error creating profile, attempting to cleanup user:",
          profileError
        );
        // Aquí podrías llamar a una función para eliminar el usuario creado
        throw new Error(
          "Error al crear el perfil del usuario: " + profileError.message
        );
      }
    } catch (error) {
      console.error("[USERS] Error creating user:", error);
      throw new Error(error.message || "Error al crear usuario");
    }
  },

  // Actualizar información del usuario
  async updateUser(userId, updates) {
    try {
      const {
        name,
        email,
        phone,
        teams: newTeams,
        displayName,
        isDriver,
        enabled,
        companyId,
        ...profileUpdates
      } = updates;

      // 1. Actualizar información básica en Appwrite (si se proporcionó)
      if (name || email || phone) {
        const { updateUserOnServer } = await import("./admin");
        await updateUserOnServer(userId, { name, email, phone });
      }

      // 2. Actualizar perfil en users_profile
      const profileData = {
        ...profileUpdates,
        updatedAt: new Date().toISOString(),
      };

      if (displayName !== undefined) profileData.displayName = displayName;
      if (isDriver !== undefined) profileData.isDriver = isDriver;
      if (enabled !== undefined) profileData.enabled = enabled;
      if (companyId !== undefined) profileData.companies = companyId;

      // Obtener el documento del perfil actual
      const currentProfiles = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        [Query.equal("userId", userId)]
      );

      if (currentProfiles.documents.length === 0) {
        throw new Error("Perfil de usuario no encontrado");
      }

      const currentProfile = currentProfiles.documents[0];

      const updatedProfile = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        currentProfile.$id,
        profileData
      );

      // 3. Actualizar membresías de teams si se proporcionaron
      if (newTeams && Array.isArray(newTeams)) {
        // Obtener membresías actuales
        const currentMemberships = await Promise.all([
          teams
            .listMemberships(env.TEAM_ADMINS_ID, [
              Query.equal("userId", userId),
            ])
            .catch(() => ({ memberships: [] })),
          teams
            .listMemberships(env.TEAM_OPS_ID, [Query.equal("userId", userId)])
            .catch(() => ({ memberships: [] })),
          teams
            .listMemberships(env.TEAM_DRIVERS_ID, [
              Query.equal("userId", userId),
            ])
            .catch(() => ({ memberships: [] })),
        ]);

        // Obtener IDs de teams actuales
        const currentTeamIds = [];
        if (currentMemberships[0].memberships?.length > 0)
          currentTeamIds.push(env.TEAM_ADMINS_ID);
        if (currentMemberships[1].memberships?.length > 0)
          currentTeamIds.push(env.TEAM_OPS_ID);
        if (currentMemberships[2].memberships?.length > 0)
          currentTeamIds.push(env.TEAM_DRIVERS_ID);

        // Remover de teams que ya no están en la nueva lista
        const teamsToRemove = currentTeamIds.filter(
          (teamId) => !newTeams.includes(teamId)
        );
        const teamsToAdd = newTeams.filter(
          (teamId) => !currentTeamIds.includes(teamId)
        );

        // Remover membresías
        for (const teamId of teamsToRemove) {
          const memberships = await teams.listMemberships(teamId, [
            Query.equal("userId", userId),
          ]);
          for (const membership of memberships.memberships) {
            await teams.deleteMembership(teamId, membership.$id);
          }
        }

        // Agregar nuevas membresías
        for (const teamId of teamsToAdd) {
          await teams.createMembership(
            teamId,
            [],
            email || currentProfile.email
          );
        }
      }

      return updatedProfile;
    } catch (error) {
      console.error("[USERS] Error updating user:", error);
      throw new Error(error.message || "Error al actualizar usuario");
    }
  },

  // Cambiar contraseña de usuario
  async changeUserPassword(userId, newPassword) {
    try {
      const { changePasswordOnServer } = await import("./admin");
      return await changePasswordOnServer(userId, newPassword);
    } catch (error) {
      console.error("[USERS] Error changing password:", error);
      throw new Error(error.message || "Error al cambiar contraseña");
    }
  },

  // Habilitar/Deshabilitar usuario
  async toggleUserStatus(userId, enabled) {
    try {
      const profiles = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        [Query.equal("userId", userId)]
      );

      if (profiles.documents.length === 0) {
        throw new Error("Usuario no encontrado");
      }

      const profile = profiles.documents[0];

      return await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        profile.$id,
        {
          enabled,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("[USERS] Error toggling user status:", error);
      throw new Error(error.message || "Error al cambiar estado del usuario");
    }
  },

  // Eliminar usuario (soft delete - deshabilitar)
  async deleteUser(userId) {
    return await this.toggleUserStatus(userId, false);
  },

  // Obtener teams disponibles según permisos
  getAvailableTeams(currentUserRole) {
    const allTeams = [
      { id: env.TEAM_ADMINS_ID, name: "Administradores", value: "admin" },
      { id: env.TEAM_OPS_ID, name: "Operaciones", value: "ops" },
      { id: env.TEAM_DRIVERS_ID, name: "Conductores", value: "driver" },
    ];

    if (currentUserRole === "admin") {
      return allTeams;
    } else if (currentUserRole === "ops") {
      return allTeams.filter((team) => team.value === "driver");
    }

    return [];
  },
};

export default usersService;
