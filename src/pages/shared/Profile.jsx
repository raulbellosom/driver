import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Car,
  Edit2,
  Save,
  X,
  Shield,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import StatusBadge from "../../components/common/StatusBadge";
import AvatarUploader from "../../components/common/AvatarUploader";
import DriverLicenseUploader from "../../components/common/DriverLicenseUploader";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../components/common/NotificationSystem";
import {
  getUserDriverLicense,
  createDriverLicenseRecord,
  updateDriverLicenseImages,
} from "../../api/storage";
import { formatters } from "../../utils";

// Constantes
const PHONE_REGEX = /^\+\d{1,4}\d{7,15}$/;
const PHONE_ERROR_MESSAGE =
  "Formato inválido. Usa +[código país][número] (ej: +523221234567)";

const Profile = () => {
  const { user, updateUser, updateProfile, isAdmin, isDriver } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driverLicense, setDriverLicense] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  // Validación de teléfono optimizada
  const validatePhone = useCallback((phone) => {
    if (!phone?.trim()) {
      setPhoneError("");
      return true;
    }

    const isValid = PHONE_REGEX.test(phone.trim());
    setPhoneError(isValid ? "" : PHONE_ERROR_MESSAGE);
    return isValid;
  }, []);

  // Estado del formulario inicializado con datos del usuario
  const [formData, setFormData] = useState(() => ({
    displayName: user?.profile?.displayName || "",
    phone: user?.phone || "",
    licenseNumber: user?.profile?.licenseNumber || "",
    licenseExpiry: user?.profile?.licenseExpiry || "",
    licenseClass: user?.profile?.licenseClass || "B",
  }));

  useEffect(() => {
    if (isDriver) {
      loadDriverLicense();
    }
  }, [isDriver, user?.$id]);

  // Notificaciones ahora se manejan directamente con addNotification

  // Carga de licencia de conductor optimizada
  const loadDriverLicense = useCallback(async () => {
    if (!user?.$id) return;

    try {
      const license = await getUserDriverLicense(user.$id);
      setDriverLicense(license);
    } catch (error) {
      // Solo log crítico, la ausencia de licencia no es un error
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading driver license:", error.message);
      }
    }
  }, [user?.$id]);

  // Manejo optimizado de eliminación de imágenes
  const handleDeleteLicenseImage = useCallback(
    async (imageIndex, imageData) => {
      if (!driverLicense?.$id) return;

      const licenseType = imageIndex === 0 ? "front" : "back";
      const updateData = {
        [licenseType === "front" ? "frontImageUrl" : "backImageUrl"]: null,
      };

      try {
        await updateDriverLicenseImages(driverLicense.$id, updateData);

        addNotification({
          title: "🗑️ Imagen eliminada",
          message: `Imagen ${
            licenseType === "front" ? "frontal" : "trasera"
          } eliminada correctamente`,
          type: "success",
          duration: 3000,
        });

        // Recargar licencia
        await loadDriverLicense();
      } catch (error) {
        addNotification({
          title: "❌ Error al eliminar",
          message: "No se pudo eliminar la imagen. Inténtalo nuevamente.",
          type: "error",
          duration: 5000,
        });

        if (process.env.NODE_ENV === "development") {
          console.error("Error deleting license image:", error);
        }
      }
    },
    [driverLicense?.$id, loadDriverLicense, addNotification]
  );

  // Manejo optimizado de cambios en inputs
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({ ...prev, [name]: value }));

      // Limpiar error de teléfono al escribir
      if (name === "phone" && phoneError) {
        setPhoneError("");
      }
    },
    [phoneError]
  );

  // Validación de teléfono al perder foco
  const handlePhoneBlur = useCallback(
    (e) => {
      validatePhone(e.target.value);
    },
    [validatePhone]
  );

  // Guardado optimizado del perfil
  const handleSave = useCallback(async () => {
    // Validar teléfono antes de guardar
    if (formData.phone && !validatePhone(formData.phone)) {
      addNotification({
        title: "❌ Error de validación",
        message: "El formato del teléfono es inválido",
        type: "error",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const updatePromises = [];

      // Datos para Appwrite Auth
      const userData = {};
      if (formData.displayName?.trim() && formData.displayName !== user.name) {
        userData.name = formData.displayName.trim();
      }
      if (formData.phone?.trim() && formData.phone !== user.phone) {
        userData.phone = formData.phone.trim();
      }

      // Datos para perfil en DB
      const profileData = {};
      if (formData.licenseNumber?.trim()) {
        profileData.licenseNumber = formData.licenseNumber.trim();
      }
      if (formData.licenseExpiry) {
        profileData.licenseExpiry = formData.licenseExpiry;
      }
      if (formData.licenseClass) {
        profileData.licenseClass = formData.licenseClass;
      }

      // Ejecutar actualizaciones en paralelo
      if (Object.keys(userData).length > 0) {
        updatePromises.push(updateUser(userData));
      }
      if (Object.keys(profileData).length > 0) {
        updatePromises.push(updateProfile(profileData));
      }

      if (updatePromises.length === 0) {
        setIsEditing(false);
        return;
      }

      await Promise.all(updatePromises);

      setIsEditing(false);
      addNotification({
        title: "✅ Perfil actualizado",
        message: "Tu información se ha guardado exitosamente",
        type: "success",
        duration: 4000,
      });
    } catch (error) {
      addNotification({
        title: "❌ Error al guardar",
        message: error.message || "No se pudo actualizar la información",
        type: "error",
        duration: 5000,
      });

      if (process.env.NODE_ENV === "development") {
        console.error("Error updating profile:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    user,
    validatePhone,
    updateUser,
    updateProfile,
    addNotification,
  ]);

  // Cancelar edición y resetear formulario
  const handleCancel = useCallback(() => {
    setFormData({
      displayName: user?.profile?.displayName || "",
      phone: user?.phone || "",
      licenseNumber: user?.profile?.licenseNumber || "",
      licenseExpiry: user?.profile?.licenseExpiry || "",
      licenseClass: user?.profile?.licenseClass || "B",
    });
    setIsEditing(false);
    setPhoneError("");
  }, [user]);

  // Manejo optimizado de carga de avatar
  const handleAvatarUpload = useCallback(
    async (avatarData) => {
      try {
        await updateProfile({ avatarUrl: avatarData.avatarUrl });

        addNotification({
          title: "📸 Avatar actualizado",
          message: "Tu foto de perfil se ha actualizado exitosamente",
          type: "success",
          duration: 4000,
        });
      } catch (error) {
        addNotification({
          title: "❌ Error de avatar",
          message: "No se pudo actualizar tu foto de perfil",
          type: "error",
          duration: 5000,
        });

        if (process.env.NODE_ENV === "development") {
          console.error("Error updating avatar:", error);
        }
      }
    },
    [updateProfile, addNotification]
  );

  // Manejo de errores de avatar
  const handleAvatarError = useCallback(
    (error) => {
      addNotification({
        title: "🖼️ Error de avatar",
        message: typeof error === "string" ? error : "Error al subir la imagen",
        type: "error",
        duration: 6000,
      });
    },
    [addNotification]
  );

  // Manejo optimizado de carga de licencia
  const handleLicenseUpload = useCallback(
    async (licenseData, licenseType) => {
      if (!user?.$id || !licenseData?.fileUrl) {
        addNotification({
          title: "❌ Error de validación",
          message: "Datos de imagen inválidos",
          type: "error",
          duration: 4000,
        });
        return;
      }

      const imageUrl = licenseData.fileUrl;
      const fieldName = `${licenseType}FileUrl`;

      try {
        let result;

        if (!driverLicense) {
          // Crear nuevo registro de licencia
          result = await createDriverLicenseRecord(user.$id, {
            [fieldName]: imageUrl,
          });
        } else {
          // Actualizar registro existente
          result = await updateDriverLicenseImages(driverLicense.$id, {
            [fieldName]: imageUrl,
          });
        }

        setDriverLicense(result);

        addNotification({
          title: "🎆 Licencia actualizada",
          message: `Imagen ${
            licenseType === "front" ? "frontal" : "trasera"
          } subida correctamente`,
          type: "success",
          duration: 4000,
        });

        // Recargar licencia para asegurar sincronización
        await loadDriverLicense();
      } catch (error) {
        const errorMessage = error.message || "Error desconocido";

        addNotification({
          title: "📷 Error al subir licencia",
          message: `No se pudo subir la imagen ${
            licenseType === "front" ? "frontal" : "trasera"
          }: ${errorMessage}`,
          type: "error",
          duration: 8000,
        });

        if (process.env.NODE_ENV === "development") {
          console.error("License upload error:", {
            error: errorMessage,
            licenseType,
            imageUrl,
          });
        }
      }
    },
    [user?.$id, driverLicense, addNotification, loadDriverLicense]
  );

  // Manejo de errores de licencia
  const handleLicenseError = useCallback(
    (error) => {
      addNotification({
        title: "🚫 Error de imagen",
        message:
          typeof error === "string" ? error : "Error al procesar la imagen",
        type: "error",
        duration: 8000,
      });
    },
    [addNotification]
  );

  // Rol del usuario optimizado con memoización
  const userRoleLabel = useMemo(() => {
    if (isAdmin) return "Administrador";
    if (isDriver) return "Conductor";
    return "Usuario";
  }, [isAdmin, isDriver]);

  // Variables de animación memoizadas
  const animationVariants = useMemo(
    () => ({
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      },
      item: {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3 },
        },
      },
    }),
    []
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-6"
      variants={animationVariants.container}
      initial="hidden"
      animate="visible"
    >
      {/* Las notificaciones ahora se muestran como toast globales */}

      {/* Header - Solo visible en desktop para evitar duplicación con Navbar en móvil */}
      <motion.div variants={animationVariants.item} className="hidden sm:block">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Mi Perfil
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
              Gestiona tu información personal y configuración
            </p>
          </div>

          <div className="flex-shrink-0">
            {isEditing ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  size="sm"
                  className="w-full sm:w-auto h-8 justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                  size="sm"
                  className="w-full sm:w-auto h-8 justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                {isAdmin && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="w-full sm:w-auto h-8 justify-center whitespace-nowrap"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <motion.div className="lg:col-span-2" variants={animationVariants.item}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información Personal</CardTitle>

                {/* Botones de acción para móvil */}
                <div className="flex items-center gap-2 sm:hidden">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        size="sm"
                        className="h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleSave}
                        loading={isLoading}
                        disabled={isLoading}
                        size="sm"
                        className="h-8"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    isAdmin && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        className="h-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <AvatarUploader
                    currentAvatar={user?.profile?.avatarUrl}
                    onAvatarUploaded={handleAvatarUpload}
                    onError={handleAvatarError}
                    disabled={!isDriver && !isAdmin}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {user?.profile?.displayName || user.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {userRoleLabel}
                  </p>
                  <StatusBadge
                    status={user.profile?.enabled ? "active" : "cancelled"}
                    text={user.profile?.enabled ? "Activo" : "Inactivo"}
                    size="sm"
                  />
                  {!isDriver && !isAdmin && (
                    <p className="text-sm text-gray-500 mt-2">
                      Solo conductores y administradores pueden cambiar el
                      avatar
                    </p>
                  )}
                </div>
              </div>

              {/* Formulario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre para mostrar"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  disabled={!isEditing || (!isAdmin && isDriver)}
                  leftIcon={<User className="h-4 w-4" />}
                  hint={
                    !isAdmin && isDriver
                      ? "Solo administradores pueden cambiar esto"
                      : undefined
                  }
                />

                <Input
                  label="Correo Electrónico"
                  value={user.email}
                  disabled={true}
                  leftIcon={<Mail className="h-4 w-4" />}
                  hint="El email no se puede cambiar"
                />

                <Input
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handlePhoneBlur}
                  disabled={!isEditing || (!isAdmin && isDriver)}
                  leftIcon={<Phone className="h-4 w-4" />}
                  placeholder="+523221234567"
                  error={phoneError}
                  hint={
                    phoneError
                      ? phoneError
                      : !isAdmin && isDriver
                      ? "Solo administradores pueden cambiar esto"
                      : "Formato: +[código país][número] (ej: +523221234567)"
                  }
                />

                <div>
                  <label className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                    Fecha de Registro
                  </label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {formatters.date(user.registration)}
                  </p>
                </div>
              </div>

              {/* Información de conductor (si aplica) */}
              {isDriver && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Car className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
                    Información de Conductor
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Input
                      label="Número de Licencia"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing || (!isAdmin && isDriver)}
                      placeholder="Ej: 12345678"
                      hint={
                        !isAdmin && isDriver
                          ? "Solo administradores pueden cambiar esto"
                          : undefined
                      }
                    />

                    <Input
                      label="Vencimiento de Licencia"
                      name="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry?.split("T")[0] || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing || (!isAdmin && isDriver)}
                      hint={
                        !isAdmin && isDriver
                          ? "Solo administradores pueden cambiar esto"
                          : undefined
                      }
                    />
                  </div>

                  {/* Driver License Images */}
                  <div className="space-y-6">
                    <h5 className="text-md font-medium text-gray-900 dark:text-white">
                      Imágenes de Licencia de Conducir
                    </h5>

                    {/* Consejos únicos - Solo mostrar cuando no hay imágenes */}
                    {!driverLicense?.frontFileUrl &&
                      !driverLicense?.backFileUrl && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                                Consejos para una mejor captura:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                  <li>
                                    • Asegúrate de que toda la licencia sea
                                    visible
                                  </li>
                                  <li>
                                    • Usa buena iluminación, evita sombras
                                  </li>
                                </ul>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                  <li>
                                    • Mantén la imagen nítida y sin desenfoque
                                  </li>
                                  <li>
                                    • Evita reflejos en la superficie de la
                                    licencia
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Front License */}
                      <DriverLicenseUploader
                        licenseType="front"
                        currentImage={driverLicense?.frontFileUrl}
                        onImageUploaded={handleLicenseUpload}
                        onError={handleLicenseError}
                        onImageDelete={(licenseType) =>
                          handleDeleteLicenseImage(0, { type: licenseType })
                        }
                        disabled={false} // Los drivers pueden subir sus licencias
                      />

                      {/* Back License */}
                      <DriverLicenseUploader
                        licenseType="back"
                        currentImage={driverLicense?.backFileUrl}
                        onImageUploaded={handleLicenseUpload}
                        onError={handleLicenseError}
                        onImageDelete={(licenseType) =>
                          handleDeleteLicenseImage(1, { type: licenseType })
                        }
                        disabled={false} // Los drivers pueden subir sus licencias
                      />
                    </div>

                    {/* License Status */}
                    {driverLicense && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Estado de la Licencia
                        </h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">
                              Estado:
                            </span>
                            <StatusBadge
                              status={
                                driverLicense.status === "approved"
                                  ? "active"
                                  : driverLicense.status === "rejected"
                                  ? "error"
                                  : "pending"
                              }
                              text={
                                driverLicense.status === "approved"
                                  ? "Aprobada"
                                  : driverLicense.status === "rejected"
                                  ? "Rechazada"
                                  : "Pendiente"
                              }
                              size="sm"
                            />
                          </div>
                          {driverLicense.reviewedByUserId && (
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">
                                Revisado por:
                              </span>
                              <span className="text-blue-900 dark:text-blue-100 font-medium">
                                {driverLicense.reviewedByUserId}
                              </span>
                            </div>
                          )}
                          {driverLicense.reviewNotes && (
                            <div className="flex flex-col gap-1">
                              <span className="text-blue-700 dark:text-blue-300">
                                Observaciones:
                              </span>
                              <span className="text-blue-900 dark:text-blue-100 text-xs bg-blue-100 dark:bg-blue-800 p-2 rounded">
                                {driverLicense.reviewNotes}
                              </span>
                            </div>
                          )}
                          {driverLicense.$createdAt && (
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">
                                Creada:
                              </span>
                              <span className="text-blue-900 dark:text-blue-100">
                                {formatters.date(driverLicense.$createdAt)}
                              </span>
                            </div>
                          )}
                          {driverLicense.$updatedAt &&
                            driverLicense.$updatedAt !==
                              driverLicense.$createdAt && (
                              <div className="flex justify-between">
                                <span className="text-blue-700 dark:text-blue-300">
                                  Actualizada:
                                </span>
                                <span className="text-blue-900 dark:text-blue-100">
                                  {formatters.date(driverLicense.$updatedAt)}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Panel lateral */}
        <motion.div className="space-y-6" variants={animationVariants.item}>
          {/* Estadísticas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Estado
                </span>
                <StatusBadge
                  status={user.profile?.enabled ? "active" : "cancelled"}
                  text={user.profile?.enabled ? "Activo" : "Inactivo"}
                  size="sm"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Rol
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {userRoleLabel}
                </span>
              </div>

              {isDriver && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Licencia
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {driverLicense?.license_number ||
                        formData.licenseNumber ||
                        "No registrada"}
                    </span>
                  </div>

                  {(driverLicense?.expiry_date || formData.licenseExpiry) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Vencimiento
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          new Date(
                            driverLicense?.expiry_date || formData.licenseExpiry
                          ) < new Date()
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {formatters.date(
                          driverLicense?.expiry_date || formData.licenseExpiry
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Última actualización
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatters.timeAgo(
                    user.profile?.$updatedAt || user.registration
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                as={Link}
                to="/security"
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Shield className="h-4 w-4 mr-2" />
                Configuración de Seguridad
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar 2FA
                <span className="ml-auto text-xs text-gray-500">
                  Próximamente
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Stats (if driver) */}
          {isDriver && (
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {driverLicense ? "1" : "0"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Licencias registradas
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">
                    Viajes completados
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    ⭐ 0.0
                  </div>
                  <div className="text-sm text-gray-600">
                    Calificación promedio
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Image Viewer removido - no se utiliza en esta versión optimizada */}
    </motion.div>
  );
};

export default Profile;
