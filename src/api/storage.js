import { storage, db as databases, account, teams } from "../lib/appwrite";
import { env } from "../lib/env";
import { ID, Permission, Role, Query } from "appwrite";

// ==========================================
// AVATAR & FILE UPLOAD MANAGEMENT
// ==========================================

export async function uploadAvatar(file, onProgress = null) {
  try {
    if (!file) throw new Error("No file provided");

    // Validaciones (15MB máximo para avatares)
    const validation = validateImageFile(file, 15 * 1024 * 1024);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    // Upload al bucket de avatares
    const bucketId = env.BUCKET_AVATARS_ID;
    if (!bucketId) {
      throw new Error("Bucket de avatares no configurado");
    }

    console.log("[STORAGE] Uploading avatar to bucket:", bucketId);

    // Obtener usuario actual para permisos
    const user = await account.get();

    // PERMISOS SIMPLIFICADOS: Solo usar los que están configurados en el bucket
    const permissions = [
      Permission.read(Role.any()), // Lectura pública
      Permission.update(Role.user(user.$id)), // El usuario puede actualizar
      Permission.delete(Role.user(user.$id)), // El usuario puede eliminar
      // Solo agregar permisos de equipo si el usuario pertenece a ese equipo
    ];

    // Verificar membresía de equipos y agregar permisos apropiados
    try {
      const teamsList = await teams.list();
      const userTeams = teamsList.teams || [];

      // Si es admin, agregar permisos de admin
      if (userTeams.some((team) => team.$id === env.TEAM_ADMINS_ID)) {
        console.log("[STORAGE] User is admin, adding admin permissions");
        // No agregamos permisos de team admin aquí porque causan el error
        // La configuración del bucket debe manejar esto
      }

      // Si es driver, agregar permisos de driver
      if (userTeams.some((team) => team.$id === env.TEAM_DRIVERS_ID)) {
        console.log("[STORAGE] User is driver, adding driver permissions");
        permissions.push(Permission.read(Role.team(env.TEAM_DRIVERS_ID)));
        permissions.push(Permission.update(Role.team(env.TEAM_DRIVERS_ID)));
      }
    } catch (teamError) {
      console.warn("[STORAGE] Could not check team membership:", teamError);
    }

    const response = await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      permissions,
      onProgress
    );

    // Generar URL de vista previa (pública)
    const avatarUrl = storage.getFileView(bucketId, response.$id);
    console.log("[STORAGE] Raw avatar URL object:", avatarUrl);
    console.log("[STORAGE] Avatar URL type:", typeof avatarUrl);

    // Intentar también con preview para comparar
    const previewUrl = storage.getFilePreview(bucketId, response.$id, 400, 400);
    console.log(
      "[STORAGE] Preview URL:",
      previewUrl.href || previewUrl.toString()
    );

    // Convertir a string limpio - usar view por defecto, preview como fallback
    const cleanUrl = avatarUrl.href || avatarUrl.toString();
    console.log("[STORAGE] Clean avatar URL:", cleanUrl);

    return {
      fileId: response.$id,
      bucketId: bucketId,
      avatarUrl: cleanUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error("[STORAGE] Upload failed:", error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
}

export async function deleteAvatar(bucketId, fileId) {
  try {
    await storage.deleteFile(bucketId, fileId);
    return true;
  } catch (error) {
    console.error("[STORAGE] Delete failed:", error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}

export function getAvatarUrl(bucketId, fileId) {
  try {
    // Usar getFileView que debería funcionar para archivos con permisos públicos
    const url = storage.getFileView(bucketId, fileId);
    const finalUrl = url.href || url.toString();
    console.log("[STORAGE] Generated avatar URL:", finalUrl);
    return finalUrl;
  } catch (error) {
    console.error("[STORAGE] Get URL failed:", error);
    // Fallback: intentar con preview si view falla
    try {
      const previewUrl = storage.getFilePreview(bucketId, fileId, 400, 400);
      return previewUrl.href || previewUrl.toString();
    } catch (previewError) {
      console.error("[STORAGE] Preview fallback also failed:", previewError);
      return null;
    }
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function validateImageFile(file, maxSizeBytes = 5 * 1024 * 1024) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const errors = [];

  if (!file) {
    errors.push("No se seleccionó ningún archivo");
  } else {
    if (file.size > maxSizeBytes) {
      const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
      errors.push(`El archivo es muy grande (máximo ${maxSizeMB}MB)`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push("Tipo de archivo no permitido (use JPG, PNG o WebP)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ==========================================
// DRIVER LICENSE MANAGEMENT
// ==========================================

export async function uploadDriverLicense(
  file,
  licenseType = "front",
  onProgress = null
) {
  try {
    if (!file) throw new Error("No file provided");

    // Validaciones específicas para licencias (15MB máximo)
    const validation = validateImageFile(file, 15 * 1024 * 1024);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    // Validar tipo de licencia
    if (!["front", "back"].includes(licenseType)) {
      throw new Error("Tipo de licencia inválido. Use 'front' o 'back'");
    }

    // Upload al bucket de licencias
    const bucketId = env.BUCKET_DRIVER_LICENSES_ID;
    if (!bucketId) {
      throw new Error("Bucket de licencias no configurado");
    }

    console.log(
      `[STORAGE] Uploading ${licenseType} license to bucket:`,
      bucketId
    );

    // Obtener usuario actual para permisos
    const user = await account.get();

    // PERMISOS SIMPLIFICADOS: Solo usar los que están configurados en el bucket
    const permissions = [
      Permission.read(Role.any()), // Lectura pública
      Permission.update(Role.user(user.$id)), // El usuario puede actualizar
      Permission.delete(Role.user(user.$id)), // El usuario puede eliminar
    ];

    // Verificar membresía de equipos y agregar permisos apropiados
    try {
      const teamsList = await teams.list();
      const userTeams = teamsList.teams || [];

      // Solo agregar permisos de team que estén configurados en el bucket
      if (userTeams.some((team) => team.$id === env.TEAM_DRIVERS_ID)) {
        console.log(
          "[STORAGE] User is driver, adding driver permissions for license"
        );
        permissions.push(Permission.read(Role.team(env.TEAM_DRIVERS_ID)));
        permissions.push(Permission.update(Role.team(env.TEAM_DRIVERS_ID)));
      }
    } catch (teamError) {
      console.warn(
        "[STORAGE] Could not check team membership for license:",
        teamError
      );
    }

    const response = await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      permissions,
      onProgress
    );

    // Generar URL de vista previa
    const licenseUrl = storage.getFileView(bucketId, response.$id);

    return {
      fileId: response.$id,
      bucketId: bucketId,
      licenseUrl: licenseUrl.href || licenseUrl.toString(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      licenseType: licenseType,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[STORAGE] License upload failed:", error);
    throw new Error(`Error al subir licencia: ${error.message}`);
  }
}

export async function createDriverLicenseRecord(userId, licenseData) {
  try {
    if (
      !env.DB_ID ||
      !env.COLLECTION_DRIVER_LICENSES_ID ||
      !env.COLLECTION_USERS_PROFILE_ID
    ) {
      throw new Error("Base de datos no configurada correctamente");
    }

    // 1. Buscar el perfil del usuario para obtener el ID del documento usersProfile
    console.log("[STORAGE] Searching for user profile with userId:", userId);
    const profilesResponse = await databases.listDocuments(
      env.DB_ID,
      env.COLLECTION_USERS_PROFILE_ID,
      [Query.equal("userId", userId)]
    );

    if (profilesResponse.documents.length === 0) {
      throw new Error(
        `No se encontró el perfil del usuario ${userId}. Debe crear un perfil primero.`
      );
    }

    const userProfile = profilesResponse.documents[0];
    console.log("[STORAGE] Found user profile:", userProfile.$id);

    // 2. Verificar si ya existe una licencia para este usuario
    const existingLicense = await databases.listDocuments(
      env.DB_ID,
      env.COLLECTION_DRIVER_LICENSES_ID,
      [Query.equal("userId", userId)]
    );

    if (existingLicense.documents.length > 0) {
      console.log(
        "[STORAGE] License already exists, returning existing record:",
        existingLicense.documents[0].$id
      );
      return existingLicense.documents[0];
    }

    // 3. Crear el registro de licencia con la relación correcta
    const record = await databases.createDocument({
      databaseId: env.DB_ID,
      collectionId: env.COLLECTION_DRIVER_LICENSES_ID,
      documentId: ID.unique(),
      data: {
        usersProfile: userProfile.$id, // RELACIÓN con el documento de usersProfile
        frontFileUrl: licenseData.frontImageUrl || null,
        backFileUrl: licenseData.backImageUrl || null,
        status: "pending", // Valores válidos: pending, approved, rejected
        reviewedByUserId: null,
        reviewNotes: null,
        enabled: true, // Requerido por el schema
        userId: userId, // Campo string para el índice único
      },
    });

    console.log("[STORAGE] Driver license record created successfully:", {
      recordId: record.$id,
      userId: userId,
      userProfileId: userProfile.$id,
      status: record.status,
    });
    return record;
  } catch (error) {
    console.error("[STORAGE] Failed to create license record:", error);
    throw new Error(`Error al crear registro de licencia: ${error.message}`);
  }
}

export async function getUserDriverLicense(userId) {
  try {
    if (!env.DB_ID || !env.COLLECTION_DRIVER_LICENSES_ID) {
      throw new Error("Base de datos no configurada correctamente");
    }

    console.log("[STORAGE] Searching for driver license with userId:", userId);
    const response = await databases.listDocuments(
      env.DB_ID,
      env.COLLECTION_DRIVER_LICENSES_ID,
      [Query.equal("userId", userId)]
    );

    if (response.documents.length === 0) {
      console.log("[STORAGE] No driver license found for user:", userId);
      return null;
    }

    const license = response.documents[0];
    console.log("[STORAGE] Found driver license:", {
      licenseId: license.$id,
      userId: license.userId,
      userProfileId: license.usersProfile,
      status: license.status,
      hasFront: !!license.frontFileUrl,
      hasBack: !!license.backFileUrl,
    });

    return license;
  } catch (error) {
    console.error("[STORAGE] Failed to get user driver license:", error);
    throw new Error(`Error al obtener licencia del usuario: ${error.message}`);
  }
}

export async function updateDriverLicenseImages(licenseId, imageData) {
  try {
    if (!env.DB_ID || !env.COLLECTION_DRIVER_LICENSES_ID) {
      throw new Error("Base de datos no configurada correctamente");
    }

    const updates = {};

    // Manejar actualización de imagen frontal (incluso si es null para eliminación)
    if (imageData.frontImageUrl !== undefined) {
      updates.frontFileUrl = imageData.frontImageUrl;
    }

    // Manejar actualización de imagen trasera (incluso si es null para eliminación)
    if (imageData.backImageUrl !== undefined) {
      updates.backFileUrl = imageData.backImageUrl;
    }

    const record = await databases.updateDocument(
      env.DB_ID,
      env.COLLECTION_DRIVER_LICENSES_ID,
      licenseId,
      updates
    );

    console.log("[STORAGE] Driver license images updated:", licenseId);
    return record;
  } catch (error) {
    console.error("[STORAGE] Failed to update license images:", error);
    throw new Error(
      `Error al actualizar imágenes de licencia: ${error.message}`
    );
  }
}

export async function deleteLicenseImage(bucketId, fileId) {
  try {
    await storage.deleteFile(bucketId, fileId);
    console.log("[STORAGE] License image deleted:", fileId);
    return true;
  } catch (error) {
    console.error("[STORAGE] Delete license image failed:", error);
    throw new Error(`Error al eliminar imagen de licencia: ${error.message}`);
  }
}

// ==========================================
// GENERIC FILE OPERATIONS
// ==========================================

export function getLicenseImageUrl(bucketId, fileId) {
  try {
    const url = storage.getFileView(bucketId, fileId);
    return url.href || url.toString();
  } catch (error) {
    console.error("[STORAGE] Get license URL failed:", error);
    return null;
  }
}

export async function getFilePreview(
  bucketId,
  fileId,
  width = 400,
  height = 400
) {
  try {
    return storage.getFilePreview(bucketId, fileId, width, height);
  } catch (error) {
    console.error("[STORAGE] Get file preview failed:", error);
    return null;
  }
}
