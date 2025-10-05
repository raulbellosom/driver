import React, { useState, useEffect } from "react";
import { X, Save, Loader, Gauge, AlertTriangle } from "lucide-react";
import { vehicleOdometers } from "../../api/fleet-management";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";

const OdometerModal = ({
  vehicleId,
  vehicle,
  lastReading,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    value: "",
    source: "manual",
    at: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar errores y advertencias
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (warnings[field]) {
      setWarnings((prev) => ({ ...prev, [field]: null }));
    }

    // Validaciones en tiempo real para el valor
    if (field === "value") {
      const numValue = parseInt(value);
      const newWarnings = { ...warnings };

      if (lastReading && numValue <= lastReading.value) {
        newWarnings.value = `El valor debe ser mayor a la última lectura: ${lastReading.value.toLocaleString()}`;
      } else if (lastReading && numValue > lastReading.value + 10000) {
        newWarnings.value = `El incremento parece muy alto (+${(
          numValue - lastReading.value
        ).toLocaleString()} ${vehicle?.odometerUnit || "km"})`;
      } else {
        delete newWarnings.value;
      }

      setWarnings(newWarnings);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.value) {
      newErrors.value = "La lectura del odómetro es obligatoria";
    } else {
      const numValue = parseInt(formData.value);

      if (isNaN(numValue) || numValue < 0) {
        newErrors.value = "Debe ser un número válido mayor o igual a 0";
      } else if (lastReading && numValue < lastReading.value) {
        newErrors.value = `El valor no puede ser menor a la última lectura (${lastReading.value.toLocaleString()})`;
      }
    }

    if (!formData.at) {
      newErrors.at = "La fecha es obligatoria";
    }

    if (!formData.time) {
      newErrors.time = "La hora es obligatoria";
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
        vehicleId,
        value: parseInt(formData.value),
        source: formData.source,
        at: `${formData.at}T${formData.time}:00.000Z`,
        note: formData.note.trim(),
      };

      await vehicleOdometers.create(submitData);
      onSave?.();
    } catch (error) {
      console.error("Error saving odometer reading:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = [
    {
      value: "manual",
      label: "Manual",
      description: "Lectura tomada manualmente",
      icon: "✋",
    },
    {
      value: "trip",
      label: "Viaje",
      description: "Lectura al final de un viaje",
      icon: "🚗",
    },
    {
      value: "service",
      label: "Servicio",
      description: "Lectura durante servicio o mantenimiento",
      icon: "🔧",
    },
  ];

  const calculateIncrement = () => {
    if (!formData.value || !lastReading) return null;
    const numValue = parseInt(formData.value);
    if (isNaN(numValue)) return null;
    return numValue - lastReading.value;
  };

  const increment = calculateIncrement();

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Gauge className="w-6 h-6 text-blue-600" />
          Nueva Lectura de Odómetro
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Vehicle Info */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{vehicle?.plate}</h3>
              <p className="text-sm text-gray-500">
                {vehicle?.brand?.name} {vehicle?.model?.name}
                {vehicle?.year && ` (${vehicle.year})`}
              </p>
            </div>
            {lastReading && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Última lectura</p>
                <p className="text-lg font-bold text-gray-900">
                  {lastReading.value.toLocaleString()}{" "}
                  {vehicle?.odometerUnit || "km"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(lastReading.at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Reading Value */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Lectura del Odómetro
          </h3>

          <div className="space-y-4">
            <div>
              <Input
                label={`Valor * (${vehicle?.odometerUnit || "km"})`}
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                error={errors.value}
                placeholder={
                  lastReading
                    ? `Mayor a ${lastReading.value.toLocaleString()}`
                    : "0"
                }
                min="0"
                step="1"
              />

              {warnings.value && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-700">{warnings.value}</p>
                  </div>
                </div>
              )}

              {increment !== null && increment > 0 && !warnings.value && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Incremento: +{increment.toLocaleString()}{" "}
                    {vehicle?.odometerUnit || "km"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuente de la Lectura
              </label>
              <div className="space-y-2">
                {sourceOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.source === option.value}
                      onChange={(e) =>
                        handleInputChange("source", e.target.value)
                      }
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Date and Time */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Fecha y Hora
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha *"
              type="date"
              value={formData.at}
              onChange={(e) => handleInputChange("at", e.target.value)}
              error={errors.at}
              max={new Date().toISOString().split("T")[0]}
            />

            <Input
              label="Hora *"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              error={errors.time}
            />
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Notas (Opcional)
          </h3>

          <textarea
            value={formData.note}
            onChange={(e) => handleInputChange("note", e.target.value)}
            placeholder="Agrega cualquier observación sobre esta lectura..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">Máximo 200 caracteres</p>
            <p className="text-xs text-gray-500">{formData.note.length}/200</p>
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
            disabled={loading || Object.keys(warnings).length > 0}
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
                Registrar Lectura
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OdometerModal;
