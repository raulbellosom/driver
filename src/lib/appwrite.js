import { Client, Account, Databases, Teams, Storage, Query } from "appwrite";
import { env } from "./env";

// Debug Appwrite client configuration
console.log("[APPWRITE DEBUG] Initializing client with:");
console.log("- Endpoint:", env.ENDPOINT);
console.log("- Project ID:", env.PROJECT_ID);

if (!env.ENDPOINT || !env.PROJECT_ID) {
  console.error("[APPWRITE ERROR] Missing required configuration!");
  console.error("- ENDPOINT:", env.ENDPOINT);
  console.error("- PROJECT_ID:", env.PROJECT_ID);
  throw new Error("Appwrite configuration incomplete. Check your .env file.");
}

export const client = new Client()
  .setEndpoint(env.ENDPOINT)
  .setProject(env.PROJECT_ID);

export const account = new Account(client);
export const db = new Databases(client);
export const teams = new Teams(client);
export const storage = new Storage(client);

// Helper: get current session via JWT/cookies automatically handled by Web SDK
export async function getSessionUser() {
  try {
    const user = await account.get();
    return user; // { $id, name, email, ... }
  } catch (err) {
    return null; // not logged in
  }
}

export async function getMemberships() {
  try {
    const user = await account.get();
    console.log("[APPWRITE] Current user:", user);

    // Intentar obtener teams desde diferentes métodos de Appwrite
    let memberships = [];

    // Método 1: Verificar si hay información de teams en prefs o labels
    console.log("[APPWRITE] User prefs:", user.prefs);
    console.log("[APPWRITE] User labels:", user.labels);

    // Método 2: Probar acceso directo a cada team para determinar membership
    const teamsToCheck = [
      env.TEAM_ADMINS_ID && { id: env.TEAM_ADMINS_ID, name: "dp_admins" },
      env.TEAM_DRIVERS_ID && { id: env.TEAM_DRIVERS_ID, name: "dp_drivers" },
    ].filter(Boolean);

    for (const team of teamsToCheck) {
      try {
        // Intentar obtener info del team - si funciona, el usuario es miembro
        const teamInfo = await teams.get(team.id);
        console.log(
          `[APPWRITE] User IS member of ${team.name}:`,
          teamInfo.name
        );
        memberships.push({ teamId: team.id, teamName: team.name });
      } catch (teamError) {
        // Solo loggear errores que no sean 404 (no encontrado/sin acceso)
        if (teamError.code !== 404) {
          console.warn(
            `[APPWRITE] Error checking ${team.name}:`,
            teamError.message
          );
        }
      }
    }

    // Si no encontramos memberships, hacer fallback temporal (solo para desarrollo)
    if (memberships.length === 0) {
      console.log(
        "[APPWRITE] No teams detected, using fallback - assigning as driver"
      );
      memberships.push({ teamId: env.TEAM_DRIVERS_ID, teamName: "dp_drivers" });
    }

    console.log("[APPWRITE] Final detected memberships:", memberships);
    return memberships;
  } catch (error) {
    console.error("[APPWRITE] Error getting memberships:", error);
    return [];
  }
}
