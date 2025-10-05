import React, { useState, useEffect } from "react";
import { X, Save, Loader, CreditCard } from "lucide-react";
import { rechargeCards } from "../../api/fleet-management";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";

const RechargeCardModal = ({ card, onClose, onSave }) => {
  const isEditing = !!card;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    companyId: user?.companies?.$id || "",
    code: "",
    provider: "other",
    status: "active",
    allowNegative: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar formulario
  useEffect(() => {
    if (card) {
      setFormData({
        companyId: card.company?.$id || user?.companies?.$id || "",
        code: card.code || "",
        provider: card.provider || "other",
        status: card.status || "active",
        allowNegative: card.allowNegative || false,
      });
    }
  }, [card, user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "El código de la tarjeta es obligatorio";
    } else if (formData.code.length < 3) {
      newErrors.code = "El código debe tener al menos 3 caracteres";
    }

    if (!formData.companyId) {
      newErrors.companyId = "Debe seleccionar una empresa";
    }

    if (!formData.provider) {
      newErrors.provider = "Debe seleccionar un proveedor";
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

      if (isEditing) {
        await rechargeCards.update(card.$id, formData);
      } else {
        await rechargeCards.create(formData);
      }

      onSave?.();
    } catch (error) {
      console.error("Error saving recharge card:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const providerOptions = [
    {
      value: "parkia",
      label: "Parkia",
      description: "Sistema de peaje y estacionamiento",
    },
    {
      value: "rfid",
      label: "RFID",
      description: "Tarjetas de identificación por radiofrecuencia",
    },
    {
      value: "other",
      label: "Otro",
      description: "Otro proveedor de servicios",
    },
  ];

  const statusOptions = [
    {
      value: "active",
      label: "Activa",
      description: "La tarjeta está disponible para uso",
    },
    {
      value: "blocked",
      label: "Bloqueada",
      description: "La tarjeta está temporalmente bloqueada",
    },
    {
      value: "lost",
      label: "Perdida",
      description: "La tarjeta se ha reportado como perdida",
    },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          {isEditing ? "Editar Tarjeta de Recarga" : "Nueva Tarjeta de Recarga"}
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información básica */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información de la Tarjeta
          </h3>

          <div className="space-y-4">
            <Input
              label="Código de la Tarjeta *"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              error={errors.code}
              placeholder="Ej: PKA-001, RFID-123456"
              className="font-mono"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <div className="space-y-2">
                {providerOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.provider === option.value}
                      onChange={(e) =>
                        handleInputChange("provider", e.target.value)
                      }
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.provider && (
                <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Configuración */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Configuración
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de la Tarjeta
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
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

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowNegative}
                  onChange={(e) =>
                    handleInputChange("allowNegative", e.target.checked)
                  }
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Permitir saldo negativo
                  </div>
                  <div className="text-sm text-gray-500">
                    La tarjeta puede tener un saldo negativo y realizar
                    transacciones
                  </div>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Vista previa */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Vista Previa
          </h3>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white font-mono text-sm">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 font-mono">
                  {formData.code || "CÓDIGO-TARJETA"}
                </div>
                <div className="text-sm text-gray-500">
                  {
                    providerOptions.find((p) => p.value === formData.provider)
                      ?.label
                  }
                </div>
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                formData.status === "active"
                  ? "bg-green-100 text-green-800"
                  : formData.status === "blocked"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {statusOptions.find((s) => s.value === formData.status)?.label}
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
                {isEditing ? "Actualizar" : "Crear"} Tarjeta
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RechargeCardModal;
