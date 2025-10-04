export const env = {
  ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
  PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  DB_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,

  // Teams (DEPRECATED - Ya no se usan con el nuevo sistema de roles)
  // TEAM_ADMINS_ID: import.meta.env.VITE_APPWRITE_TEAM_ADMINS_ID,
  // TEAM_OPS_ID: import.meta.env.VITE_APPWRITE_TEAM_OPS_ID,
  // TEAM_DRIVERS_ID: import.meta.env.VITE_APPWRITE_TEAM_DRIVERS_ID,

  // Collections (T2, T5)
  COLLECTION_USERS_PROFILE_ID: import.meta.env
    .VITE_APPWRITE_COLLECTION_USERS_PROFILE_ID,
  COLLECTION_DRIVER_LICENSES_ID: import.meta.env
    .VITE_APPWRITE_COLLECTION_DRIVER_LICENSES_ID,
  COLLECTION_COMPANIES_ID: import.meta.env
    .VITE_APPWRITE_COLLECTION_COMPANIES_ID,
  COLLECTION_BRANDS_ID: import.meta.env.VITE_APPWRITE_COLLECTION_BRANDS_ID,
  COLLECTION_MODELS_ID: import.meta.env.VITE_APPWRITE_COLLECTION_MODELS_ID,

  // Storage Buckets (T4)
  BUCKET_AVATARS_ID: import.meta.env.VITE_APPWRITE_BUCKET_AVATARS_ID,
  BUCKET_DRIVER_LICENSES_ID: import.meta.env
    .VITE_APPWRITE_BUCKET_DRIVER_LICENSES_ID,
  BUCKET_VEHICLE_DOCS_ID: import.meta.env.VITE_APPWRITE_BUCKET_VEHICLE_DOCS_ID,
  BUCKET_VEHICLE_IMAGES_ID: import.meta.env
    .VITE_APPWRITE_BUCKET_VEHICLE_IMAGES_ID,
  BUCKET_REPORTS_ATTACHMENTS_ID: import.meta.env
    .VITE_APPWRITE_BUCKET_REPORTS_ATTACHMENTS_ID,
  BUCKET_POLICIES_ID: import.meta.env.VITE_APPWRITE_BUCKET_POLICIES_ID,
};

// Debug environment variables
console.log("[ENV DEBUG] Appwrite configuration:");
console.log("- ENDPOINT:", env.ENDPOINT);
console.log("- PROJECT_ID:", env.PROJECT_ID);
console.log("- DB_ID:", env.DB_ID);

// Solo validar variables críticas para el funcionamiento básico
const requiredVars = {
  ENDPOINT: env.ENDPOINT,
  PROJECT_ID: env.PROJECT_ID,
  DB_ID: env.DB_ID,
  COLLECTION_USERS_PROFILE_ID: env.COLLECTION_USERS_PROFILE_ID,
};

Object.entries(requiredVars).forEach(([k, v]) => {
  if (!v) console.warn(`[env] Missing required variable ${k}. Check your .env`);
});
