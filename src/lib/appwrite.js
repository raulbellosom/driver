import { Client, Account, Databases, Storage, Query } from "appwrite";
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

// Configurar cliente con mejor manejo de sesión para evitar errores 401
export const client = new Client()
  .setEndpoint(env.ENDPOINT)
  .setProject(env.PROJECT_ID);

export const account = new Account(client);
export const db = new Databases(client);
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
