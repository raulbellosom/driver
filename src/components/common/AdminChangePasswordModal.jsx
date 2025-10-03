import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import usersService from "../../api/users";
import { useNotifications } from "./NotificationSystem";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { Lock, Eye, EyeOff, Key } from "lucide-react";

export default function AdminChangePasswordModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}) {
  const { addNotification } = useNotifications();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: () => usersService.changeUserPassword(userId, password),
    onSuccess: () => {
      addNotification({
        type: "success",
        message: "Contraseña actualizada correctamente",
      });

      // Limpiar campos
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      onSuccess?.();
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: error.message || "Error al cambiar contraseña",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!password || password.length < 8) {
      addNotification({
        type: "error",
        message: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    if (password !== confirmPassword) {
      addNotification({
        type: "error",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    changePasswordMutation.mutate();
  };

  const handleClose = () => {
    if (!changePasswordMutation.isPending) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Cambiar Contraseña - ${userName}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <Key className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Establece una nueva contraseña para <strong>{userName}</strong>
          </p>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Lock className="w-4 h-4 inline mr-1" />
            Nueva contraseña *
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Lock className="w-4 h-4 inline mr-1" />
            Confirmar contraseña *
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Indicadores de fortaleza de contraseña */}
        {password && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Fortaleza de la contraseña:
            </div>
            <div className="flex space-x-1">
              <div
                className={`h-1 flex-1 rounded ${
                  password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-1 flex-1 rounded ${
                  /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-1 flex-1 rounded ${
                  /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-1 flex-1 rounded ${
                  /\d/.test(password) ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-1 flex-1 rounded ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(password)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              • Al menos 8 caracteres
              <br />
              • Mayúsculas y minúsculas
              <br />• Números y símbolos (recomendado)
            </div>
          </div>
        )}

        {/* Validación en tiempo real */}
        {password && confirmPassword && password !== confirmPassword && (
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <Lock className="w-4 h-4 mr-1" />
            Las contraseñas no coinciden
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Nota:</strong> El usuario deberá cambiar esta contraseña
            temporal en su próximo inicio de sesión por seguridad.
          </p>
        </div>

        {/* Error */}
        {changePasswordMutation.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-600 dark:text-red-400">
              {changePasswordMutation.error.message}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={changePasswordMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={changePasswordMutation.isPending}
            disabled={
              changePasswordMutation.isPending ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword
            }
          >
            {changePasswordMutation.isPending
              ? "Cambiando..."
              : "Cambiar Contraseña"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
