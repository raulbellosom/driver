import { account } from "../lib/appwrite";

// ==========================================
// PASSWORD MANAGEMENT
// ==========================================

export async function changePassword(oldPassword, newPassword) {
  try {
    if (!oldPassword || !newPassword) {
      throw new Error("Se requieren ambas contraseñas");
    }

    if (newPassword.length < 8) {
      throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
    }

    // Validar que la nueva contraseña sea diferente
    if (oldPassword === newPassword) {
      throw new Error("La nueva contraseña debe ser diferente a la actual");
    }

    // Cambiar la contraseña en Appwrite
    await account.updatePassword(newPassword, oldPassword);

    console.log("[SECURITY] Password changed successfully");
    return { success: true, message: "Contraseña actualizada correctamente" };
  } catch (error) {
    console.error("[SECURITY] Password change failed:", error);

    // Mapear errores comunes de Appwrite
    let errorMessage = "Error al cambiar contraseña";

    if (
      error.message.includes("Invalid credentials") ||
      error.message.includes("password")
    ) {
      errorMessage = "Contraseña actual incorrecta";
    } else if (error.message.includes("Password policy")) {
      errorMessage = "La nueva contraseña no cumple con los requisitos";
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push("La contraseña es requerida");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("Debe tener al menos 8 caracteres");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula");
  }

  if (!/\d/.test(password)) {
    errors.push("Debe contener al menos un número");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================

export async function getCurrentSessions() {
  try {
    const sessions = await account.listSessions();

    console.log("[SECURITY] Retrieved sessions:", sessions.total);

    // Mapear sesiones con información útil
    return sessions.sessions.map((session) => ({
      id: session.$id,
      userId: session.userId,
      provider: session.provider,
      providerUid: session.providerUid,
      current: session.current,
      countryCode: session.countryCode,
      countryName: session.countryName,
      ip: session.ip,
      osCode: session.osCode,
      osName: session.osName,
      osVersion: session.osVersion,
      clientType: session.clientType,
      clientCode: session.clientCode,
      clientName: session.clientName,
      clientVersion: session.clientVersion,
      clientEngine: session.clientEngine,
      clientEngineVersion: session.clientEngineVersion,
      deviceName: session.deviceName,
      deviceBrand: session.deviceBrand,
      deviceModel: session.deviceModel,
      createdAt: session.$createdAt,
      updatedAt: session.$updatedAt,
      expire: session.expire,
    }));
  } catch (error) {
    console.error("[SECURITY] Failed to get sessions:", error);
    throw new Error(`Error al obtener sesiones: ${error.message}`);
  }
}

export async function deleteSession(sessionId) {
  try {
    if (!sessionId) {
      throw new Error("ID de sesión requerido");
    }

    await account.deleteSession(sessionId);

    console.log("[SECURITY] Session deleted:", sessionId);
    return { success: true, message: "Sesión eliminada correctamente" };
  } catch (error) {
    console.error("[SECURITY] Failed to delete session:", error);

    let errorMessage = "Error al eliminar sesión";
    if (error.message.includes("not found")) {
      errorMessage = "Sesión no encontrada";
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export async function deleteAllSessions() {
  try {
    await account.deleteSessions();

    console.log("[SECURITY] All sessions deleted");
    return {
      success: true,
      message: "Todas las sesiones eliminadas correctamente",
    };
  } catch (error) {
    console.error("[SECURITY] Failed to delete all sessions:", error);
    throw new Error(`Error al eliminar todas las sesiones: ${error.message}`);
  }
}

// ==========================================
// SECURITY UTILITIES
// ==========================================

export function formatSessionInfo(session) {
  const deviceInfo = [];

  if (session.deviceName) {
    deviceInfo.push(session.deviceName);
  } else {
    if (session.osName) deviceInfo.push(session.osName);
    if (session.clientName) deviceInfo.push(session.clientName);
  }

  return {
    ...session,
    displayName: deviceInfo.join(" - ") || "Dispositivo desconocido",
    isCurrentSession: session.current,
    location: session.countryName
      ? `${session.countryName} (${session.ip})`
      : session.ip,
    createdDate: new Date(session.createdAt).toLocaleString(),
    lastActive: new Date(session.updatedAt).toLocaleString(),
    expiresAt: session.expire
      ? new Date(session.expire).toLocaleString()
      : "Nunca",
  };
}

export function getSecurityRecommendations(sessions) {
  const recommendations = [];

  // Verificar sesiones múltiples
  if (sessions.length > 3) {
    recommendations.push({
      type: "warning",
      title: "Múltiples sesiones activas",
      message: `Tienes ${sessions.length} sesiones activas. Considera cerrar las que no uses.`,
    });
  }

  // Verificar sesiones antiguas (más de 30 días)
  const oldSessions = sessions.filter((session) => {
    const daysSinceCreated =
      (Date.now() - new Date(session.createdAt)) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 30;
  });

  if (oldSessions.length > 0) {
    recommendations.push({
      type: "info",
      title: "Sesiones antiguas detectadas",
      message: `Hay ${oldSessions.length} sesiones de más de 30 días. Considera cerrarlas por seguridad.`,
    });
  }

  // Verificar diferentes ubicaciones
  const locations = new Set(sessions.map((s) => s.countryCode).filter(Boolean));
  if (locations.size > 2) {
    recommendations.push({
      type: "warning",
      title: "Sesiones desde múltiples países",
      message:
        "Se detectaron sesiones desde diferentes países. Verifica que todas sean tuyas.",
    });
  }

  return recommendations;
}
