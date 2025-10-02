import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserInAppwrite, updateUserProfileAsAdmin } from "../api/auth";
import Modal from "./common/Modal";
import Input from "./common/Input";
import Button from "./common/Button";
import { User, Mail, Phone, Save, X, AlertTriangle } from "lucide-react";

export default function EditUserModal({ isOpen, onClose, user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    displayName: "",
    licenseNumber: "",
    licenseExpiry: "",
    enabled: true,
  });
  const [errors, setErrors] = useState({});

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName || user.name || "",
        email: user.email || "No disponible",
        phone: user.phone || "No disponible",
        displayName: user.displayName || user.name || "",
        licenseNumber: user.licenseNumber || "",
        licenseExpiry: user.licenseExpiry || "",
        enabled: user.enabled ?? true,
      });
      setErrors({});
    }
  }, [user]); // Mutación para actualizar información básica (nombre, email, teléfono)
  const updateBasicInfoMutation = useMutation({
    mutationFn: (updates) => updateUserInAppwrite(user.userId, updates),
    onSuccess: () => {
      // Invalidar consultas para actualizar la lista
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  // Mutación para actualizar perfil extendido
  const updateProfileMutation = useMutation({
    mutationFn: (updates) => updateUserProfileAsAdmin(user.userId, updates),
    onSuccess: () => {
      // Invalidar consultas para actualizar la lista
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (
      formData.licenseExpiry &&
      new Date(formData.licenseExpiry) < new Date()
    ) {
      newErrors.licenseExpiry =
        "La fecha de vencimiento no puede estar en el pasado";
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
      // Preparar actualizaciones para Appwrite (name, email, phone)
      const appwriteUpdates = {};
      if (formData.name !== user.displayName) {
        appwriteUpdates.name = formData.name;
      }
      // Nota: email y phone requieren implementación del lado del servidor

      // Preparar actualizaciones para el perfil
      const profileUpdates = {};
      if (formData.displayName !== user.displayName) {
        profileUpdates.displayName = formData.displayName;
      }
      if (formData.licenseNumber !== user.licenseNumber) {
        profileUpdates.licenseNumber = formData.licenseNumber;
      }
      if (formData.licenseExpiry !== user.licenseExpiry) {
        profileUpdates.licenseExpiry = formData.licenseExpiry;
      }
      if (formData.enabled !== user.enabled) {
        profileUpdates.enabled = formData.enabled;
      }

      // Ejecutar actualizaciones
      if (Object.keys(appwriteUpdates).length > 0) {
        await updateBasicInfoMutation.mutateAsync(appwriteUpdates);
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfileMutation.mutateAsync(profileUpdates);
      }

      // Mostrar mensaje de éxito
      console.log("Usuario actualizado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si se actualiza el nombre, sincronizar displayName
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        displayName: value,
      }));
    }

    // Limpiar errores al escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Usuario
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica de Appwrite */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Información de Appwrite
            </h3>
            <p className="text-xs text-blue-800 mb-4">
              Estos campos se actualizan directamente en el usuario de Appwrite
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                icon={User}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                placeholder="Nombre completo del usuario"
              />

              <Input
                label="Email (Solo lectura)"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                placeholder="usuario@ejemplo.com"
                disabled
                helperText="El email no se puede modificar desde el cliente por seguridad"
              />

              <Input
                label="Teléfono (Solo lectura)"
                type="tel"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                placeholder="+1234567890"
                disabled
                helperText="La actualización del teléfono requiere implementación del servidor"
              />
            </div>
          </div>

          {/* Información del perfil */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Información del Perfil
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Estos campos se actualizan en la tabla users_profile
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre mostrado"
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="Nombre que se mostrará en la app"
                helperText="Se sincroniza automáticamente con el nombre de Appwrite"
              />

              {user.isDriver && (
                <>
                  <Input
                    label="Número de licencia"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      handleChange("licenseNumber", e.target.value)
                    }
                    placeholder="Número de licencia de conducir"
                  />

                  <Input
                    label="Vencimiento de licencia"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) =>
                      handleChange("licenseExpiry", e.target.value)
                    }
                    error={errors.licenseExpiry}
                  />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la cuenta
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="enabled"
                      checked={formData.enabled}
                      onChange={() => handleChange("enabled", true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-green-600">Activo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="enabled"
                      checked={!formData.enabled}
                      onChange={() => handleChange("enabled", false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-red-600">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Información del sistema
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {user.$id}
              </div>
              <div>
                <span className="font-medium">Usuario ID:</span> {user.userId}
              </div>
              <div>
                <span className="font-medium">Rol:</span>{" "}
                {user.isDriver ? "Conductor" : "Usuario"}
              </div>
              <div>
                <span className="font-medium">Creado:</span>{" "}
                {new Date(user.$createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              icon={X}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={
                updateBasicInfoMutation.isPending ||
                updateProfileMutation.isPending
              }
              icon={Save}
            >
              Guardar cambios
            </Button>
          </div>

          {/* Errores */}
          {(updateBasicInfoMutation.error || updateProfileMutation.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-red-800">
                {updateBasicInfoMutation.error?.message ||
                  updateProfileMutation.error?.message}
              </p>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
