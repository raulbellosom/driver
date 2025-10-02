import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  logout,
  bootstrapUserProfile,
  authService,
} from "../api/auth";
import { uploadAvatar } from "../api/storage";
import { useNavigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import { useNotifications } from "../components/common/NotificationSystem";
import {
  Camera,
  Upload,
  User,
  CreditCard,
  Calendar,
  X,
  Shield,
  ShieldCheck,
  Car,
  Users,
  Phone,
  Key,
  Lock,
} from "lucide-react";
import ChangePasswordModal from "../components/common/ChangePasswordModal";

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const { role, isAdmin, isDriver, can } = useRole();
  const { addNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Función para validar teléfono
  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError("");
      return true;
    }

    const phonePattern = /^\+\d{1,3}\d{10,14}$/;
    const isValid = phonePattern.test(phone);

    if (!isValid) {
      setPhoneError(
        "Formato inválido. Usa +[código país][número] (ej: +523221358808)"
      );
      return false;
    }

    setPhoneError("");
    return true;
  };

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    retry: false, // No retry automático para evitar loops
  });

  const createProfileMutation = useMutation({
    mutationFn: bootstrapUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (profileData) => {
      const result = await authService.updateProfile(profileData);

      // Mostrar solo el toast de éxito
      addNotification({
        type: "success",
        title: "Perfil actualizado",
        message: "Tu perfil ha sido actualizado correctamente",
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsEditing(false);
    },
    onError: (error) => {
      // Mostrar solo el toast de error
      addNotification({
        type: "error",
        title: "Error al actualizar",
        message: error.message || "No se pudo actualizar el perfil",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (result) => {
      // Actualizar el perfil con la nueva URL del avatar
      updateMutation.mutate({
        avatarUrl: result.avatarUrl,
      });
      setAvatarPreview(null);
      setUploadingAvatar(false);
    },
    onError: (error) => {
      console.error("Avatar upload failed:", error);
      setUploadingAvatar(false);
      setAvatarPreview(null);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Si hay error o no hay perfil, mostrar opción de crear
  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <User className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Perfil no encontrado
          </h2>
          <p className="text-yellow-800 mb-4">
            {error
              ? `Error: ${error.message}`
              : "No tienes un perfil creado aún. Crea uno para continuar."}
          </p>

          <button
            onClick={() => createProfileMutation.mutate()}
            disabled={createProfileMutation.isPending}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createProfileMutation.isPending
              ? "Creando perfil..."
              : "Crear mi perfil"}
          </button>

          {createProfileMutation.error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              Error al crear perfil: {createProfileMutation.error.message}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            ¿Necesitas ayuda?
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Verifica que la colección esté configurada en Appwrite</p>
            <p>• Revisa los permisos de la colección</p>
            <p>
              • Consulta la{" "}
              <a href="/setup-guide" className="underline">
                guía de configuración
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      displayName: profile.displayName || profile.name || "",
      phone: profile.phone || "",
      licenseNumber: profile.licenseNumber || "",
      licenseExpiry: profile.licenseExpiry || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.displayName?.trim()) {
      addNotification({
        type: "error",
        title: "Error de validación",
        message: "El nombre es requerido",
      });
      return;
    }

    // Validar teléfono antes de guardar
    if (formData.phone && !validatePhone(formData.phone)) {
      addNotification({
        type: "error",
        title: "Error de validación",
        message: "El formato del teléfono es inválido",
      });
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setAvatarPreview(null);
    setPhoneError("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setUploadingAvatar(true);
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <User className="w-8 h-8 mr-3" />
            Mi Perfil
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              ) : isDriver ? (
                <Car className="w-4 h-4 text-green-600" />
              ) : (
                <Shield className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm font-medium capitalize">
                {role === "admin"
                  ? "Administrador"
                  : role === "driver"
                  ? "Conductor"
                  : role}
              </span>
            </div>
            {profile?.driver && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Conductor Habilitado
              </span>
            )}
          </div>
        </div>

        {/* Botones removidos del header */}
      </div>

      {/* Avatar Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {avatarPreview || profile?.avatarUrl ? (
                <img
                  src={avatarPreview || profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              {uploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg">
              {profile?.displayName || profile?.name || "Usuario"}
            </h3>
            <p className="text-sm text-gray-600 capitalize">{profile?.role}</p>
            {profile?.driver && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Conductor Habilitado
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {uploadAvatarMutation.error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">
            Error al subir imagen: {uploadAvatarMutation.error.message}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información personal
          </h2>
          <div className="flex items-center space-x-2">
            {!can.editOwnProfile() && isDriver && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Solo lectura
              </span>
            )}
            {!isEditing && can.editOwnProfile() && (
              <button
                onClick={handleEdit}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Editar
              </button>
            )}
          </div>
        </div>

        {!can.editOwnProfile() && isDriver && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Información:</span> Solo los
              administradores pueden modificar perfiles de usuario. Si necesitas
              actualizar tu información, contacta a un administrador.
            </p>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }));
                  // Limpiar error al escribir
                  if (phoneError) {
                    setPhoneError("");
                  }
                }}
                onBlur={(e) => validatePhone(e.target.value)}
                placeholder="+523221358808"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  phoneError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
              {!phoneError && (
                <p className="text-xs text-gray-500 mt-1">
                  Formato: +[código país][número] (ej: +523221358808)
                </p>
              )}
            </div>

            {profile?.driver && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de licencia
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vencimiento de licencia
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        licenseExpiry: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                className="border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>

            {/* Los errores se muestran via toast desde useAuth */}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <p className="text-sm text-gray-900">
                  {profile?.displayName || profile?.name || "No especificado"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <p className="text-sm text-gray-900">
                  {profile?.phone || "No especificado"}
                </p>
              </div>
            </div>

            {profile?.driver && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número de licencia
                    </label>
                    <p className="text-sm text-gray-900">
                      {profile?.licenseNumber || "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Vencimiento de licencia
                    </label>
                    <p className="text-sm text-gray-900">
                      {profile?.licenseExpiry
                        ? new Date(profile.licenseExpiry).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "No especificado"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Seguridad */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Seguridad y Acceso
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cambiar Contraseña */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Contraseña
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Actualiza tu contraseña regularmente para mantener tu cuenta
                  segura
                </p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>

          {/* Panel Admin (si aplica) */}
          {can.accessAdminPanel() && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Administración
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Accede al panel de administración del sistema
                  </p>
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                  >
                    <Users className="w-3 h-3" />
                    <span>Panel Admin</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Información del sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">ID:</span> {profile?.$id}
          </div>
          <div>
            <span className="font-medium">Creado:</span>{" "}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleString()
              : "N/A"}
          </div>
          <div>
            <span className="font-medium">Última actualización:</span>{" "}
            {profile?.updatedAt
              ? new Date(profile.updatedAt).toLocaleString()
              : "N/A"}
          </div>
          <div>
            <span className="font-medium">Estado:</span>{" "}
            <span
              className={profile?.enabled ? "text-green-600" : "text-red-600"}
            >
              {profile?.enabled ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Cambiar Contraseña */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
