import React, { useState, useEffect } from "react";
import { X, Save, Loader } from "lucide-react";
import { useFleetCatalogs } from "../../hooks/useVehicles";
import { vehicles } from "../../api/vehicles";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const isEditing = !!vehicle;
  const {
    brands,
    types,
    options,
    loading: catalogsLoading,
  } = useFleetCatalogs();

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar formulario
  useEffect(() => {
    if (vehicle) {
      setFormData({
        companyId: vehicle.company?.$id || "",
        plate: vehicle.plate || "",
        brandId: vehicle.brand?.$id || "",
        modelId: vehicle.model?.$id || "",
        typeId: vehicle.type?.$id || "",
        vin: vehicle.vin || "",
        year: vehicle.year || "",
        color: vehicle.color || "",
        acquisitionDate: vehicle.acquisitionDate
          ? vehicle.acquisitionDate.split("T")[0]
          : "",
        cost: vehicle.cost || "",
        mileage: vehicle.mileage || "",
        odometerUnit: vehicle.odometerUnit || "km",
        status: vehicle.status || "active",
        condition: vehicle.condition || "new",
      });
    }
  }, [vehicle]);

  // Actualizar modelos cuando cambie la marca
  useEffect(() => {
    if (formData.brandId && options.getModelsByBrand) {
      const models = options.getModelsByBrand(formData.brandId);
      setModelOptions(models);

      // Limpiar modelo seleccionado si no pertenece a la nueva marca
      if (
        formData.modelId &&
        !models.some((m) => m.value === formData.modelId)
      ) {
        setFormData((prev) => ({ ...prev, modelId: "" }));
      }
    } else {
      setModelOptions([]);
    }
  }, [formData.brandId, options.getModelsByBrand]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plate.trim()) {
      newErrors.plate = "La placa es obligatoria";
    }

    if (!formData.companyId) {
      newErrors.companyId = "Debe seleccionar una empresa";
    }

    if (formData.year && (formData.year < 1900 || formData.year > 2100)) {
      newErrors.year = "Año inválido";
    }

    if (formData.mileage && formData.mileage < 0) {
      newErrors.mileage = "El kilometraje no puede ser negativo";
    }

    if (formData.cost && formData.cost < 0) {
      newErrors.cost = "El costo no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = { ...formData };

      // Convertir campos numéricos
      if (submitData.year) submitData.year = parseInt(submitData.year);
      if (submitData.mileage) submitData.mileage = parseInt(submitData.mileage);
      if (submitData.cost) submitData.cost = parseFloat(submitData.cost);

      // Limpiar campos vacíos
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === null) {
          delete submitData[key];
        }
      });

      if (isEditing) {
        await vehicles.update(vehicle.$id, submitData);
      } else {
        await vehicles.create(submitData);
      }

      onSave?.();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "active", label: "Activo" },
    { value: "maintenance", label: "Mantenimiento" },
    { value: "inactive", label: "Inactivo" },
    { value: "sold", label: "Vendido" },
  ];

  const conditionOptions = [
    { value: "new", label: "Nuevo" },
    { value: "semi_new", label: "Semi-nuevo" },
    { value: "maintenance", label: "Mantenimiento" },
    { value: "repair", label: "Reparación" },
    { value: "for_sale", label: "En venta" },
    { value: "rented", label: "Rentado" },
  ];

  const odometerOptions = [
    { value: "km", label: "Kilómetros" },
    { value: "mi", label: "Millas" },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información básica */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Placa *"
              value={formData.plate}
              onChange={(e) => handleInputChange("plate", e.target.value)}
              error={errors.plate}
              placeholder="ABC-123"
            />

            <Input
              label="VIN"
              value={formData.vin}
              onChange={(e) => handleInputChange("vin", e.target.value)}
              error={errors.vin}
              placeholder="1HGCM82633A004352"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => handleInputChange("brandId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={catalogsLoading}
              >
                <option value="">Seleccionar marca</option>
                {options.brands.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={formData.modelId}
                onChange={(e) => handleInputChange("modelId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.brandId || catalogsLoading}
              >
                <option value="">Seleccionar modelo</option>
                {modelOptions.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.typeId}
                onChange={(e) => handleInputChange("typeId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={catalogsLoading}
              >
                <option value="">Seleccionar tipo</option>
                {options.types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Año"
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
              error={errors.year}
              placeholder="2023"
              min="1900"
              max="2100"
            />
          </div>
        </Card>

        {/* Detalles */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Color"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              placeholder="Blanco"
            />

            <Input
              label="Fecha de Adquisición"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) =>
                handleInputChange("acquisitionDate", e.target.value)
              }
            />

            <Input
              label="Costo"
              type="number"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", e.target.value)}
              error={errors.cost}
              placeholder="250000"
              min="0"
              step="0.01"
            />

            <div>
              <Input
                label="Kilometraje"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange("mileage", e.target.value)}
                error={errors.mileage}
                placeholder="15000"
                min="0"
              />
              <div className="mt-2">
                <select
                  value={formData.odometerUnit}
                  onChange={(e) =>
                    handleInputChange("odometerUnit", e.target.value)
                  }
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {odometerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Estado */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condición
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange("condition", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Error de envío */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
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
    </Modal>
  );
};

export default VehicleModal;
