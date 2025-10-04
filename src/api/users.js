import { account, db } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query, ID } from "appwrite";
import { authService } from "./auth";

// ==========================================
// USERS SERVICE - Gestión completa de usuarios (sin teams)
// ==========================================

export const usersService = {
  // Listar usuarios con filtros según permisos
  async getUsers(filters = {}) {
    try {
      // Verificar permisos del usuario actual
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile) {
        throw new Error("User profile not found");
      }

      const userRoles = currentUserProfile.roles || [];
      const canViewUsers =
        userRoles.includes("root") ||
        userRoles.includes("admin") ||
        userRoles.includes("ops");

      if (!canViewUsers) {
        throw new Error(
          "Access denied. Insufficient privileges to view users."
        );
      }

      // Obtener perfiles de la colección users_profile
      const profilesResponse = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [],
      });

      console.log("[USERS] Profile documents:", profilesResponse.total);

      // Procesar los perfiles disponibles
      const users = profilesResponse.documents.map((profile) => {
        const roles = profile.roles || [];
        const primaryRole = roles.includes("root")
          ? "root"
          : roles.includes("admin")
          ? "admin"
          : roles.includes("ops")
          ? "ops"
          : roles.includes("driver")
          ? "driver"
          : "unknown";

        return {
          $id: profile.$id,
          userId: profile.userId,
          displayName: profile.displayName || "Usuario",
          name: profile.displayName || "Sin nombre",
          email: profile.email || "Sin email", // Del perfil por ahora
          phone: profile.phone || null,
          roles: profile.roles || [],
          primaryRole: primaryRole,
          enabled: profile.enabled ?? true,
          createdAt: profile.createdAt || profile.$createdAt,
          updatedAt: profile.updatedAt || profile.$updatedAt,
          profileExists: true,
          labels: [],
          status: true,
          // Campos específicos de driver
          licenseNumber: profile.licenseNumber || null,
          licenseExpiry: profile.licenseExpiry || null,
          licenseClass: profile.licenseClass || null,
        };
      });

      // Filtrar usuarios según los permisos
      let filteredUsers = users;

      if (
        userRoles.includes("ops") &&
        !userRoles.includes("admin") &&
        !userRoles.includes("root")
      ) {
        // Ops solo puede ver drivers y otros ops (no admins ni roots)
        filteredUsers = users.filter((user) => {
          const targetRoles = user.roles || [];
          return targetRoles.includes("driver") || targetRoles.includes("ops");
        });
      }

      // Ocultar usuarios root si no es root
      if (!userRoles.includes("root")) {
        filteredUsers = filteredUsers.filter((user) => {
          const targetRoles = user.roles || [];
          return !targetRoles.includes("root");
        });
      }

      console.log("[USERS] Processed users:", filteredUsers.length);
      return filteredUsers;
    } catch (error) {
      console.error("[USERS] Error obteniendo usuarios:", error);
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },

  // Obtener un usuario específico por ID
  async getUserById(userId) {
    try {
      // Verificar permisos del usuario actual
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile) {
        throw new Error("User profile not found");
      }

      const userRoles = currentUserProfile.roles || [];
      const canViewUser =
        userRoles.includes("root") ||
        userRoles.includes("admin") ||
        userRoles.includes("ops");
      const isOwnProfile = currentUserProfile.userId === userId;

      if (!canViewUser && !isOwnProfile) {
        throw new Error("Access denied. Cannot view this user.");
      }

      // Buscar el perfil del usuario
      const response = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [Query.equal("userId", userId), Query.limit(1)],
      });

      if (response.documents.length === 0) {
        throw new Error("User profile not found");
      }

      const profile = response.documents[0];
      const roles = profile.roles || [];
      const primaryRole = roles.includes("root")
        ? "root"
        : roles.includes("admin")
        ? "admin"
        : roles.includes("ops")
        ? "ops"
        : roles.includes("driver")
        ? "driver"
        : "unknown";

      return {
        ...profile,
        primaryRole: primaryRole,
        name: profile.displayName,
      };
    } catch (error) {
      console.error("[USERS] Error getting user by ID:", error);
      throw new Error(`Error fetching user: ${error.message}`);
    }
  },

  // Crear un nuevo usuario
  async createUser(userData) {
    try {
      // Verificar permisos del usuario actual
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile) {
        throw new Error("User profile not found");
      }

      const userRoles = currentUserProfile.roles || [];
      const canCreateUsers =
        userRoles.includes("root") ||
        userRoles.includes("admin") ||
        userRoles.includes("ops");

      if (!canCreateUsers) {
        throw new Error(
          "Access denied. Insufficient privileges to create users."
        );
      }

      // Validar que no se intenten crear roles superiores
      const targetRoles = Array.isArray(userData.roles)
        ? userData.roles
        : [userData.role || "driver"];

      // Verificaciones de roles
      if (targetRoles.includes("root") && !userRoles.includes("root")) {
        throw new Error("Insufficient permissions to create root users");
      }

      if (
        targetRoles.includes("admin") &&
        !userRoles.includes("root") &&
        !userRoles.includes("admin")
      ) {
        throw new Error("Insufficient permissions to create admin users");
      }

      if (
        userRoles.includes("ops") &&
        !userRoles.includes("admin") &&
        !userRoles.includes("root")
      ) {
        // Ops solo puede crear drivers
        if (!targetRoles.every((role) => role === "driver")) {
          throw new Error("Ops can only create driver users");
        }
      }

      const { name, email, password } = userData;

      console.log("[USERS] Creating new user:", email);

      // Crear usuario en Appwrite Auth
      const user = await account.create(ID.unique(), email, password, name);
      console.log("[USERS] Auth user created:", user.$id);

      // Crear perfil automáticamente
      const profileData = {
        userId: user.$id,
        displayName: name,
        avatarUrl: null,
        companies: null,
        roles: targetRoles,
        licenseNumber: null,
        licenseExpiry: null,
        licenseClass: null,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const profile = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        ID.unique(),
        profileData
      );

      console.log("[USERS] User profile created:", profile.$id);
      return {
        ...user,
        profile: profile,
        roles: targetRoles,
        primaryRole: targetRoles[0],
      };
    } catch (error) {
      console.error("[USERS] Error creating user:", error);
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  // Actualizar usuario existente
  async updateUser(userId, updates) {
    try {
      // Verificar permisos del usuario actual
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile) {
        throw new Error("User profile not found");
      }

      const userRoles = currentUserProfile.roles || [];
      const canUpdateUsers =
        userRoles.includes("root") ||
        userRoles.includes("admin") ||
        userRoles.includes("ops");
      const isOwnProfile = currentUserProfile.userId === userId;

      // Buscar el perfil del usuario objetivo
      const targetResponse = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [Query.equal("userId", userId), Query.limit(1)],
      });

      if (targetResponse.documents.length === 0) {
        throw new Error("Target user profile not found");
      }

      const targetProfile = targetResponse.documents[0];
      const targetRoles = targetProfile.roles || [];

      // Verificar permisos específicos
      if (!canUpdateUsers && !isOwnProfile) {
        throw new Error("Access denied. Cannot update this user.");
      }

      // Validaciones adicionales para roles
      if (updates.roles) {
        const newRoles = Array.isArray(updates.roles) ? updates.roles : [];

        // Solo root puede modificar roles root
        if (
          (targetRoles.includes("root") || newRoles.includes("root")) &&
          !userRoles.includes("root")
        ) {
          throw new Error("Insufficient permissions to modify root users");
        }

        // Solo admin+ puede modificar roles admin
        if (
          (targetRoles.includes("admin") || newRoles.includes("admin")) &&
          !userRoles.includes("root") &&
          !userRoles.includes("admin")
        ) {
          throw new Error("Insufficient permissions to modify admin users");
        }

        // Ops solo puede modificar drivers
        if (
          userRoles.includes("ops") &&
          !userRoles.includes("admin") &&
          !userRoles.includes("root")
        ) {
          if (
            !targetRoles.every((role) => role === "driver") ||
            !newRoles.every((role) => role === "driver")
          ) {
            throw new Error("Ops can only modify driver users");
          }
        }
      }

      // Filtrar campos según permisos
      const allowedFields = [];

      if (isOwnProfile) {
        allowedFields.push(
          "displayName",
          "avatarUrl",
          "licenseNumber",
          "licenseExpiry",
          "licenseClass"
        );
      }

      if (
        userRoles.includes("root") ||
        userRoles.includes("admin") ||
        (userRoles.includes("ops") &&
          targetRoles.every((role) => role === "driver"))
      ) {
        allowedFields.push("enabled", "roles", "companies");
      }

      const filteredUpdates = Object.keys(updates)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error("No valid fields to update");
      }

      // Agregar timestamp de actualización
      filteredUpdates.updatedAt = new Date().toISOString();

      // Actualizar el documento
      const updatedProfile = await db.updateDocument({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        documentId: targetProfile.$id,
        data: filteredUpdates,
      });

      console.log("[USERS] User updated successfully");
      return updatedProfile;
    } catch (error) {
      console.error("[USERS] Error updating user:", error);
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  // Eliminar usuario
  async deleteUser(userId) {
    try {
      // Verificar permisos del usuario actual
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile) {
        throw new Error("User profile not found");
      }

      const userRoles = currentUserProfile.roles || [];
      const canDeleteUsers =
        userRoles.includes("root") || userRoles.includes("admin");

      if (!canDeleteUsers) {
        throw new Error(
          "Access denied. Insufficient privileges to delete users."
        );
      }

      // Buscar el perfil del usuario objetivo
      const targetResponse = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [Query.equal("userId", userId), Query.limit(1)],
      });

      if (targetResponse.documents.length === 0) {
        throw new Error("Target user profile not found");
      }

      const targetProfile = targetResponse.documents[0];
      const targetRoles = targetProfile.roles || [];

      // Solo root puede eliminar otros roots
      if (targetRoles.includes("root") && !userRoles.includes("root")) {
        throw new Error("Insufficient permissions to delete root users");
      }

      // Prevenir auto-eliminación
      if (currentUserProfile.userId === userId) {
        throw new Error("Cannot delete your own account");
      }

      // Eliminar perfil (nota: eliminar usuario de Auth requiere API server-side)
      await db.deleteDocument({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        documentId: targetProfile.$id,
      });

      console.log("[USERS] User profile deleted successfully");
      return { success: true, message: "User profile deleted successfully" };
    } catch (error) {
      console.error("[USERS] Error deleting user:", error);
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },

  // Obtener roles disponibles según permisos del usuario actual
  async getAvailableRoles() {
    try {
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile) {
        return [];
      }

      const userRoles = currentUserProfile.roles || [];
      const availableRoles = [];

      // Root puede asignar cualquier rol
      if (userRoles.includes("root")) {
        availableRoles.push(
          {
            value: "root",
            label: "Root",
            description: "Acceso total al sistema",
          },
          {
            value: "admin",
            label: "Administrador",
            description: "Gestión completa de recursos",
          },
          {
            value: "ops",
            label: "Operaciones",
            description: "Gestión operativa",
          },
          {
            value: "driver",
            label: "Conductor",
            description: "Acceso de conductor",
          }
        );
      }
      // Admin puede asignar admin, ops y driver
      else if (userRoles.includes("admin")) {
        availableRoles.push(
          {
            value: "admin",
            label: "Administrador",
            description: "Gestión completa de recursos",
          },
          {
            value: "ops",
            label: "Operaciones",
            description: "Gestión operativa",
          },
          {
            value: "driver",
            label: "Conductor",
            description: "Acceso de conductor",
          }
        );
      }
      // Ops solo puede asignar driver
      else if (userRoles.includes("ops")) {
        availableRoles.push({
          value: "driver",
          label: "Conductor",
          description: "Acceso de conductor",
        });
      }

      return availableRoles;
    } catch (error) {
      console.error("[USERS] Error getting available roles:", error);
      return [];
    }
  },
};

export default usersService;
