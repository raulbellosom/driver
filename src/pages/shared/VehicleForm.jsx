import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Car,
  Plus,
  Edit3,
  Save,
  Loader,
  Factory,
  Tag,
  Settings,
  Calendar,
  Palette,
  DollarSign,
  Gauge,
  Building,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useFleetCatalogs } from "../../hooks/useVehicles";
import { vehicles } from "../../api/vehicles";
import { fetchCompanies } from "../../api/crud";
import { useNotifications } from "../../components/common/NotificationSystem";
import { useQuery } from "@tanstack/react-query";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import SearchableSelect from "../../components/common/SearchableSelect";
import CreateBrandModal from "../../components/common/CreateBrandModal";
import CreateTypeModal from "../../components/common/CreateTypeModal";
import CreateModelModal from "../../components/common/CreateModelModal";
import { vehicleBrands, vehicleTypes, vehicleModels } from "../../api/vehicles";

const VehicleForm = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const isEditing = !!vehicleId;

  const {
    brands,
    types,
    options,
    loading: catalogsLoading,
  } = useFleetCatalogs();

  // Query para empresas
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  // Estados del formulario
  const [formData, setFormData] = useState({
    companyId: "",
    plate: "",
    brandId: "",
    modelId: "",
    typeId: "",
    vin: "",
    year: "",
    color: "",
    acquisitionDate: "",
    cost: "",
    mileage: "",
    odometerUnit: "km",
    status: "active",
    condition: "new",
  });

  const [modelOptions, setModelOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState({
    brand: false,
    type: false,
    model: false,
  });

  const [modals, setModals] = useState({
    brand: false,
    type: false,
    model: false,
  });

  const [modalValues, setModalValues] = useState({
    brand: "",
    type: "",
    model: "",
  });

  const closeModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    setModalValues((prev) => ({ ...prev, [type]: "" }));
  }; // Cargar datos del vehículo si estamos editando
  useEffect(() => {
    if (isEditing && vehicleId) {
      loadVehicle(vehicleId);
    }
  }, [vehicleId]);

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (formData.brandId && options.models) {
      const filteredModels = options.models.filter(
        (model) => model.brand === formData.brandId
      );
      setModelOptions(filteredModels);

      // Limpiar modelo si no está disponible para la nueva marca
      if (
        formData.modelId &&
        !filteredModels.some((m) => m.$id === formData.modelId)
      ) {
        setFormData((prev) => ({ ...prev, modelId: "" }));
      }
    }
  }, [formData.brandId, options.models]);

  const loadVehicle = async (id) => {
    try {
      const response = await vehicles.getById(id);
      const vehicle = response.data;

      setFormData({
        companyId: vehicle.company?.$id || "",
        plate: vehicle.plate || "",
        brandId: vehicle.brand?.$id || "",
        modelId: vehicle.model?.$id || "",
        typeId: vehicle.type?.$id || "",
        vin: vehicle.vin || "",
        year: vehicle.year || "",
        color: vehicle.color || "",
        acquisitionDate: vehicle.acquisitionDate || "",
        cost: vehicle.cost || "",
        mileage: vehicle.mileage || "",
        odometerUnit: vehicle.odometerUnit || "km",
        status: vehicle.status || "active",
        condition: vehicle.condition || "new",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: `Error al cargar vehículo: ${error.message}`,
      });
      navigate("/admin/fleet");
    }
  };

  // Mutación para guardar
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await vehicles.update(vehicleId, data);
      } else {
        return await vehicles.create(data);
      }
    },
    onSuccess: () => {
      addNotification({
        type: "success",
        message: `Vehículo ${
          isEditing ? "actualizado" : "creado"
        } exitosamente`,
      });
      queryClient.invalidateQueries(["vehicles"]);
      navigate("/admin/fleet");
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message:
          error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} vehículo`,
      });
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plate.trim()) {
      newErrors.plate = "La placa es obligatoria";
    }

    if (!formData.companyId) {
      newErrors.companyId = "Debe seleccionar una empresa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Funciones para abrir modales de creación
  const handleCreateBrand = (name) => {
    setModalValues((prev) => ({ ...prev, brand: name }));
    setModals((prev) => ({ ...prev, brand: true }));
  };

  const handleSubmitBrand = async (brandData) => {
    setCreating((prev) => ({ ...prev, brand: true }));
    try {
      const response = await vehicleBrands.create(brandData);
      queryClient.invalidateQueries(["fleetCatalogs"]);

      addNotification({
        type: "success",
        message: `Marca "${brandData.name}" creada exitosamente`,
      });

      // Auto-seleccionar la nueva marca
      setFormData((prev) => ({ ...prev, brandId: response.$id }));
      setModals((prev) => ({ ...prev, brand: false }));
    } catch (error) {
      addNotification({
        type: "error",
        message: `Error al crear marca: ${error.message}`,
      });
      throw error;
    } finally {
      setCreating((prev) => ({ ...prev, brand: false }));
    }
  };

  const handleCreateType = (name) => {
    setModalValues((prev) => ({ ...prev, type: name }));
    setModals((prev) => ({ ...prev, type: true }));
  };

  const handleSubmitType = async (typeData) => {
    setCreating((prev) => ({ ...prev, type: true }));
    try {
      const response = await vehicleTypes.create(typeData);
      queryClient.invalidateQueries(["fleetCatalogs"]);

      addNotification({
        type: "success",
        message: `Tipo "${typeData.name}" creado exitosamente`,
      });

      // Auto-seleccionar el nuevo tipo
      setFormData((prev) => ({ ...prev, typeId: response.$id }));
      setModals((prev) => ({ ...prev, type: false }));
    } catch (error) {
      addNotification({
        type: "error",
        message: `Error al crear tipo: ${error.message}`,
      });
      throw error;
    } finally {
      setCreating((prev) => ({ ...prev, type: false }));
    }
  };

  const handleCreateModel = (name) => {
    if (!formData.brandId) {
      addNotification({
        type: "error",
        message: "Debe seleccionar una marca antes de crear un modelo",
      });
      return;
    }
    setModalValues((prev) => ({ ...prev, model: name }));
    setModals((prev) => ({ ...prev, model: true }));
  };

  const handleSubmitModel = async (modelData) => {
    setCreating((prev) => ({ ...prev, model: true }));
    try {
      const response = await vehicleModels.create({
        ...modelData,
        brandId: formData.brandId,
        typeId: formData.typeId, // Opcional
      });
      queryClient.invalidateQueries(["fleetCatalogs"]);

      addNotification({
        type: "success",
        message: `Modelo "${modelData.name}" creado exitosamente`,
      });

      // Auto-seleccionar el nuevo modelo
      setFormData((prev) => ({ ...prev, modelId: response.$id }));
      setModals((prev) => ({ ...prev, model: false }));
    } catch (error) {
      addNotification({
        type: "error",
        message: `Error al crear modelo: ${error.message}`,
      });
      throw error;
    } finally {
      setCreating((prev) => ({ ...prev, model: false }));
    }
  };

  const statusOptions = [
    { value: "active", label: "Activo" },
    { value: "maintenance", label: "En Mantenimiento" },
    { value: "inactive", label: "Inactivo" },
  ];

  const conditionOptions = [
    { value: "new", label: "Nuevo" },
    { value: "used", label: "Usado" },
    { value: "refurbished", label: "Reacondicionado" },
  ];

  const odometerOptions = [
    { value: "km", label: "Kilómetros" },
    { value: "mi", label: "Millas" },
  ];

  // Formatear opciones para SearchableSelect
  const brandOptions =
    brands?.map((brand) => ({
      value: brand.$id,
      label: brand.name,
    })) || [];

  const typeOptions =
    types?.map((type) => ({
      value: type.$id,
      label: type.name,
    })) || [];

  const modelOptionsFormatted =
    modelOptions?.map((model) => ({
      value: model.$id,
      label: `${model.name}${model.year ? ` (${model.year})` : ""}`,
    })) || [];

  const companyOptions =
    companies?.map((company) => ({
      value: company.$id,
      label: company.name,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/fleet")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing
                  ? "Modifica la información del vehículo"
                  : "Completa la información para registrar un nuevo vehículo"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Información Básica
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Datos principales del vehículo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Placa del Vehículo"
                    leftIcon={<Tag />}
                    value={formData.plate}
                    onChange={(e) => handleChange("plate", e.target.value)}
                    placeholder="ABC-1234"
                    required
                    error={errors.plate}
                    size="default"
                  />

                  <SearchableSelect
                    label="Empresa"
                    value={formData.companyId}
                    onChange={(value) => handleChange("companyId", value)}
                    options={companyOptions}
                    placeholder="Buscar empresa..."
                    leftIcon={<Building className="w-4 h-4" />}
                    required={true}
                    error={errors.companyId}
                  />
                </div>
              </div>

              {/* Especificaciones */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Factory className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Especificaciones
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Marca, modelo y características técnicas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Marca */}
                  <SearchableSelect
                    label="Marca"
                    value={formData.brandId}
                    onChange={(value) => handleChange("brandId", value)}
                    options={brandOptions}
                    placeholder="Buscar marca o crear nueva..."
                    leftIcon={<Factory className="w-4 h-4" />}
                    onCreateNew={handleCreateBrand}
                    createLabel="Crear marca"
                    useModal={true}
                    loading={creating.brand}
                  />

                  {/* Tipo */}
                  <SearchableSelect
                    label="Tipo de Vehículo"
                    value={formData.typeId}
                    onChange={(value) => handleChange("typeId", value)}
                    options={typeOptions}
                    placeholder="Buscar tipo o crear nuevo..."
                    leftIcon={<Settings className="w-4 h-4" />}
                    onCreateNew={handleCreateType}
                    createLabel="Crear tipo"
                    useModal={true}
                    loading={creating.type}
                  />

                  {/* Modelo */}
                  <SearchableSelect
                    label="Modelo"
                    value={formData.modelId}
                    onChange={(value) => handleChange("modelId", value)}
                    options={modelOptionsFormatted}
                    placeholder={
                      formData.brandId
                        ? "Buscar modelo o crear nuevo..."
                        : "Primero selecciona una marca"
                    }
                    leftIcon={<Car className="w-4 h-4" />}
                    onCreateNew={formData.brandId ? handleCreateModel : null}
                    createLabel="Crear modelo"
                    useModal={true}
                    loading={creating.model}
                    disabled={!formData.brandId}
                  />

                  {/* Año */}
                  <Input
                    label="Año"
                    leftIcon={<Calendar />}
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    size="default"
                  />
                </div>
              </div>

              {/* Detalles Adicionales */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detalles Adicionales
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Información complementaria y estado del vehículo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="VIN"
                    leftIcon={<Tag />}
                    value={formData.vin}
                    onChange={(e) => handleChange("vin", e.target.value)}
                    placeholder="17 caracteres"
                    maxLength={17}
                    size="default"
                  />

                  <Input
                    label="Color"
                    leftIcon={<Palette />}
                    value={formData.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    placeholder="Rojo, Azul, etc."
                    size="default"
                  />

                  <Input
                    label="Fecha de Adquisición"
                    leftIcon={<Calendar />}
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) =>
                      handleChange("acquisitionDate", e.target.value)
                    }
                    size="default"
                  />

                  <Input
                    label="Costo"
                    leftIcon={<DollarSign />}
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    size="default"
                  />

                  <Input
                    label="Kilometraje"
                    leftIcon={<Gauge />}
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange("mileage", e.target.value)}
                    placeholder="0"
                    size="default"
                  />

                  <Select
                    label="Unidad de Odómetro"
                    leftIcon={<Gauge className="w-4 h-4" />}
                    value={formData.odometerUnit}
                    onChange={(e) =>
                      handleChange("odometerUnit", e.target.value)
                    }
                    size="default"
                  >
                    {odometerOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Estado"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    size="default"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Condición"
                    leftIcon={<Settings className="w-4 h-4" />}
                    value={formData.condition}
                    onChange={(e) => handleChange("condition", e.target.value)}
                    size="default"
                  >
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Error de envío */}
              {saveMutation.error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error al {isEditing ? "actualizar" : "crear"} vehículo
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {saveMutation.error.message}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/fleet")}
                  disabled={saveMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="min-w-[120px] flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditing ? "Actualizar" : "Crear"} Vehículo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Modales de creación - Fuera del contenedor principal para evitar superposición */}
      <CreateBrandModal
        isOpen={modals.brand}
        onClose={() => closeModal("brand")}
        onSubmit={handleSubmitBrand}
        loading={creating.brand}
        initialValue={modalValues.brand}
      />

      <CreateTypeModal
        isOpen={modals.type}
        onClose={() => closeModal("type")}
        onSubmit={handleSubmitType}
        loading={creating.type}
        initialValue={modalValues.type}
      />

      <CreateModelModal
        isOpen={modals.model}
        onClose={() => closeModal("model")}
        onSubmit={handleSubmitModel}
        loading={creating.model}
        brandName={brands?.find((b) => b.$id === formData.brandId)?.name}
        initialValue={modalValues.model}
      />
    </div>
  );
};

export default VehicleForm;
