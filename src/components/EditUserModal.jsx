import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import usersService from "../api/users";
import { useRole } from "../hooks/useRole";
import { useNotifications } from "./common/NotificationSystem";
import Modal from "./common/Modal";
import Input from "./common/Input";
import Button from "./common/Button";
import {
  User,
  Mail,
  Phone,
  Save,
  X,
  AlertTriangle,
  Shield,
  Building,
  Calendar,
} from "lucide-react";
import { fetchCompanies } from "../api/crud";

export default function EditUserModal({ isOpen, onClose, user, onSuccess }) {
  const queryClient = useQueryClient();
  const { role, can } = useRole();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    displayName: "",
    isDriver: false,
    enabled: true,
    teams: [],
    companyId: null,
    licenseNumber: "",
    licenseExpiry: "",
    licenseClass: "",
  });

  // Query para obtener compañías
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  // Obtener teams disponibles según permisos
  const availableTeams = usersService.getAvailableTeams(role);

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        displayName: user.displayName || "",
        isDriver: user.isDriver || false,
        enabled: user.enabled ?? true,
        teams: user.teams?.map((t) => t.id) || [],
        companyId: user.companies?.$id || null,
        licenseNumber: user.licenseNumber || "",
        licenseExpiry: user.licenseExpiry || "",
        licenseClass: user.licenseClass || "",
      });
    }
  }, [user]);

  // Mutation para actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: (updates) => usersService.updateUser(user.userId, updates),
    onSuccess: () => {
      addNotification({
        type: "success",
        message: "Usuario actualizado correctamente",
      });
      onSuccess?.();
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: error.message || "Error al actualizar usuario",
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
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

    if (formData.phone && !/^\+\d{12,15}$/.test(formData.phone)) {
      addNotification({
        type: "error",
        message: "El teléfono debe tener el formato +523221234567",
      });
      return;
    }

    if (formData.teams.length === 0) {
      addNotification({
        type: "error",
        message: "Debe seleccionar al menos un team",
      });
      return;
    }

    // Preparar datos para actualización
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      displayName: formData.displayName,
      isDriver: formData.isDriver,
      enabled: formData.enabled,
      teams: formData.teams,
      companyId: formData.companyId,
      licenseNumber: formData.licenseNumber,
      licenseExpiry: formData.licenseExpiry,
      licenseClass: formData.licenseClass,
    };

    updateUserMutation.mutate(updateData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTeamToggle = (teamId) => {
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.includes(teamId)
        ? prev.teams.filter((t) => t !== teamId)
        : [...prev.teams, teamId],
    }));
  };

  // Auto-establecer isDriver basado en teams seleccionados
  useEffect(() => {
    const driverTeam = availableTeams.find((t) => t.value === "driver");
    const hasDriverTeam = driverTeam && formData.teams.includes(driverTeam.id);
    setFormData((prev) => ({ ...prev, isDriver: hasDriverTeam }));
  }, [formData.teams, availableTeams]);

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Usuario - ${user.displayName || user.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre completo *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Juan Pérez García"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre para mostrar
            </label>
            <Input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              placeholder="Ej: Juan P."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo electrónico *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="juan@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+523221234567"
            />
          </div>
        </div>

        {/* Compañía */}
        {companies.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Compañía
            </label>
            <select
              value={formData.companyId || ""}
              onChange={(e) =>
                handleChange("companyId", e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sin compañía asignada</option>
              {companies.map((company) => (
                <option key={company.$id} value={company.$id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Teams / Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Teams y Roles *
          </label>
          <div className="space-y-2">
            {availableTeams.map((team) => (
              <label
                key={team.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.teams.includes(team.id)}
                  onChange={() => handleTeamToggle(team.id)}
                  className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {team.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {team.value === "admin" && "Acceso completo al sistema"}
                    {team.value === "ops" &&
                      "Gestión de operaciones y conductores"}
                    {team.value === "driver" && "Acceso como conductor"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Información de conductor (si es driver) */}
        {formData.isDriver && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-700">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
              Información de Conductor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Licencia
                </label>
                <Input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    handleChange("licenseNumber", e.target.value)
                  }
                  placeholder="ABC123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Vencimiento
                </label>
                <Input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) =>
                    handleChange("licenseExpiry", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clase de Licencia
                </label>
                <Input
                  type="text"
                  value={formData.licenseClass}
                  onChange={(e) => handleChange("licenseClass", e.target.value)}
                  placeholder="A, B, C, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Estado */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
          />
          <label
            htmlFor="enabled"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Usuario habilitado
          </label>
        </div>

        {/* Información del sistema */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Información del sistema
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">ID:</span> {user.$id}
            </div>
            <div>
              <span className="font-medium">Usuario ID:</span> {user.userId}
            </div>
            <div>
              <span className="font-medium">Creado:</span>{" "}
              {new Date(user.createdAt || user.$createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Última actualización:</span>{" "}
              {new Date(user.updatedAt || user.$updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Error */}
        {updateUserMutation.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-600 dark:text-red-400">
              {updateUserMutation.error.message}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateUserMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={updateUserMutation.isPending}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
