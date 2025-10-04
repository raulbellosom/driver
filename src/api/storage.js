import { storage, db, account } from "../lib/appwrite";
import { env } from "../lib/env";
import { ID, Permission, Role, Query } from "appwrite";

// ==========================================
// AVATAR & FILE UPLOAD MANAGEMENT (sin teams)
// ==========================================

export async function uploadAvatar(file, onProgress = null) {
  try {
    if (!file) throw new Error("No file provided");

    // Validaciones (15MB máximo para avatares - consistente con licencias)
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

    // PERMISOS SIMPLIFICADOS: Con AllUsers en Appwrite, solo necesitamos permisos básicos
    const permissions = [
      Permission.read(Role.any()), // Lectura pública
      Permission.update(Role.user(user.$id)), // El usuario puede actualizar
      Permission.delete(Role.user(user.$id)), // El usuario puede eliminar
    ];

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
    console.error("[STORAGE] Error generating URL:", error);
    return null;
  }
}

export function validateImageFile(file, maxSizeBytes = 5 * 1024 * 1024) {
  const errors = [];

  if (!file) {
    errors.push("No se seleccionó ningún archivo");
    return { isValid: false, errors };
  }

  // Validar tipo de archivo - Incluir formatos de iPhone y más tipos comunes
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic", // iPhone formato HEIC
    "image/heif", // iPhone formato HEIF
    "image/gif", // GIF estático
    "image/bmp", // Bitmap
    "image/tiff", // TIFF
    "image/svg+xml", // SVG
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push(
      "Tipo de archivo no válido. Se permiten: JPG, PNG, WebP, HEIC, HEIF, GIF, BMP, TIFF y SVG"
    );
  }

  // Validar tamaño
  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    const actualSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
    errors.push(
      `El archivo es muy grande (${actualSizeMB}MB). Máximo permitido: ${maxSizeMB}MB`
    );
  }

  // Validar que el archivo no esté corrupto
  if (file.size === 0) {
    errors.push("El archivo está vacío o corrupto");
  }

  // Validar nombre de archivo
  if (file.name.length > 255) {
    errors.push("El nombre del archivo es muy largo (máximo 255 caracteres)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: Math.round((file.size / (1024 * 1024)) * 100) / 100,
    },
  };
}

// ==========================================
// DRIVER LICENSE UPLOAD
// ==========================================

export async function uploadDriverLicense(
  file,
  licenseType = "front",
  onProgress = null
) {
  try {
    if (!file) throw new Error("No file provided");

    // Validaciones para licencias (15MB máximo para soportar imágenes de alta calidad)
    const validation = validateImageFile(file, 15 * 1024 * 1024);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const bucketId = env.BUCKET_DRIVER_LICENSES_ID;
    if (!bucketId) {
      throw new Error("Bucket de licencias no configurado");
    }

    console.log("[STORAGE] Uploading driver license to bucket:", bucketId);

    const user = await account.get();

    // PERMISOS SIMPLIFICADOS: Solo usar los que están configurados en el bucket
    const permissions = [
      Permission.read(Role.any()), // Lectura pública
      Permission.update(Role.user(user.$id)), // El usuario puede actualizar
      Permission.delete(Role.user(user.$id)), // El usuario puede eliminar
    ];

    // Crear nombre de archivo más descriptivo
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `license_${licenseType}_${user.$id}_${timestamp}.${fileExtension}`;

    const response = await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      permissions,
      onProgress
    );

    // Generar URL de vista
    const fileUrl = storage.getFileView(bucketId, response.$id);
    const cleanUrl = fileUrl.href || fileUrl.toString();

    console.log("[STORAGE] File upload response:", response);
    console.log("[STORAGE] Generated fileUrl object:", fileUrl);
    console.log("[STORAGE] Clean URL:", cleanUrl);

    // Construcción manual como backup si la URL automática falla
    const manualUrl = `${env.ENDPOINT}/storage/buckets/${bucketId}/files/${response.$id}/view?project=${env.PROJECT_ID}`;
    console.log("[STORAGE] Manual URL:", manualUrl);

    const finalUrl = cleanUrl || manualUrl;
    console.log("[STORAGE] Final URL to return:", finalUrl);

    console.log("[STORAGE] Driver license uploaded successfully");

    const returnData = {
      fileId: response.$id,
      bucketId: bucketId,
      fileUrl: finalUrl,
      licenseType,
      fileName: fileName,
      originalFileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };

    console.log("[STORAGE] Return data:", returnData);

    return returnData;
  } catch (error) {
    console.error("[STORAGE] Driver license upload failed:", error);
    throw new Error(`Error al subir licencia: ${error.message}`);
  }
}

// ==========================================
// GENERIC FILE OPERATIONS
// ==========================================

export async function uploadFile(
  file,
  bucketId,
  customFileName = null,
  onProgress = null
) {
  try {
    if (!file) throw new Error("No file provided");
    if (!bucketId) throw new Error("Bucket ID required");

    console.log("[STORAGE] Uploading file to bucket:", bucketId);

    const user = await account.get();

    // Permisos básicos
    const permissions = [
      Permission.read(Role.any()),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ];

    const fileId = customFileName || ID.unique();

    const response = await storage.createFile(
      bucketId,
      fileId,
      file,
      permissions,
      onProgress
    );

    // Generar URL
    const fileUrl = storage.getFileView(bucketId, response.$id);
    const cleanUrl = fileUrl.href || fileUrl.toString();

    return {
      fileId: response.$id,
      bucketId: bucketId,
      fileUrl: cleanUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[STORAGE] File upload failed:", error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
}

export async function deleteFile(bucketId, fileId) {
  try {
    await storage.deleteFile(bucketId, fileId);
    return { success: true };
  } catch (error) {
    console.error("[STORAGE] Delete failed:", error);
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
}

export function getFileUrl(bucketId, fileId) {
  try {
    const url = storage.getFileView(bucketId, fileId);
    return url.href || url.toString();
  } catch (error) {
    console.error("[STORAGE] Error generating file URL:", error);
    return null;
  }
}

export function getFilePreviewUrl(
  bucketId,
  fileId,
  width = 400,
  height = 400,
  quality = 80
) {
  try {
    const url = storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      "center",
      quality
    );
    return url.href || url.toString();
  } catch (error) {
    console.error("[STORAGE] Error generating preview URL:", error);
    return null;
  }
}

// ==========================================
// FILE LISTING & MANAGEMENT
// ==========================================

export async function listFiles(bucketId, queries = []) {
  try {
    const response = await storage.listFiles(bucketId, queries);
    return {
      files: response.files,
      total: response.total,
    };
  } catch (error) {
    console.error("[STORAGE] Error listing files:", error);
    throw new Error(`Error al listar archivos: ${error.message}`);
  }
}

export async function getFileInfo(bucketId, fileId) {
  try {
    const file = await storage.getFile(bucketId, fileId);
    return {
      ...file,
      url: getFileUrl(bucketId, fileId),
      previewUrl: getFilePreviewUrl(bucketId, fileId),
    };
  } catch (error) {
    console.error("[STORAGE] Error getting file info:", error);
    throw new Error(
      `Error al obtener información del archivo: ${error.message}`
    );
  }
}

// ==========================================
// UTILITIES
// ==========================================

/**
 * Formatea el tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado (ej: "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ==========================================
// DRIVER LICENSE DATABASE MANAGEMENT
// ==========================================

/**
 * Obtener la licencia de conducir de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Registro de la licencia o null si no existe
 */
export async function getUserDriverLicense(userId) {
  try {
    if (!userId) throw new Error("User ID requerido");

    console.log("[STORAGE] Getting driver license for user:", userId);

    const response = await db.listDocuments(
      env.DB_ID,
      env.COLLECTION_DRIVER_LICENSES_ID,
      [Query.equal("userId", userId)]
    );

    if (response.documents.length === 0) {
      console.log("[STORAGE] No driver license found for user");
      return null;
    }

    const license = response.documents[0];
    console.log("[STORAGE] Driver license found:", license);
    return license;
  } catch (error) {
    console.error("[STORAGE] Error getting driver license:", error);
    throw new Error(`Error al obtener licencia de conducir: ${error.message}`);
  }
}

/**
 * Crear un nuevo registro de licencia de conducir
 * @param {string} userId - ID del usuario
 * @param {Object} licenseData - Datos de la licencia
 * @returns {Promise<Object>} Registro creado
 */
export async function createDriverLicenseRecord(userId, licenseData) {
  try {
    if (!userId) throw new Error("User ID requerido");

    console.log("[STORAGE] Creating driver license record for user:", userId);
    console.log("[STORAGE] License data received:", licenseData);

    // Verificar que las variables de entorno estén configuradas
    if (!env.DB_ID) {
      throw new Error("DB_ID no configurado en variables de entorno");
    }
    if (!env.COLLECTION_USERS_PROFILE_ID) {
      throw new Error("COLLECTION_USERS_PROFILE_ID no configurado");
    }
    if (!env.COLLECTION_DRIVER_LICENSES_ID) {
      throw new Error("COLLECTION_DRIVER_LICENSES_ID no configurado");
    }

    console.log("[STORAGE] Environment check passed:", {
      dbId: env.DB_ID,
      profileCollection: env.COLLECTION_USERS_PROFILE_ID,
      licenseCollection: env.COLLECTION_DRIVER_LICENSES_ID,
    });

    // Obtener usuario actual para permisos
    const user = await account.get();
    console.log("[STORAGE] Current user:", { id: user.$id, email: user.email });

    const permissions = [
      Permission.read(Role.user(user.$id)), // Solo el usuario puede leer
      Permission.update(Role.user(user.$id)), // Solo el usuario puede actualizar
      Permission.delete(Role.user(user.$id)), // Solo el usuario puede eliminar
    ];

    console.log("[STORAGE] Permissions configured:", permissions);

    // Buscar el perfil del usuario para la relación usersProfile
    console.log("[STORAGE] Searching for user profile with userId:", userId);

    const profileResponse = await db.listDocuments(
      env.DB_ID,
      env.COLLECTION_USERS_PROFILE_ID,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    console.log("[STORAGE] Profile search response:", {
      documentsFound: profileResponse.documents.length,
      totalCount: profileResponse.total,
    });

    if (profileResponse.documents.length === 0) {
      console.error("[STORAGE] No user profile found for userId:", userId);
      throw new Error(
        `User profile not found for userId: ${userId}. El usuario debe tener un perfil antes de crear la licencia.`
      );
    }

    const userProfile = profileResponse.documents[0];
    console.log("[STORAGE] User profile found:", {
      profileId: userProfile.$id,
      displayName: userProfile.displayName,
    });

    const documentData = {
      userId,
      usersProfile: userProfile.$id, // Relación requerida según esquema
      status: "pending", // Estado inicial según esquema: [pending, approved, rejected]
      enabled: true, // Campo requerido
      ...licenseData,
    };

    console.log("[STORAGE] Final document data to create:", documentData);

    const document = await db.createDocument(
      env.DB_ID,
      env.COLLECTION_DRIVER_LICENSES_ID,
      ID.unique(),
      documentData,
      permissions
    );

    console.log("[STORAGE] Driver license record created successfully:", {
      documentId: document.$id,
      userId: document.userId,
      status: document.status,
      frontFileUrl: document.frontFileUrl,
      backFileUrl: document.backFileUrl,
    });

    return document;
  } catch (error) {
    console.error("[STORAGE] Error creating driver license record:", error);
    console.error("[STORAGE] Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });
    throw new Error(`Error al crear registro de licencia: ${error.message}`);
  }
}

/**
 * Actualizar las imágenes de una licencia de conducir existente
 * @param {string} licenseId - ID del registro de licencia
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Registro actualizado
 */
export async function updateDriverLicenseImages(licenseId, updateData) {
  try {
    if (!licenseId) throw new Error("License ID requerido");

    console.log("[STORAGE] ===== UPDATE DRIVER LICENSE DEBUG =====");
    console.log("[STORAGE] License ID:", licenseId);
    console.log("[STORAGE] Update data:", updateData);
    console.log("[STORAGE] Update data type:", typeof updateData);
    console.log("[STORAGE] Update data keys:", Object.keys(updateData || {}));
    console.log(
      "[STORAGE] Update data values:",
      Object.values(updateData || {})
    );
    console.log("[STORAGE] DB_ID:", env.DB_ID);
    console.log("[STORAGE] COLLECTION_ID:", env.COLLECTION_DRIVER_LICENSES_ID);

    // Validar que updateData no esté vacío
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("UpdateData está vacío o es null");
    }

    const document = await db.updateDocument(
      env.DB_ID,
      env.COLLECTION_DRIVER_LICENSES_ID,
      licenseId,
      updateData
    );

    console.log("[STORAGE] Driver license updated successfully:", document);
    console.log("[STORAGE] =========================================");
    return document;
  } catch (error) {
    console.error("[STORAGE] ===== ERROR UPDATING LICENSE =====");
    console.error("[STORAGE] Error message:", error.message);
    console.error("[STORAGE] Error type:", error.type);
    console.error("[STORAGE] Error code:", error.code);
    console.error("[STORAGE] License ID:", licenseId);
    console.error("[STORAGE] Update data:", updateData);
    console.error("[STORAGE] ===================================");
    throw new Error(`Error al actualizar licencia: ${error.message}`);
  }
}
