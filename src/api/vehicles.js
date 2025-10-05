import { db } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query } from "appwrite";

// ===============================
// VEHICLE BRANDS MANAGEMENT
// ===============================

export const vehicleBrands = {
  /**
   * Obtiene todas las marcas de vehículos activas
   * @param {Object} options - Opciones de consulta
   * @param {string[]} options.queries - Queries adicionales de Appwrite
   * @param {boolean} options.includeDisabled - Incluir marcas deshabilitadas
   */
  async getAll(options = {}) {
    try {
      const { queries = [], includeDisabled = false } = options;

      const baseQueries = includeDisabled ? [] : [Query.equal("enabled", true)];

      const allQueries = [...baseQueries, Query.orderAsc("name"), ...queries];

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLE_BRANDS_ID,
        allQueries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching vehicle brands:", error);
      throw new Error(`Failed to fetch vehicle brands: ${error.message}`);
    }
  },

  /**
   * Obtiene una marca específica por ID
   */
  async getById(brandId) {
    try {
      const response = await db.getDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_BRANDS_ID,
        brandId
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching vehicle brand:", error);
      throw new Error(`Failed to fetch vehicle brand: ${error.message}`);
    }
  },

  /**
   * Crea una nueva marca de vehículo
   */
  async create(brandData) {
    try {
      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_BRANDS_ID,
        "unique()",
        {
          name: brandData.name,
          enabled: brandData.enabled ?? true,
        }
      );

      return {
        success: true,
        data: response,
        message: "Vehicle brand created successfully",
      };
    } catch (error) {
      console.error("Error creating vehicle brand:", error);
      throw new Error(`Failed to create vehicle brand: ${error.message}`);
    }
  },

  /**
   * Actualiza una marca existente
   */
  async update(brandId, brandData) {
    try {
      const updateData = {};

      if (brandData.name !== undefined) updateData.name = brandData.name;
      if (brandData.enabled !== undefined)
        updateData.enabled = brandData.enabled;

      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_BRANDS_ID,
        brandId,
        updateData
      );

      return {
        success: true,
        data: response,
        message: "Vehicle brand updated successfully",
      };
    } catch (error) {
      console.error("Error updating vehicle brand:", error);
      throw new Error(`Failed to update vehicle brand: ${error.message}`);
    }
  },

  /**
   * Elimina (deshabilita) una marca
   */
  async delete(brandId) {
    try {
      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_BRANDS_ID,
        brandId,
        { enabled: false }
      );

      return {
        success: true,
        data: response,
        message: "Vehicle brand disabled successfully",
      };
    } catch (error) {
      console.error("Error disabling vehicle brand:", error);
      throw new Error(`Failed to disable vehicle brand: ${error.message}`);
    }
  },
};

// ===============================
// VEHICLE TYPES MANAGEMENT
// ===============================

export const vehicleTypes = {
  async getAll(options = {}) {
    try {
      const { queries = [], includeDisabled = false } = options;

      const baseQueries = includeDisabled ? [] : [Query.equal("enabled", true)];

      const allQueries = [...baseQueries, Query.orderAsc("name"), ...queries];

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLE_TYPES_ID,
        allQueries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      throw new Error(`Failed to fetch vehicle types: ${error.message}`);
    }
  },

  async getById(typeId) {
    try {
      const response = await db.getDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_TYPES_ID,
        typeId
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching vehicle type:", error);
      throw new Error(`Failed to fetch vehicle type: ${error.message}`);
    }
  },

  async create(typeData) {
    try {
      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_TYPES_ID,
        "unique()",
        {
          name: typeData.name,
          description: typeData.description || "",
          enabled: typeData.enabled ?? true,
        }
      );

      return {
        success: true,
        data: response,
        message: "Vehicle type created successfully",
      };
    } catch (error) {
      console.error("Error creating vehicle type:", error);
      throw new Error(`Failed to create vehicle type: ${error.message}`);
    }
  },

  async update(typeId, typeData) {
    try {
      const updateData = {};

      if (typeData.name !== undefined) updateData.name = typeData.name;
      if (typeData.description !== undefined)
        updateData.description = typeData.description;
      if (typeData.enabled !== undefined) updateData.enabled = typeData.enabled;

      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_TYPES_ID,
        typeId,
        updateData
      );

      return {
        success: true,
        data: response,
        message: "Vehicle type updated successfully",
      };
    } catch (error) {
      console.error("Error updating vehicle type:", error);
      throw new Error(`Failed to update vehicle type: ${error.message}`);
    }
  },

  async delete(typeId) {
    try {
      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_TYPES_ID,
        typeId,
        { enabled: false }
      );

      return {
        success: true,
        data: response,
        message: "Vehicle type disabled successfully",
      };
    } catch (error) {
      console.error("Error disabling vehicle type:", error);
      throw new Error(`Failed to disable vehicle type: ${error.message}`);
    }
  },
};

// ===============================
// VEHICLE MODELS MANAGEMENT
// ===============================

export const vehicleModels = {
  async getAll(options = {}) {
    try {
      const { queries = [], includeDisabled = false, brandId = null } = options;

      const baseQueries = includeDisabled ? [] : [Query.equal("enabled", true)];

      if (brandId) {
        baseQueries.push(Query.equal("brand", brandId));
      }

      const allQueries = [...baseQueries, Query.orderAsc("name"), ...queries];

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLE_MODELS_ID,
        allQueries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      throw new Error(`Failed to fetch vehicle models: ${error.message}`);
    }
  },

  async getById(modelId) {
    try {
      const response = await db.getDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_MODELS_ID,
        modelId
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching vehicle model:", error);
      throw new Error(`Failed to fetch vehicle model: ${error.message}`);
    }
  },

  async create(modelData) {
    try {
      const docData = {
        name: modelData.name,
        enabled: modelData.enabled ?? true,
      };

      if (modelData.brandId) docData.brand = modelData.brandId;
      if (modelData.typeId) docData.type = modelData.typeId;
      if (modelData.year) docData.year = modelData.year;

      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_MODELS_ID,
        "unique()",
        docData
      );

      return {
        success: true,
        data: response,
        message: "Vehicle model created successfully",
      };
    } catch (error) {
      console.error("Error creating vehicle model:", error);
      throw new Error(`Failed to create vehicle model: ${error.message}`);
    }
  },

  async update(modelId, modelData) {
    try {
      const updateData = {};

      if (modelData.name !== undefined) updateData.name = modelData.name;
      if (modelData.brandId !== undefined) updateData.brand = modelData.brandId;
      if (modelData.typeId !== undefined) updateData.type = modelData.typeId;
      if (modelData.year !== undefined) updateData.year = modelData.year;
      if (modelData.enabled !== undefined)
        updateData.enabled = modelData.enabled;

      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_MODELS_ID,
        modelId,
        updateData
      );

      return {
        success: true,
        data: response,
        message: "Vehicle model updated successfully",
      };
    } catch (error) {
      console.error("Error updating vehicle model:", error);
      throw new Error(`Failed to update vehicle model: ${error.message}`);
    }
  },

  async delete(modelId) {
    try {
      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_MODELS_ID,
        modelId,
        { enabled: false }
      );

      return {
        success: true,
        data: response,
        message: "Vehicle model disabled successfully",
      };
    } catch (error) {
      console.error("Error disabling vehicle model:", error);
      throw new Error(`Failed to disable vehicle model: ${error.message}`);
    }
  },

  /**
   * Obtiene modelos por marca
   */
  async getByBrand(brandId) {
    return this.getAll({ brandId });
  },
};

// ===============================
// VEHICLES MAIN MANAGEMENT
// ===============================

export const vehicles = {
  /**
   * Obtiene todos los vehículos con filtros opcionales
   */
  async getAll(options = {}) {
    try {
      const {
        queries = [],
        includeDisabled = false,
        companyId = null,
        status = null,
        condition = null,
      } = options;

      const baseQueries = includeDisabled ? [] : [Query.equal("enabled", true)];

      if (companyId) baseQueries.push(Query.equal("company", companyId));
      if (status) baseQueries.push(Query.equal("status", status));
      if (condition) baseQueries.push(Query.equal("condition", condition));

      const allQueries = [
        ...baseQueries,
        Query.orderDesc("$createdAt"),
        ...queries,
      ];

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLES_ID,
        allQueries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }
  },

  async getById(vehicleId) {
    try {
      const response = await db.getDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLES_ID,
        vehicleId
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      throw new Error(`Failed to fetch vehicle: ${error.message}`);
    }
  },

  async create(vehicleData) {
    try {
      const docData = {
        company: vehicleData.companyId,
        plate: vehicleData.plate,
        odometerUnit: vehicleData.odometerUnit || "km",
        status: vehicleData.status || "active",
        condition: vehicleData.condition || "new",
        enabled: vehicleData.enabled ?? true,
      };

      // Campos opcionales
      if (vehicleData.brandId) docData.brand = vehicleData.brandId;
      if (vehicleData.modelId) docData.model = vehicleData.modelId;
      if (vehicleData.typeId) docData.type = vehicleData.typeId;
      if (vehicleData.vin) docData.vin = vehicleData.vin;
      if (vehicleData.year) docData.year = vehicleData.year;
      if (vehicleData.color) docData.color = vehicleData.color;
      if (vehicleData.acquisitionDate)
        docData.acquisitionDate = vehicleData.acquisitionDate;
      if (vehicleData.cost) docData.cost = vehicleData.cost;
      if (vehicleData.mileage) docData.mileage = vehicleData.mileage;

      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLES_ID,
        "unique()",
        docData
      );

      return {
        success: true,
        data: response,
        message: "Vehicle created successfully",
      };
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }
  },

  async update(vehicleId, vehicleData) {
    try {
      const updateData = {};

      // Solo incluir campos que están definidos
      const updatableFields = [
        "companyId",
        "brandId",
        "modelId",
        "typeId",
        "plate",
        "vin",
        "year",
        "color",
        "acquisitionDate",
        "cost",
        "mileage",
        "odometerUnit",
        "status",
        "condition",
        "enabled",
      ];

      updatableFields.forEach((field) => {
        if (vehicleData[field] !== undefined) {
          // Mapear campos de ID a nombres de relación
          const fieldMap = {
            companyId: "company",
            brandId: "brand",
            modelId: "model",
            typeId: "type",
          };

          const dbField = fieldMap[field] || field;
          updateData[dbField] = vehicleData[field];
        }
      });

      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLES_ID,
        vehicleId,
        updateData
      );

      return {
        success: true,
        data: response,
        message: "Vehicle updated successfully",
      };
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw new Error(`Failed to update vehicle: ${error.message}`);
    }
  },

  async delete(vehicleId) {
    try {
      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLES_ID,
        vehicleId,
        { enabled: false }
      );

      return {
        success: true,
        data: response,
        message: "Vehicle disabled successfully",
      };
    } catch (error) {
      console.error("Error disabling vehicle:", error);
      throw new Error(`Failed to disable vehicle: ${error.message}`);
    }
  },

  /**
   * Obtiene vehículos por compañía
   */
  async getByCompany(companyId, options = {}) {
    return this.getAll({ ...options, companyId });
  },

  /**
   * Obtiene vehículos activos disponibles
   */
  async getAvailable(companyId = null) {
    const options = {
      status: "active",
      condition: "new",
    };

    if (companyId) options.companyId = companyId;

    return this.getAll(options);
  },
};
