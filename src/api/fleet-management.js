import { db } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query } from "appwrite";

// ===============================
// VEHICLE ODOMETER MANAGEMENT
// ===============================

export const vehicleOdometers = {
  /**
   * Obtiene todas las lecturas de odómetro de un vehículo
   */
  async getByVehicle(vehicleId, options = {}) {
    try {
      const { limit = 50, offset = 0, source = null } = options;

      const queries = [
        Query.equal("vehicle", vehicleId),
        Query.orderDesc("at"),
        Query.limit(limit),
        Query.offset(offset),
      ];

      if (source) {
        queries.push(Query.equal("source", source));
      }

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLE_ODOMETERS_ID,
        queries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching vehicle odometers:", error);
      throw new Error(`Failed to fetch vehicle odometers: ${error.message}`);
    }
  },

  /**
   * Obtiene la última lectura de odómetro de un vehículo
   */
  async getLatestByVehicle(vehicleId) {
    try {
      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLE_ODOMETERS_ID,
        [
          Query.equal("vehicle", vehicleId),
          Query.orderDesc("at"),
          Query.limit(1),
        ]
      );

      const latestReading = response.documents[0] || null;

      return {
        success: true,
        data: latestReading,
      };
    } catch (error) {
      console.error("Error fetching latest odometer:", error);
      throw new Error(`Failed to fetch latest odometer: ${error.message}`);
    }
  },

  /**
   * Registra una nueva lectura de odómetro
   */
  async create(odometerData) {
    try {
      // Validar que el nuevo valor sea mayor al anterior (opcional)
      if (odometerData.validateProgressive) {
        const latest = await this.getLatestByVehicle(odometerData.vehicleId);
        if (latest.data && odometerData.value <= latest.data.value) {
          throw new Error(
            "Odometer value must be greater than previous reading"
          );
        }
      }

      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_VEHICLE_ODOMETERS_ID,
        "unique()",
        {
          vehicle: odometerData.vehicleId,
          value: odometerData.value,
          source: odometerData.source || "manual",
          at: odometerData.at || new Date().toISOString(),
          note: odometerData.note || "",
        }
      );

      // Actualizar el kilometraje del vehículo también
      if (odometerData.updateVehicle !== false) {
        await db.updateDocument(
          env.DB_ID,
          env.COLLECTION_VEHICLES_ID,
          odometerData.vehicleId,
          {
            mileage: odometerData.value,
          }
        );
      }

      return {
        success: true,
        data: response,
        message: "Odometer reading recorded successfully",
      };
    } catch (error) {
      console.error("Error creating odometer reading:", error);
      throw new Error(`Failed to record odometer reading: ${error.message}`);
    }
  },

  /**
   * Obtiene estadísticas de uso del vehículo
   */
  async getVehicleStats(vehicleId, options = {}) {
    try {
      const { days = 30 } = options;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_VEHICLE_ODOMETERS_ID,
        [
          Query.equal("vehicle", vehicleId),
          Query.greaterThanEqual("at", fromDate.toISOString()),
          Query.orderAsc("at"),
        ]
      );

      const readings = response.documents;

      if (readings.length < 2) {
        return {
          success: true,
          data: {
            totalDistance: 0,
            averageDaily: 0,
            readingsCount: readings.length,
            period: days,
          },
        };
      }

      const firstReading = readings[0];
      const lastReading = readings[readings.length - 1];
      const totalDistance = lastReading.value - firstReading.value;
      const averageDaily = totalDistance / days;

      return {
        success: true,
        data: {
          totalDistance,
          averageDaily: Math.round(averageDaily * 100) / 100,
          readingsCount: readings.length,
          period: days,
          firstReading: firstReading.value,
          lastReading: lastReading.value,
        },
      };
    } catch (error) {
      console.error("Error getting vehicle stats:", error);
      throw new Error(`Failed to get vehicle statistics: ${error.message}`);
    }
  },
};

// ===============================
// RECHARGE CARDS MANAGEMENT
// ===============================

export const rechargeCards = {
  /**
   * Obtiene todas las tarjetas de recarga
   */
  async getAll(options = {}) {
    try {
      const {
        queries = [],
        includeDisabled = false,
        companyId = null,
        status = null,
        provider = null,
      } = options;

      const baseQueries = includeDisabled ? [] : [Query.equal("enabled", true)];

      if (companyId) baseQueries.push(Query.equal("company", companyId));
      if (status) baseQueries.push(Query.equal("status", status));
      if (provider) baseQueries.push(Query.equal("provider", provider));

      const allQueries = [
        ...baseQueries,
        Query.orderDesc("$createdAt"),
        ...queries,
      ];

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_RECHARGE_CARDS_ID,
        allQueries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching recharge cards:", error);
      throw new Error(`Failed to fetch recharge cards: ${error.message}`);
    }
  },

  async getById(cardId) {
    try {
      const response = await db.getDocument(
        env.DB_ID,
        env.COLLECTION_RECHARGE_CARDS_ID,
        cardId
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching recharge card:", error);
      throw new Error(`Failed to fetch recharge card: ${error.message}`);
    }
  },

  async create(cardData) {
    try {
      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_RECHARGE_CARDS_ID,
        "unique()",
        {
          company: cardData.companyId,
          code: cardData.code,
          provider: cardData.provider || "other",
          status: cardData.status || "active",
          allowNegative: cardData.allowNegative ?? false,
          enabled: cardData.enabled ?? true,
        }
      );

      return {
        success: true,
        data: response,
        message: "Recharge card created successfully",
      };
    } catch (error) {
      console.error("Error creating recharge card:", error);
      throw new Error(`Failed to create recharge card: ${error.message}`);
    }
  },

  async update(cardId, cardData) {
    try {
      const updateData = {};

      const updatableFields = [
        "companyId",
        "code",
        "provider",
        "status",
        "allowNegative",
        "enabled",
      ];

      updatableFields.forEach((field) => {
        if (cardData[field] !== undefined) {
          const dbField = field === "companyId" ? "company" : field;
          updateData[dbField] = cardData[field];
        }
      });

      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_RECHARGE_CARDS_ID,
        cardId,
        updateData
      );

      return {
        success: true,
        data: response,
        message: "Recharge card updated successfully",
      };
    } catch (error) {
      console.error("Error updating recharge card:", error);
      throw new Error(`Failed to update recharge card: ${error.message}`);
    }
  },

  async delete(cardId) {
    try {
      const response = await db.updateDocument(
        env.DB_ID,
        env.COLLECTION_RECHARGE_CARDS_ID,
        cardId,
        { enabled: false, status: "blocked" }
      );

      return {
        success: true,
        data: response,
        message: "Recharge card disabled successfully",
      };
    } catch (error) {
      console.error("Error disabling recharge card:", error);
      throw new Error(`Failed to disable recharge card: ${error.message}`);
    }
  },

  /**
   * Obtiene tarjetas por compañía
   */
  async getByCompany(companyId, options = {}) {
    return this.getAll({ ...options, companyId });
  },

  /**
   * Obtiene tarjetas activas disponibles
   */
  async getAvailable(companyId = null) {
    const options = {
      status: "active",
    };

    if (companyId) options.companyId = companyId;

    return this.getAll(options);
  },

  /**
   * Busca tarjeta por código
   */
  async getByCode(code) {
    try {
      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_RECHARGE_CARDS_ID,
        [
          Query.equal("code", code),
          Query.equal("enabled", true),
          Query.limit(1),
        ]
      );

      const card = response.documents[0] || null;

      return {
        success: true,
        data: card,
      };
    } catch (error) {
      console.error("Error finding card by code:", error);
      throw new Error(`Failed to find card by code: ${error.message}`);
    }
  },
};

// ===============================
// RECHARGE MOVEMENTS MANAGEMENT
// ===============================

export const rechargeMovements = {
  /**
   * Obtiene movimientos de una tarjeta
   */
  async getByCard(cardId, options = {}) {
    try {
      const { limit = 50, offset = 0, type = null } = options;

      const queries = [
        Query.equal("card", cardId),
        Query.orderDesc("at"),
        Query.limit(limit),
        Query.offset(offset),
      ];

      if (type) {
        queries.push(Query.equal("type", type));
      }

      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_RECHARGE_MOVEMENTS_ID,
        queries
      );

      return {
        success: true,
        data: response.documents,
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching recharge movements:", error);
      throw new Error(`Failed to fetch recharge movements: ${error.message}`);
    }
  },

  /**
   * Crea un nuevo movimiento de recarga
   */
  async create(movementData) {
    try {
      const docData = {
        card: movementData.cardId,
        type: movementData.type,
        amount: movementData.amount,
        currency: movementData.currency || "MXN",
        at: movementData.at || new Date().toISOString(),
        note: movementData.note || "",
        enabled: true,
      };

      if (movementData.tripId) docData.trip = movementData.tripId;
      if (movementData.byUserId) docData.byUser = movementData.byUserId;
      if (movementData.files)
        docData.files = JSON.stringify(movementData.files);

      const response = await db.createDocument(
        env.DB_ID,
        env.COLLECTION_RECHARGE_MOVEMENTS_ID,
        "unique()",
        docData
      );

      return {
        success: true,
        data: response,
        message: "Recharge movement created successfully",
      };
    } catch (error) {
      console.error("Error creating recharge movement:", error);
      throw new Error(`Failed to create recharge movement: ${error.message}`);
    }
  },

  /**
   * Obtiene el balance actual de una tarjeta
   */
  async getCardBalance(cardId) {
    try {
      const response = await db.listDocuments(
        env.DB_ID,
        env.COLLECTION_RECHARGE_MOVEMENTS_ID,
        [
          Query.equal("card", cardId),
          Query.equal("enabled", true),
          Query.orderAsc("at"),
        ]
      );

      const movements = response.documents;
      let balance = 0;

      movements.forEach((movement) => {
        switch (movement.type) {
          case "topup":
          case "adjust":
            balance += movement.amount;
            break;
          case "spend":
            balance -= movement.amount;
            break;
        }
      });

      return {
        success: true,
        data: {
          balance: Math.round(balance * 100) / 100,
          currency: movements[0]?.currency || "MXN",
          lastMovement: movements[movements.length - 1] || null,
          totalMovements: movements.length,
        },
      };
    } catch (error) {
      console.error("Error calculating card balance:", error);
      throw new Error(`Failed to calculate card balance: ${error.message}`);
    }
  },

  /**
   * Realiza una recarga a la tarjeta
   */
  async topupCard(cardId, amount, options = {}) {
    const { note = "", byUserId = null, files = [] } = options;

    return this.create({
      cardId,
      type: "topup",
      amount,
      note,
      byUserId,
      files,
    });
  },

  /**
   * Registra un gasto de la tarjeta
   */
  async spendCard(cardId, amount, options = {}) {
    const { note = "", tripId = null, byUserId = null } = options;

    return this.create({
      cardId,
      type: "spend",
      amount,
      note,
      tripId,
      byUserId,
    });
  },
};
