import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import usersService from "../api/users";
import { useRoles } from "../hooks/useRoles";
import { useNotifications } from "./common/NotificationSystem";
import {
  X,
  User,
  Mail,
  Lock,
  Shield,
  Phone,
  Building,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./common/Button";
import Input from "./common/Input";
import { fetchCompanies } from "../api/crud";

export default function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const { primaryRole: role, can } = useRoles();
  const { addNotification } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    displayName: "",
    enabled: true,
    roles: ["driver"], // Por defecto driver
    companyId: null,
  });

  // Query para obtener compañías
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  // Query para obtener roles disponibles según permisos
  const { data: availableRoles = [] } = useQuery({
    queryKey: ["availableRoles"],
    queryFn: usersService.getAvailableRoles,
  });

  const createUserMutation = useMutation({
    mutationFn: usersService.createUser,
    onSuccess: (result) => {
      addNotification({
        type: "success",
        message: "Usuario creado exitosamente",
      });

      // Limpiar formulario
      setFormData({
        name: "",
        email: "",
        password: "",
        displayName: "",
        enabled: true,
        roles: ["driver"],
        companyId: null,
      });

      onSuccess?.();
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: error.message || "Error al crear usuario",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      addNotification({
        type: "error",
        message: "El nombre es requerido",
      });
      return;
    }

    if (!formData.email.trim()) {
      addNotification({
        type: "error",
        message: "El correo electrónico es requerido",
      });
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      addNotification({
        type: "error",
        message: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    if (formData.roles.length === 0) {
      addNotification({
        type: "error",
        message: "Debe seleccionar al menos un rol",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleValue) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleValue)
        ? prev.roles.filter((r) => r !== roleValue)
        : [...prev.roles, roleValue],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Crear Nuevo Usuario
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Completa la información para agregar un nuevo usuario al
                    sistema
                  </p>
                </motion.div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit}>
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Información Personal */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Información Personal
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nombre completo"
                          leftIcon={<User />}
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Ej: Juan Pérez García"
                          required
                        />

                        <Input
                          label="Nombre para mostrar"
                          leftIcon={<User />}
                          type="text"
                          value={formData.displayName}
                          onChange={(e) =>
                            handleChange("displayName", e.target.value)
                          }
                          placeholder="Ej: Juan P. (opcional)"
                        />
                      </div>

                      <Input
                        label="Correo electrónico"
                        leftIcon={<Mail />}
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="juan@empresa.com"
                        required
                      />

                      <div className="relative">
                        <Input
                          label="Contraseña temporal"
                          leftIcon={<Lock />}
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          placeholder="Mínimo 8 caracteres"
                          className="pr-12"
                          required
                          hint="El usuario deberá cambiar su contraseña en el primer inicio de sesión"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Organización */}
                    {companies.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          Organización
                        </h3>

                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            value={formData.companyId || ""}
                            onChange={(e) =>
                              handleChange("companyId", e.target.value || null)
                            }
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          >
                            <option value="">Sin compañía asignada</option>
                            {companies.map((company) => (
                              <option key={company.$id} value={company.$id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Roles */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Roles del Usuario *
                      </h3>

                      <div className="space-y-3">
                        {availableRoles.map((role, index) => (
                          <motion.label
                            key={role.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={formData.roles.includes(role.value)}
                              onChange={() => handleRoleToggle(role.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
                            />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {role.label}
                                </span>
                                <Shield className="w-4 h-4 ml-2 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {role.description}
                              </p>
                            </div>
                            {formData.roles.includes(role.value) && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                            )}
                          </motion.label>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        💡 Un usuario puede tener múltiples roles. El sistema
                        aplicará automáticamente la jerarquía: Root &gt; Admin
                        &gt; Ops &gt; Driver.
                      </p>
                    </div>

                    {/* Estado */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Estado
                      </h3>

                      <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) =>
                            handleChange("enabled", e.target.checked)
                          }
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-4"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Usuario habilitado
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            El usuario podrá acceder al sistema inmediatamente
                          </p>
                        </div>
                        {formData.enabled && (
                          <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                        )}
                      </label>
                    </div>

                    {/* Error */}
                    {createUserMutation.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Error al crear usuario
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            {createUserMutation.error.message}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </form>
              </div>

              {/* Footer - Fixed */}
              <motion.div
                className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={createUserMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={createUserMutation.isPending}
                  disabled={createUserMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createUserMutation.isPending
                    ? "Creando..."
                    : "Crear Usuario"}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
