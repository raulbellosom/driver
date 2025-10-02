import { db } from "../lib/appwrite";
import { env } from "../lib/env";

// Función para crear endpoints CRUD básicos siguiendo el patrón del Sprint 1
export async function fetchHealth() {
  try {
    // Simple health check
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: env.DB_ID,
    };
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
}

// Companies CRUD (Task T5 - Esqueleto DB)
export async function fetchCompanies() {
  try {
    const response = await db.listDocuments(
      env.DB_ID,
      "companies", // Este ID se actualizará cuando se cree la colección
      []
    );
    return response.documents;
  } catch (error) {
    throw new Error(`Error fetching companies: ${error.message}`);
  }
}

export async function createCompany(data) {
  try {
    const response = await db.createDocument({
      databaseId: env.DB_ID,
      collectionId: "companies",
      documentId: "unique()",
      data: {
        ...data,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return response;
  } catch (error) {
    throw new Error(`Error creating company: ${error.message}`);
  }
}

// Vehicle Brands CRUD (Task T5)
export async function fetchVehicleBrands() {
  try {
    const response = await db.listDocuments(
      env.DB_ID,
      env.COLLECTION_BRANDS_ID || "vehicle_brands",
      []
    );
    return response.documents;
  } catch (error) {
    throw new Error(`Error fetching brands: ${error.message}`);
  }
}

export async function createVehicleBrand(data) {
  try {
    const response = await db.createDocument({
      databaseId: env.DB_ID,
      collectionId: env.COLLECTION_BRANDS_ID || "vehicle_brands",
      documentId: "unique()",
      data: {
        ...data,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return response;
  } catch (error) {
    throw new Error(`Error creating brand: ${error.message}`);
  }
}

// Vehicle Models CRUD (Task T5)
export async function fetchVehicleModels(brandId = null) {
  try {
    const queries = [];
    if (brandId) {
      queries.push(`brandId=${brandId}`);
    }

    const response = await db.listDocuments(
      env.DB_ID,
      env.COLLECTION_MODELS_ID || "vehicle_models",
      queries
    );
    return response.documents;
  } catch (error) {
    throw new Error(`Error fetching models: ${error.message}`);
  }
}

export async function createVehicleModel(data) {
  try {
    const response = await db.createDocument({
      databaseId: env.DB_ID,
      collectionId: env.COLLECTION_MODELS_ID || "vehicle_models",
      documentId: "unique()",
      data: {
        ...data,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return response;
  } catch (error) {
    throw new Error(`Error creating model: ${error.message}`);
  }
}
