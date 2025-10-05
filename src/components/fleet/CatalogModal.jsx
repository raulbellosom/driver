import React, { useState, useEffect } from "react";
import { X, Save, Loader, Tag, Package, Car } from "lucide-react";
import { vehicleBrands, vehicleTypes, vehicleModels } from "../../api/vehicles";
import { useVehicleBrands } from "../../hooks/useVehicles";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";

const CatalogModal = ({ type, item, onClose, onSave }) => {
  const isEditing = !!item;
  const { brands } = useVehicleBrands({ autoLoad: type === "models" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    year: "",
    brandId: "",
    typeId: "",
    enabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar formulario
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        year: item.year || "",
        brandId: item.brand?.$id || "",
        typeId: item.type?.$id || "",
        enabled: item.enabled !== undefined ? item.enabled : true,
      });
    }
  }, [item]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (type === "models") {
      if (formData.year && (formData.year < 1900 || formData.year > 2100)) {
        newErrors.year = "Año inválido";
      }
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

      const submitData = {
        name: formData.name.trim(),
        enabled: formData.enabled,
      };

      // Campos específicos por tipo
      if (type === "types" && formData.description) {
        submitData.description = formData.description.trim();
      }

      if (type === "models") {
        if (formData.brandId) submitData.brandId = formData.brandId;
        if (formData.typeId) submitData.typeId = formData.typeId;
        if (formData.year) submitData.year = parseInt(formData.year);
      }

      // Llamar API correspondiente
      let apiCall;
      switch (type) {
        case "brands":
          apiCall = isEditing
            ? vehicleBrands.update(item.$id, submitData)
            : vehicleBrands.create(submitData);
          break;
        case "types":
          apiCall = isEditing
            ? vehicleTypes.update(item.$id, submitData)
            : vehicleTypes.create(submitData);
          break;
        case "models":
          apiCall = isEditing
            ? vehicleModels.update(item.$id, submitData)
            : vehicleModels.create(submitData);
          break;
        default:
          throw new Error("Tipo de catálogo no válido");
      }

      await apiCall;
      onSave?.();
    } catch (error) {
      console.error("Error saving catalog item:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getConfig = () => {
    switch (type) {
      case "brands":
        return {
          title: isEditing ? "Editar Marca" : "Nueva Marca",
          icon: Tag,
          color: "blue",
        };
      case "types":
        return {
          title: isEditing ? "Editar Tipo" : "Nuevo Tipo",
          icon: Package,
          color: "green",
        };
      case "models":
        return {
          title: isEditing ? "Editar Modelo" : "Nuevo Modelo",
          icon: Car,
          color: "purple",
        };
      default:
        return {
          title: "Editar Item",
          icon: Package,
          color: "gray",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Icon className={`w-6 h-6 text-${config.color}-600`} />
          {config.title}
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información básica */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información{" "}
            {type === "brands"
              ? "de la Marca"
              : type === "types"
              ? "del Tipo"
              : "del Modelo"}
          </h3>

          <div className="space-y-4">
            <Input
              label="Nombre *"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              placeholder={
                type === "brands"
                  ? "Ej: Toyota, Ford, Chevrolet"
                  : type === "types"
                  ? "Ej: Sedán, SUV, Camión"
                  : "Ej: Corolla, F-150, Silverado"
              }
            />

            {type === "types" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descripción del tipo de vehículo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  maxLength={200}
                />
              </div>
            )}

            {type === "models" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) =>
                      handleInputChange("brandId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map((brand) => (
                      <option key={brand.$id} value={brand.$id}>
                        {brand.name}
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
              </>
            )}
          </div>
        </Card>

        {/* Estado */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado</h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => handleInputChange("enabled", e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="enabled"
              className="text-sm font-medium text-gray-700"
            >
              Habilitado
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {type === "brands"
              ? "Las marcas deshabilitadas no aparecerán en la selección de nuevos vehículos"
              : type === "types"
              ? "Los tipos deshabilitados no aparecerán en la selección de nuevos vehículos"
              : "Los modelos deshabilitados no aparecerán en la selección de nuevos vehículos"}
          </p>
        </Card>

        {/* Vista previa */}
        <Card
          className={`p-4 bg-gradient-to-r from-${config.color}-50 to-${config.color}-100 border-${config.color}-200`}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Vista Previa
          </h3>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 bg-${config.color}-600 rounded-lg`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {formData.name || "Nombre del elemento"}
                </div>
                {type === "types" && formData.description && (
                  <div className="text-sm text-gray-500">
                    {formData.description}
                  </div>
                )}
                {type === "models" && (
                  <div className="text-sm text-gray-500">
                    {formData.brandId
                      ? brands.find((b) => b.$id === formData.brandId)?.name
                      : "Sin marca"}
                    {formData.year && ` (${formData.year})`}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                formData.enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {formData.enabled ? "Activo" : "Inactivo"}
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
                {isEditing ? "Actualizar" : "Crear"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CatalogModal;
