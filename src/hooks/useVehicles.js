import { useState, useEffect, useCallback, useMemo } from "react";
import {
  vehicleBrands,
  vehicleTypes,
  vehicleModels,
  vehicles,
} from "../api/vehicles";

// ===============================
// VEHICLE BRANDS HOOK
// ===============================

export function useVehicleBrands(options = {}) {
  const { autoLoad = true, includeDisabled = false } = options;

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicleBrands.getAll({ includeDisabled });
      setBrands(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [includeDisabled]);

  const createBrand = useCallback(async (brandData) => {
    try {
      setLoading(true);
      const result = await vehicleBrands.create(brandData);
      setBrands((prev) => [result.data, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (brandId, brandData) => {
    try {
      setLoading(true);
      const result = await vehicleBrands.update(brandId, brandData);
      setBrands((prev) =>
        prev.map((brand) => (brand.$id === brandId ? result.data : brand))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBrand = useCallback(async (brandId) => {
    try {
      setLoading(true);
      await vehicleBrands.delete(brandId);
      setBrands((prev) => prev.filter((brand) => brand.$id !== brandId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadBrands();
    }
  }, [autoLoad, loadBrands]);

  return {
    brands,
    loading,
    error,
    actions: {
      refresh: loadBrands,
      create: createBrand,
      update: updateBrand,
      delete: deleteBrand,
    },
  };
}

// ===============================
// VEHICLE TYPES HOOK
// ===============================

export function useVehicleTypes(options = {}) {
  const { autoLoad = true, includeDisabled = false } = options;

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicleTypes.getAll({ includeDisabled });
      setTypes(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [includeDisabled]);

  const createType = useCallback(async (typeData) => {
    try {
      setLoading(true);
      const result = await vehicleTypes.create(typeData);
      setTypes((prev) => [result.data, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateType = useCallback(async (typeId, typeData) => {
    try {
      setLoading(true);
      const result = await vehicleTypes.update(typeId, typeData);
      setTypes((prev) =>
        prev.map((type) => (type.$id === typeId ? result.data : type))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteType = useCallback(async (typeId) => {
    try {
      setLoading(true);
      await vehicleTypes.delete(typeId);
      setTypes((prev) => prev.filter((type) => type.$id !== typeId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadTypes();
    }
  }, [autoLoad, loadTypes]);

  return {
    types,
    loading,
    error,
    actions: {
      refresh: loadTypes,
      create: createType,
      update: updateType,
      delete: deleteType,
    },
  };
}

// ===============================
// VEHICLE MODELS HOOK
// ===============================

export function useVehicleModels(options = {}) {
  const { autoLoad = true, includeDisabled = false, brandId = null } = options;

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicleModels.getAll({ includeDisabled, brandId });
      setModels(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [includeDisabled, brandId]);

  const createModel = useCallback(async (modelData) => {
    try {
      setLoading(true);
      const result = await vehicleModels.create(modelData);
      setModels((prev) => [result.data, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModel = useCallback(async (modelId, modelData) => {
    try {
      setLoading(true);
      const result = await vehicleModels.update(modelId, modelData);
      setModels((prev) =>
        prev.map((model) => (model.$id === modelId ? result.data : model))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteModel = useCallback(async (modelId) => {
    try {
      setLoading(true);
      await vehicleModels.delete(modelId);
      setModels((prev) => prev.filter((model) => model.$id !== modelId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadModels();
    }
  }, [autoLoad, loadModels]);

  return {
    models,
    loading,
    error,
    actions: {
      refresh: loadModels,
      create: createModel,
      update: updateModel,
      delete: deleteModel,
    },
  };
}

// ===============================
// VEHICLES MAIN HOOK
// ===============================

export function useVehicles(options = {}) {
  const {
    autoLoad = true,
    includeDisabled = false,
    companyId = null,
    status = null,
    condition = null,
  } = options;

  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicles.getAll({
        includeDisabled,
        companyId,
        status,
        condition,
      });
      setVehiclesList(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [includeDisabled, companyId, status, condition]);

  const createVehicle = useCallback(async (vehicleData) => {
    try {
      setLoading(true);
      const result = await vehicles.create(vehicleData);
      setVehiclesList((prev) => [result.data, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (vehicleId, vehicleData) => {
    try {
      setLoading(true);
      const result = await vehicles.update(vehicleId, vehicleData);
      setVehiclesList((prev) =>
        prev.map((vehicle) =>
          vehicle.$id === vehicleId ? result.data : vehicle
        )
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      await vehicles.delete(vehicleId);
      setVehiclesList((prev) =>
        prev.filter((vehicle) => vehicle.$id !== vehicleId)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadVehicles();
    }
  }, [autoLoad, loadVehicles]);

  // Memoized computed values
  const stats = useMemo(() => {
    const total = vehiclesList.length;
    const active = vehiclesList.filter((v) => v.status === "active").length;
    const maintenance = vehiclesList.filter(
      (v) => v.status === "maintenance"
    ).length;
    const inactive = vehiclesList.filter((v) => v.status === "inactive").length;

    return {
      total,
      active,
      maintenance,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [vehiclesList]);

  return {
    vehicles: vehiclesList,
    loading,
    error,
    stats,
    actions: {
      refresh: loadVehicles,
      create: createVehicle,
      update: updateVehicle,
      delete: deleteVehicle,
    },
  };
}

// ===============================
// COMBINED FLEET HOOK (Para formularios)
// ===============================

export function useFleetCatalogs() {
  const { brands, loading: brandsLoading } = useVehicleBrands();
  const { types, loading: typesLoading } = useVehicleTypes();
  const { models, loading: modelsLoading } = useVehicleModels();

  const loading = brandsLoading || typesLoading || modelsLoading;

  // Memoized options para selects
  const brandOptions = useMemo(
    () =>
      brands.map((brand) => ({
        value: brand.$id,
        label: brand.name,
      })),
    [brands]
  );

  const typeOptions = useMemo(
    () =>
      types.map((type) => ({
        value: type.$id,
        label: type.name,
      })),
    [types]
  );

  const getModelsByBrand = useCallback(
    (brandId) => {
      return models
        .filter((model) => model.brand === brandId)
        .map((model) => ({
          value: model.$id,
          label: `${model.name}${model.year ? ` (${model.year})` : ""}`,
        }));
    },
    [models]
  );

  return {
    brands,
    types,
    models,
    loading,
    options: {
      brands: brandOptions,
      types: typeOptions,
      getModelsByBrand,
    },
  };
}
