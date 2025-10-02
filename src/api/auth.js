import { account, db, teams } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query, ID, Permission, Role } from "appwrite";

// ==========================================
// AUTH SERVICE - Servicio centralizado de autenticación
// ==========================================

export const authService = {
  // Login con email y password
  async login(email, password) {
    try {
      // Crear sesión
      const session = await account.createEmailPasswordSession(email, password);

      // Obtener información completa del usuario
      const userData = await authService.getCurrentUser();

      return {
        session,
        user: userData,
      };
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      throw new Error(error.message || "Error al iniciar sesión");
    }
  },

  // Registro de nuevo usuario
  async register(userData) {
    try {
      const { email, password, name, phone, isDriver = false } = userData;

      // Crear usuario en Appwrite Auth
      const user = await account.create("unique()", email, password, name);

      // Crear sesión automáticamente
      await account.createEmailPasswordSession(email, password);

      // Bootstrap del perfil (T2 requirement)
      const profile = await authService.bootstrapUserProfile({
        phone,
        isDriver,
        name: name || user.name,
      });

      return { user, profile };
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
      // Obtener usuario de Appwrite Auth
      const user = await account.get();
      if (!user) return null;

      // Obtener teams del usuario
      const userTeams = await authService.getUserTeams();

      // Obtener perfil extendido
      const profile = await authService.getUserProfile();

      return {
        ...user,
        teams: userTeams,
        profile,
      };
    } catch (error) {
      console.error("[AUTH] Get current user error:", error);
      if (error.code === 401) {
        return null; // Usuario no autenticado
      }
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

  // Obtener teams del usuario
  async getUserTeams() {
    try {
      const user = await account.get();
      if (!user) return [];

      // Obtener lista de teams del usuario actual
      // teams.list() obtiene los teams donde el usuario actual es miembro
      const teamsList = await teams.list();

      console.log("[AUTH] User teams fetched:", teamsList);
      return teamsList.teams || [];
    } catch (error) {
      console.error("[AUTH] Error getting user teams:", error);
      return [];
    }
  },

  // Obtener perfil del usuario
  async getUserProfile() {
    try {
      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      // Buscar profile por userId
      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        [Query.equal("userId", user.$id), Query.limit(1)]
      );

      if (response.documents.length === 0) {
        // Si no existe profile, crearlo automáticamente
        console.log("[AUTH] No profile found, creating one...");
        return await authService.bootstrapUserProfile();
      }

      return response.documents[0];
    } catch (error) {
      console.error("[AUTH] Error getting user profile:", error);
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  },

  // Bootstrap del perfil de usuario (T2)
  async bootstrapUserProfile(additionalData = {}) {
    try {
      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      // Verificar si ya existe para evitar duplicados
      const existingResponse = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        [Query.equal("userId", user.$id), Query.limit(1)]
      );

      if (existingResponse.documents.length > 0) {
        return existingResponse.documents[0];
      }

      // Obtener teams del usuario para determinar permisos y rol
      const userTeams = await authService.getUserTeams();
      const userTeamIds = userTeams.map((team) => team.$id);

      console.log("[AUTH] User teams:", userTeamIds);

      // Determinar si es driver o admin basado en teams
      const isInDriverTeam = userTeamIds.includes(env.TEAM_DRIVERS_ID);
      const isInAdminTeam = userTeamIds.includes(env.TEAM_ADMINS_ID);

      // Si está en team de drivers, es driver. Si está en admin, no es driver
      const isDriver = isInDriverTeam;

      const { phone = null, name } = additionalData;

      const profileData = {
        userId: user.$id,
        displayName: name || user.name || user.email.split("@")[0],
        avatarUrl: null,
        companies: null, // Relación con companies
        isDriver: isDriver,
        licenseNumber: null,
        licenseExpiry: null,
        enabled: true,
      };

      console.log("[AUTH] Creating profile with data:", profileData);
      console.log("[AUTH] User is driver:", isDriver, "Teams:", userTeamIds);

      // Crear permisos correctos:
      // - El usuario siempre puede leer/actualizar su propio perfil
      // - Los ADMINS pueden leer/actualizar TODOS los perfiles (siempre)
      // - Los DRIVERS solo pueden ver su propio perfil
      const permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        // Los admins SIEMPRE pueden leer/actualizar cualquier perfil
        Permission.read(Role.team(env.TEAM_ADMINS_ID)),
        Permission.update(Role.team(env.TEAM_ADMINS_ID)),
      ];

      // IMPORTANTE: No agregar permisos de team drivers aquí
      // Los drivers solo pueden ver su propio perfil (Permission.user ya cubre esto)      console.log("[AUTH] Permissions being set:", permissions);

      // Crear documento con permisos
      const profile = await db.createDocument({
        databaseId: env.DB_ID,
        collectionId: env.COLLECTION_USERS_PROFILE_ID,
        documentId: ID.unique(),
        data: profileData,
        permissions: permissions,
      });

      console.log("[AUTH] Profile created:", profile);
      return profile;
    } catch (error) {
      console.error("[AUTH] Error creating profile:", error);
      throw new Error(`Error creating user profile: ${error.message}`);
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
      // Refrescar la sesión para obtener los permisos más actualizados
      const user = await account.get();
      if (!user) throw new Error("No authenticated user");

      console.log("[AUTH] Current user session:", {
        id: user.$id,
        email: user.email,
        name: user.name,
      });

      // Si se proporciona un userId específico en updates, usar ese (solo para admins)
      // Si no, usar el userId del usuario actual
      const targetUserId = updates.targetUserId || user.$id;

      // Buscar el documento del perfil
      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_USERS_PROFILE_ID,
        [Query.equal("userId", targetUserId), Query.limit(1)]
      );

      if (response.documents.length === 0) {
        throw new Error("User profile not found");
      }

      const profileId = response.documents[0].$id;

      // Verificar permisos ANTES de filtrar campos
      const userTeams = await authService.getUserTeams();
      const isUserAdmin = userTeams.some(
        (team) => team.$id === env.TEAM_ADMINS_ID
      );
      const isOwnProfile = response.documents[0].userId === user.$id;

      // Definir campos permitidos según el contexto
      const allowedFields = ["displayName", "avatarUrl"];

      // Si es driver, puede actualizar campos específicos
      if (updates.isDriver || response.documents[0].isDriver) {
        allowedFields.push("licenseNumber", "licenseExpiry", "licenseClass");
      }

      // Si es admin, puede actualizar campos adicionales
      if (isUserAdmin) {
        allowedFields.push("enabled", "isDriver");
      }

      console.log("[AUTH] User permissions:", { isOwnProfile, isUserAdmin });
      console.log("[AUTH] Available fields for update:", allowedFields);
      console.log("[AUTH] Incoming updates:", updates);

      // Filtrar solo campos permitidos
      const filteredUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        if (key === "targetUserId") {
          // Skip targetUserId, es solo para routing
          continue;
        }

        if (allowedFields.includes(key)) {
          // Validar URL si es avatarUrl
          if (key === "avatarUrl" && value) {
            console.log("[AUTH] Avatar URL length:", value.length);
            console.log(
              "[AUTH] Avatar URL preview:",
              value.substring(0, 100) + (value.length > 100 ? "..." : "")
            );
            // Verificar que la URL no tenga caracteres raros
            if (typeof value !== "string") {
              console.warn(
                "[AUTH] Avatar URL is not a string:",
                typeof value,
                value
              );
              continue;
            }
          }
          filteredUpdates[key] = value;
        } else {
          console.warn("[AUTH] Field not allowed for update:", key);
        }
      }

      // Log debug info
      console.log("[AUTH] Current user:", user.$id);
      console.log(
        "[AUTH] Profile document permissions:",
        response.documents[0].$permissions
      );
      console.log("[AUTH] Allowed fields:", allowedFields);
      console.log("[AUTH] Filtered updates:", filteredUpdates);
      console.log(
        "[AUTH] Profile document owner:",
        response.documents[0].userId
      );
      console.log("[AUTH] Document ID to update:", profileId);
      console.log("[AUTH] Database ID:", env.DB_ID);
      console.log("[AUTH] Collection ID:", env.COLLECTION_USERS_PROFILE_ID);

      // Validar permisos finales
      if (!isOwnProfile && !isUserAdmin) {
        throw new Error("User not authorized to update this profile");
      }

      // Si se está actualizando el perfil de otro usuario, DEBE ser admin
      if (targetUserId !== user.$id && !isUserAdmin) {
        throw new Error("Only admins can update other users' profiles");
      }

      // Verificar que tenemos algo que actualizar
      if (Object.keys(filteredUpdates).length === 0) {
        console.log("[AUTH] No valid fields to update");
        return response.documents[0]; // Retornar el documento sin cambios
      }

      // Actualizar documento - intentar con permisos explícitos
      try {
        const updatedProfile = await db.updateDocument(
          env.DB_ID,
          env.COLLECTION_USERS_PROFILE_ID,
          profileId,
          filteredUpdates
        );
        console.log("[AUTH] Profile updated successfully:", updatedProfile);
        return updatedProfile;
      } catch (updateError) {
        console.error("[AUTH] First update attempt failed:", updateError);

        // Intentar actualización con permisos explícitos
        console.log("[AUTH] Trying update with explicit permissions...");

        const explicitPermissions = response.documents[0].$permissions;

        const updatedProfile = await db.updateDocument(
          env.DB_ID,
          env.COLLECTION_USERS_PROFILE_ID,
          profileId,
          filteredUpdates,
          explicitPermissions
        );

        console.log(
          "[AUTH] Profile updated with explicit permissions:",
          updatedProfile
        );
        return updatedProfile;
      }
    } catch (error) {
      console.error("[AUTH] Error updating profile:", error);
      throw new Error(`Error updating profile: ${error.message}`);
    }
  },

  // Obtener rol del usuario basado en teams
  async getUserRole() {
    try {
      const userTeams = await authService.getUserTeams();

      // Verificar si es admin
      if (userTeams.some((team) => team.$id === env.TEAM_ADMINS_ID)) {
        return "admin";
      }

      // Verificar si es driver
      if (userTeams.some((team) => team.$id === env.TEAM_DRIVERS_ID)) {
        return "driver";
      }

      return "user";
    } catch (error) {
      console.error("[AUTH] Error getting user role:", error);
      return "user";
    }
  },
};

// ==========================================
// FUNCIONES DE COMPATIBILIDAD (mantener por ahora)
// ==========================================

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

// Listar todos los usuarios (solo para administradores)
export const listAllUsers = async () => {
  try {
    // Verificar que el usuario actual es admin
    const userTeams = await authService.getUserTeams();
    const isUserAdmin = userTeams.some(
      (team) => team.$id === env.TEAM_ADMINS_ID
    );

    if (!isUserAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    // Obtener todos los perfiles de usuario
    const response = await db.listDocuments(
      env.DB_ID,
      env.COLLECTION_USERS_PROFILE_ID,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    console.log("[AUTH] All users fetched:", response.documents.length);
    return response.documents.map((profile) => ({
      ...profile,
      name: profile.displayName,
      role: profile.isDriver ? "driver" : "user", // Simplificado por ahora
    }));
  } catch (error) {
    console.error("[AUTH] Error listing all users:", error);
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

// Actualizar usuario de Appwrite (name, email, phone) - solo para administradores
export const updateUserInAppwrite = async (userId, updates) => {
  try {
    // Verificar que el usuario actual es admin
    const userTeams = await authService.getUserTeams();
    const isUserAdmin = userTeams.some(
      (team) => team.$id === env.TEAM_ADMINS_ID
    );

    if (!isUserAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    console.log("[AUTH] Admin updating user:", userId, updates);

    // Nota: Appwrite no permite actualizar usuarios de otros desde el SDK del cliente
    // Por limitaciones de seguridad, solo podemos actualizar el perfil
    // La actualización del usuario de Appwrite (email, phone) requiere servidor

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
}; // Actualizar perfil de usuario como administrador
export const updateUserProfileAsAdmin = async (userId, updates) => {
  try {
    // Verificar que el usuario actual es admin
    const userTeams = await authService.getUserTeams();
    const isUserAdmin = userTeams.some(
      (team) => team.$id === env.TEAM_ADMINS_ID
    );

    if (!isUserAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    console.log("[AUTH] Admin updating user profile:", userId, updates);

    // Buscar el perfil del usuario target
    const response = await db.listDocuments(
      env.DB_ID,
      env.COLLECTION_USERS_PROFILE_ID,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      throw new Error("User profile not found");
    }

    const profileId = response.documents[0].$id;

    // Actualizar el documento del perfil
    const updatedProfile = await db.updateDocument(
      env.DB_ID,
      env.COLLECTION_USERS_PROFILE_ID,
      profileId,
      updates
    );

    console.log("[AUTH] User profile updated by admin:", updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error("[AUTH] Error updating user profile as admin:", error);
    throw new Error(`Error updating user profile: ${error.message}`);
  }
};

// ==========================================
// FUNCIONES DE COMPATIBILIDAD (mantener por ahora)
// ==========================================

// Alias para compatibilidad con código existente
export const loginWithEmail = authService.login;
export const registerUser = authService.register;
export const logout = authService.logout;
export const getCurrentSession = authService.checkSession;
export const getUserProfile = authService.getUserProfile;
export const bootstrapUserProfile = authService.bootstrapUserProfile;
export const updateUser = authService.updateUser;
export const updateUserProfile = authService.updateProfile;
