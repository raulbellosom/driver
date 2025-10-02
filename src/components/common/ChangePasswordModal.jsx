import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { account } from "../../lib/appwrite";
import { useNotifications } from "./NotificationSystem";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      return await account.updatePassword(newPassword, currentPassword);
    },
    onSuccess: () => {
      addNotification({
        type: "success",
        title: "Contraseña actualizada",
        message: "Tu contraseña ha sido cambiada exitosamente",
      });
      onClose();
      // Limpiar formulario
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    },
    onError: (error) => {
      console.error("Error changing password:", error);

      let message = "Error al cambiar la contraseña";

      if (error.type === "user_invalid_credentials") {
        message = "La contraseña actual es incorrecta";
      } else if (error.code === 400) {
        message =
          "La nueva contraseña no cumple con los requisitos de seguridad";
      }

      addNotification({
        type: "error",
        title: "Error al cambiar contraseña",
        message,
      });
    },
  });

  const validateForm = () => {
    const newErrors = {};

    // Validar contraseña actual
    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida";
    }

    // Validar nueva contraseña
    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "La contraseña debe incluir mayúsculas, minúsculas y números";
    }

    // Validar confirmación
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la nueva contraseña";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "La nueva contraseña debe ser diferente a la actual";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error específico al escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cambiar Contraseña
            </h2>
            <p className="text-sm text-gray-600">
              Actualiza tu contraseña para mantener tu cuenta segura
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña actual
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleChange("currentPassword", e.target.value)
                }
                error={errors.currentPassword}
                placeholder="Ingresa tu contraseña actual"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("current")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                error={errors.newPassword}
                placeholder="Ingresa tu nueva contraseña"
                icon={Shield}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                error={errors.confirmPassword}
                placeholder="Confirma tu nueva contraseña"
                icon={Shield}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de seguridad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">
                  Consejos de seguridad:
                </p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• Usa una combinación de letras, números y símbolos</li>
                  <li>• Evita usar información personal</li>
                  <li>• No reutilices contraseñas de otras cuentas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={changePasswordMutation.isPending}
              disabled={
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword
              }
            >
              Cambiar Contraseña
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
