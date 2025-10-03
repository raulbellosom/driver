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
    // For now, return simulated companies data
    // TODO: Replace with real Appwrite database call when collections are set up
    const simulatedCompanies = [
      {
        $id: "company_racoondevs",
        name: "RacoonDevs Transportation",
        rfc: "RDT123456789",
        address: "Av. Tecnológico 1234, Guadalajara, Jalisco",
        contactName: "Roberto Admin",
        contactEmail: "admin@racoondevs.com",
        contactPhone: "+523221234567",
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        $id: "company_transport_mx",
        name: "Transport MX",
        rfc: "TMX987654321",
        address: "Blvd. López Mateos 567, Zapopan, Jalisco",
        contactName: "María García",
        contactEmail: "maria@transportmx.com",
        contactPhone: "+523331234567",
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        $id: "company_logistica_del_oeste",
        name: "Logística del Oeste",
        rfc: "LDO456789123",
        address: "Calle Industria 890, Tlaquepaque, Jalisco",
        contactName: "José López",
        contactEmail: "jose@logisticadeloeste.com",
        contactPhone: "+523311234567",
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return simulatedCompanies;
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
