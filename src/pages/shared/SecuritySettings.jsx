import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, ArrowLeft, Key, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { account } from "../../lib/appwrite";
import { useNotifications } from "../../components/common/NotificationSystem";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const SecuritySettings = () => {
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

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("Al menos una mayúscula");
    if (!/[a-z]/.test(password)) errors.push("Al menos una minúscula");
    if (!/\d/.test(password)) errors.push("Al menos un número");
    return { isValid: errors.length === 0, errors };
  };

  // Mutación para cambiar contraseña
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
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    },
    onError: (error) => {
      console.error("Error changing password:", error);
      let errorMessage = "Error al cambiar la contraseña";

      if (error.code === 401) {
        errorMessage = "La contraseña actual es incorrecta";
      } else if (error.message?.includes("Password")) {
        errorMessage = "La nueva contraseña no cumple con los requisitos";
      }

      addNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.errors.join(", ");
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmar contraseña es requerido";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "La nueva contraseña debe ser diferente a la actual";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, text: "", color: "" },
      { score: 1, text: "Muy débil", color: "bg-red-500" },
      { score: 2, text: "Débil", color: "bg-orange-500" },
      { score: 3, text: "Regular", color: "bg-yellow-500" },
      { score: 4, text: "Fuerte", color: "bg-blue-500" },
      { score: 5, text: "Muy fuerte", color: "bg-green-500" },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Configuración de Seguridad
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona la seguridad de tu cuenta
            </p>
          </div>
        </div>
        <Link to="/profile">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al perfil
          </Button>
        </Link>
      </div>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Cambiar Contraseña</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange("currentPassword")}
                  error={errors.currentPassword}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange("newPassword")}
                  error={errors.newPassword}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Indicador de fuerza de contraseña */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Fuerza de la contraseña:
                    </span>
                    <span
                      className={`font-medium ${
                        passwordStrength.score <= 2
                          ? "text-red-500"
                          : passwordStrength.score <= 3
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  error={errors.confirmPassword}
                  placeholder="Confirma tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Requisitos de contraseña */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Requisitos de contraseña:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Mínimo 8 caracteres</li>
                    <li>• Al menos una letra mayúscula</li>
                    <li>• Al menos una letra minúscula</li>
                    <li>• Al menos un número</li>
                    <li>• Se recomienda usar símbolos especiales</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end space-x-4">
              <Link to="/profile">
                <Button
                  type="button"
                  variant="outline"
                  disabled={changePasswordMutation.isPending}
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="relative"
              >
                {changePasswordMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {changePasswordMutation.isPending
                  ? "Cambiando..."
                  : "Cambiar Contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
