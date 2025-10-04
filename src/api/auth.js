import { account, db } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query, ID } from "appwrite";

// ==========================================
// AUTH SERVICE - Servicio centralizado de autenticación (sin teams)
// ==========================================

export const authService = {
  // Login con email y password
  async login(email, password) {
    try {
      console.log("[AUTH] Attempting login for:", email);

      const session = await account.createEmailPasswordSession(email, password);
      console.log("[AUTH] Login successful, session created");

      // Obtener información del usuario y su perfil
      const user = await authService.getCurrentUser();
      console.log("[AUTH] User data loaded");

      return user;
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      throw new Error(error.message || "Error de credenciales");
    }
  },

  // Registro de nuevo usuario
  async register(userData) {
    try {
      const { name, email, password, role = "driver" } = userData;

      console.log("[AUTH] Attempting registration for:", email);

      const user = await account.create(ID.unique(), email, password, name);
      console.log("[AUTH] User account created:", user.$id);

      // Crear sesión automáticamente
      await account.createEmailPasswordSession(email, password);
      console.log("[AUTH] Session created for new user");

      // Crear perfil automáticamente
      const profile = await authService.bootstrapUserProfile({
        name,
        initialRole: role,
      });

      console.log("[AUTH] Profile bootstrap completed");
      return await authService.getCurrentUser();
    } catch (error) {
      console.error("[AUTH] Registration error:", error);
      throw new Error(error.message || "Error al crear la cuenta");
    }
  },

  // Logout
  async logout() {
    try {
      await account.deleteSession("current");
      // Limpiar cache local
      localStorage.removeItem("driverpro-preferences");
    } catch (error) {
      console.error("[AUTH] Logout error:", error);
      throw new Error("Error al cerrar sesión");
    }
  },

  // Obtener usuario actual con toda la información
  async getCurrentUser() {
    try {
      const user = await account.get();
      if (!user) return null;

      console.log("[AUTH] Getting current user:", user.$id);

      // Obtener perfil del usuario desde DB (que incluye roles)
      const profile = await authService.getUserProfile();
      console.log("[AUTH] User profile:", profile ? "found" : "not found");
      console.log("[AUTH] User roles:", profile?.roles || []);

      return {
        ...user,
        profile: profile,
      };
    } catch (error) {
      // Si es error 401, el usuario no está autenticado
      if (error.code === 401 || error.type === "general_unauthorized_scope") {
        console.log("[AUTH] User not authenticated (401)");
        return null;
      }

      console.error("[AUTH] Error getting current user:", error);
      throw error;
    }
  },

  // Verificar si hay sesión activa
  async checkSession() {
    try {
      const user = await account.get();
      return !!user;
    } catch {
      return false;
    }
  },

  // Obtener perfil del usuario
  async getUserProfile() {
    try {
      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      // Buscar profile por userId
      const response = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [Query.equal("userId", user.$id), Query.limit(1)],
      });

      if (response.documents.length === 0) {
        // Si no existe profile, crearlo automáticamente
        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] No profile found, creating one...");
        }
        return await authService.bootstrapUserProfile();
      }

      return response.documents[0];
    } catch (error) {
      console.error("[AUTH] Error getting user profile:", error);
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  },

  // Bootstrap del perfil de usuario (usando nuevo sistema de roles)
  async bootstrapUserProfile(additionalData = {}) {
    try {
      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      // Verificar si ya existe para evitar duplicados
      const existingResponse = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [Query.equal("userId", user.$id), Query.limit(1)],
      });

      if (existingResponse.documents.length > 0) {
        return existingResponse.documents[0];
      }

      const { phone = null, name, initialRole = "driver" } = additionalData;

      // Determinar roles iniciales basado en el parámetro o por defecto driver
      let initialRoles = ["driver"];
      if (initialRole === "admin") {
        initialRoles = ["admin"];
      } else if (initialRole === "ops") {
        initialRoles = ["ops"];
      } else if (initialRole === "root") {
        initialRoles = ["root"];
      }

      const profileData = {
        userId: user.$id,
        displayName: name || user.name || user.email.split("@")[0],
        avatarUrl: null,
        companies: null, // Relación con companies
        roles: initialRoles, // Nuevo campo roles array
        licenseNumber: null,
        licenseExpiry: null,
        licenseClass: null,
        enabled: true,
      };

      if (process.env.NODE_ENV === "development") {
        console.log("[AUTH] Creating profile with data:", profileData);
        console.log("[AUTH] Initial roles:", initialRoles);
      }

      // Con el nuevo sistema, todos los usuarios tienen permisos AllUsers en Appwrite
      // El control de permisos se hace por código usando el campo roles
      const profile = await db.createDocument({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        documentId: ID.unique(),
        data: profileData,
      });

      console.log("[AUTH] Profile created successfully:", profile.$id);
      return profile;
    } catch (error) {
      console.error("[AUTH] Error bootstrapping user profile:", error);
      throw error;
    }
  },

  // Actualizar información del usuario de Appwrite (nombre, teléfono)
  async updateUser(updates) {
    try {
      console.log("[AUTH] Updating user with:", updates);

      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      // Actualizar nombre si se proporciona
      if (updates.name && updates.name !== user.name) {
        await account.updateName(updates.name);
      }

      // Actualizar teléfono si se proporciona (requiere password)
      if (updates.phone && updates.phone !== user.phone) {
        // Para actualizar teléfono necesitamos la contraseña
        // Por simplicidad, solo actualizaremos el nombre por ahora
        console.log("[AUTH] Phone update requires password, skipping for now");
      }

      // Después de actualizar el usuario, sincronizar el perfil
      if (updates.name) {
        await authService.updateProfile({ displayName: updates.name });
      }

      return await authService.getCurrentUser();
    } catch (error) {
      console.error("[AUTH] Error updating user:", error);
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  // Actualizar perfil del usuario
  async updateProfile(updates) {
    try {
      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      // Buscar el perfil del usuario
      const response = await db.listDocuments({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        queries: [Query.equal("userId", user.$id), Query.limit(1)],
      });

      if (response.documents.length === 0) {
        throw new Error("User profile not found");
      }

      const currentProfile = response.documents[0];
      const userRoles = currentProfile.roles || [];
      const isOwnProfile = currentProfile.userId === user.$id;

      // Verificar permisos basado en roles
      const isRoot = userRoles.includes("root");
      const isAdmin = userRoles.includes("admin");
      const isOps = userRoles.includes("ops");
      const isDriver = userRoles.includes("driver");

      // Definir campos permitidos según los roles
      const allowedFields = [];

      // Campos básicos que todos pueden actualizar en su propio perfil
      if (isOwnProfile) {
        allowedFields.push("displayName", "avatarUrl");
      }

      // Si es driver, puede actualizar campos específicos de licencia
      if (isDriver && isOwnProfile) {
        allowedFields.push("licenseNumber", "licenseExpiry", "licenseClass");
      }

      // Si es ops o superior, puede actualizar campos adicionales
      if (isOps || isAdmin || isRoot) {
        allowedFields.push("companies");
      }

      // Si es admin o root, puede actualizar campos críticos
      if (isAdmin || isRoot) {
        allowedFields.push("enabled", "roles");
      }

      console.log("[AUTH] User permissions:", { isOwnProfile, userRoles });
      console.log("[AUTH] Available fields for update:", allowedFields);
      console.log("[AUTH] Incoming updates:", updates);

      // Filtrar actualizaciones por campos permitidos
      const filteredUpdates = Object.keys(updates)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      console.log("[AUTH] Filtered updates:", filteredUpdates);

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error(
          "No valid fields to update or insufficient permissions"
        );
      }

      // Validar roles si se están actualizando
      if (filteredUpdates.roles) {
        const validRoles = ["root", "admin", "ops", "driver"];
        const newRoles = Array.isArray(filteredUpdates.roles)
          ? filteredUpdates.roles
          : [];

        if (!newRoles.every((role) => validRoles.includes(role))) {
          throw new Error("Invalid roles provided");
        }

        // Solo root puede asignar rol root
        if (newRoles.includes("root") && !isRoot) {
          throw new Error("Insufficient permissions to assign root role");
        }
      }

      // Actualizar el documento
      const updatedProfile = await db.updateDocument({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        documentId: currentProfile.$id,
        data: filteredUpdates,
      });

      console.log("[AUTH] Profile updated successfully");
      return updatedProfile;
    } catch (error) {
      console.error("[AUTH] Error updating profile:", error);
      throw error;
    }
  },

  // Obtener rol del usuario basado en el campo roles del perfil
  async getUserRole() {
    try {
      const profile = await authService.getUserProfile();
      if (!profile || !profile.roles || !Array.isArray(profile.roles)) {
        return "anonymous";
      }

      const roles = profile.roles;

      // Determinar rol principal por prioridad
      if (roles.includes("root")) return "root";
      if (roles.includes("admin")) return "admin";
      if (roles.includes("ops")) return "ops";
      if (roles.includes("driver")) return "driver";

      return "anonymous";
    } catch (error) {
      console.error("[AUTH] Error getting user role:", error);
      return "anonymous";
    }
  },
};

// ==========================================
// FUNCIONES ADMINISTRATIVAS (sin teams)
// ==========================================

// Listar todos los usuarios (basado en roles)
export const listAllUsers = async () => {
  try {
    // Verificar permisos del usuario actual
    const currentUserProfile = await authService.getUserProfile();
    if (!currentUserProfile) {
      throw new Error("User profile not found");
    }

    const userRoles = currentUserProfile.roles || [];
    const canViewAllUsers =
      userRoles.includes("root") ||
      userRoles.includes("admin") ||
      userRoles.includes("ops");

    if (!canViewAllUsers) {
      throw new Error("Access denied. Insufficient privileges.");
    }

    // Obtener todos los perfiles de usuario
    const response = await db.listDocuments({
      databaseId: env.DB_ID,
      collectionId: env.COLLECTION_USERS_PROFILE_ID,
      queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
    });

    console.log("[AUTH] All users fetched:", response.documents.length);
    return response.documents.map((profile) => ({
      ...profile,
      name: profile.displayName,
      role: profile.roles?.[0] || "unknown", // Usar el primer rol como principal
    }));
  } catch (error) {
    console.error("[AUTH] Error listing all users:", error);
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

// Actualizar usuario de Appwrite (basado en roles)
export const updateUserInAppwrite = async (userId, updates) => {
  try {
    // Verificar permisos del usuario actual
    const currentUserProfile = await authService.getUserProfile();
    if (!currentUserProfile) {
      throw new Error("User profile not found");
    }

    const userRoles = currentUserProfile.roles || [];
    const isUserAdmin =
      userRoles.includes("root") || userRoles.includes("admin");

    if (!isUserAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    console.log("[AUTH] Admin updating user:", userId, updates);

    // Si se actualiza el name, sincronizar con displayName en el perfil
    if (updates.name) {
      await updateUserProfileAsAdmin(userId, { displayName: updates.name });
      console.log("[AUTH] DisplayName synchronized with name update");
    }

    // Para email y phone, mostrar mensaje informativo
    if (updates.email || updates.phone) {
      console.log(
        "[AUTH] Email/phone updates require server-side implementation"
      );
    }

    console.log("[AUTH] User profile update completed");
    return {
      success: true,
      message:
        "Profile updated successfully. Note: Email and phone updates require server implementation.",
      updatedFields: Object.keys(updates),
    };
  } catch (error) {
    console.error("[AUTH] Error updating user:", error);
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Actualizar perfil de usuario como administrador (basado en roles)
export const updateUserProfileAsAdmin = async (userId, updates) => {
  try {
    // Verificar permisos del usuario actual
    const currentUserProfile = await authService.getUserProfile();
    if (!currentUserProfile) {
      throw new Error("User profile not found");
    }

    const userRoles = currentUserProfile.roles || [];
    const isUserAdmin =
      userRoles.includes("root") || userRoles.includes("admin");

    if (!isUserAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    // Buscar el perfil del usuario objetivo
    const response = await db.listDocuments({
      databaseId: env.DB_ID,
      collectionId: env.COLLECTION_USERS_PROFILE_ID,
      queries: [Query.equal("userId", userId), Query.limit(1)],
    });

    if (response.documents.length === 0) {
      throw new Error("Target user profile not found");
    }

    const targetProfile = response.documents[0];

    // Validar que no se intente dar más permisos de los que tiene el admin actual
    if (updates.roles) {
      const isRoot = userRoles.includes("root");
      const newRoles = Array.isArray(updates.roles) ? updates.roles : [];

      // Solo root puede asignar rol root
      if (newRoles.includes("root") && !isRoot) {
        throw new Error("Insufficient permissions to assign root role");
      }
    }

    // Actualizar el documento
    const updatedProfile = await db.updateDocument({
      databaseId: env.DB_ID,
      collectionId: env.COLLECTION_USERS_PROFILE_ID,
      documentId: targetProfile.$id,
      data: updates,
    });

    console.log("[AUTH] Profile updated as admin");
    return updatedProfile;
  } catch (error) {
    console.error("[AUTH] Error updating profile as admin:", error);
    throw new Error(`Error updating profile: ${error.message}`);
  }
};

export default authService;
