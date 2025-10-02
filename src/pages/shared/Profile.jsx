import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Car,
  Edit2,
  Save,
  X,
  Upload,
  Camera,
  Download,
  Eye,
  Shield,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import StatusBadge from "../../components/common/StatusBadge";
import ImageViewer from "../../components/common/ImageViewer";
import AvatarUploader from "../../components/common/AvatarUploader";
import DriverLicenseUploader from "../../components/common/DriverLicenseUploader";
import { useAuth } from "../../hooks/useAuth";
import {
  getUserDriverLicense,
  createDriverLicenseRecord,
  updateDriverLicenseImages,
} from "../../api/storage";
import { formatters } from "../../utils";

const Profile = () => {
  const { user, updateUser, updateProfile, isAdmin, isDriver } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [driverLicense, setDriverLicense] = useState(null);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
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

  const [formData, setFormData] = useState({
    displayName: user?.profile?.displayName || "",
    phone: user?.phone || "",
    licenseNumber: user?.profile?.licenseNumber || "",
    licenseExpiry: user?.profile?.licenseExpiry || "",
    licenseClass: user?.profile?.licenseClass || "B",
  });

  useEffect(() => {
    if (isDriver) {
      loadDriverLicense();
    }
  }, [isDriver, user?.$id]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadDriverLicense = async () => {
    if (!user?.$id) return;

    try {
      setLoadingLicense(true);
      const license = await getUserDriverLicense(user.$id);
      setDriverLicense(license);
    } catch (error) {
      console.error("Failed to load driver license:", error);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleDeleteLicenseImage = async (imageIndex, imageData) => {
    if (!driverLicense || !user?.$id) return;

    try {
      const licenseType = imageIndex === 0 ? "front" : "back";
      const fieldToUpdate =
        licenseType === "front" ? "frontFileUrl" : "backFileUrl";

      // Actualizar la licencia para remover la URL de la imagen
      const updateData = {};
      if (licenseType === "front") {
        updateData.frontImageUrl = null; // Para la función updateDriverLicenseImages
      } else {
        updateData.backImageUrl = null; // Para la función updateDriverLicenseImages
      }

      const updatedLicense = await updateDriverLicenseImages(
        driverLicense.$id,
        updateData
      );

      setDriverLicense(updatedLicense);
      showNotification(
        `Imagen ${
          licenseType === "front" ? "frontal" : "trasera"
        } eliminada correctamente`
      );

      // Recargar licencia después de un momento
      setTimeout(() => {
        loadDriverLicense();
      }, 500);
    } catch (error) {
      console.error("Error deleting license image:", error);
      showNotification("Error al eliminar la imagen", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error de teléfono al escribir
    if (name === "phone" && phoneError) {
      setPhoneError("");
    }
  };

  const handlePhoneBlur = (e) => {
    validatePhone(e.target.value);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validar teléfono antes de guardar
      if (formData.phone && !validatePhone(formData.phone)) {
        setNotification({
          type: "error",
          title: "Error de validación",
          message: "El formato del teléfono es inválido",
        });
        setIsLoading(false);
        return;
      }

      // Separar datos de usuario (Appwrite Auth) y perfil (Database)
      const userData = {};
      const profileData = {};

      // Campos que van al User de Appwrite
      if (formData.displayName && formData.displayName !== user.name) {
        userData.name = formData.displayName;
      }
      if (formData.phone && formData.phone !== user.phone) {
        userData.phone = formData.phone;
      }

      // Campos que van al perfil de la base de datos
      if (formData.licenseNumber) {
        profileData.licenseNumber = formData.licenseNumber;
      }
      if (formData.licenseExpiry) {
        profileData.licenseExpiry = formData.licenseExpiry;
      }
      if (formData.licenseClass) {
        profileData.licenseClass = formData.licenseClass;
      }

      // Actualizar usuario si hay cambios
      if (Object.keys(userData).length > 0) {
        await updateUser(userData);
      }

      // Actualizar perfil si hay cambios
      if (Object.keys(profileData).length > 0) {
        await updateProfile(profileData);
      }

      setIsEditing(false);
      showNotification("Información actualizada correctamente", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Error al actualizar la información", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.profile?.displayName || "",
      phone: user?.phone || "",
      licenseNumber: user?.profile?.licenseNumber || "",
      licenseExpiry: user?.profile?.licenseExpiry || "",
      licenseClass: user?.profile?.licenseClass || "B",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (avatarData) => {
    try {
      await updateProfile({
        avatarUrl: avatarData.avatarUrl,
      });
      showNotification("Avatar actualizado correctamente", "success");
    } catch (error) {
      console.error("Error updating avatar:", error);
      showNotification("Error al actualizar el avatar", "error");
    }
  };

  const handleAvatarError = (error) => {
    showNotification(error, "error");
  };

  const handleLicenseUpload = async (licenseData, licenseType) => {
    if (!user?.$id) return;

    try {
      // Si no existe registro de licencia, crearlo
      if (!driverLicense) {
        const licenseDataForRecord = {};

        // Asignar la URL de imagen al campo correspondiente según el tipo
        if (licenseType === "front") {
          licenseDataForRecord.frontImageUrl = licenseData.licenseUrl;
        } else if (licenseType === "back") {
          licenseDataForRecord.backImageUrl = licenseData.licenseUrl;
        }

        const newLicense = await createDriverLicenseRecord(
          user.$id,
          licenseDataForRecord
        );

        console.log("[PROFILE] New license created:", newLicense);
        setDriverLicense(newLicense);

        // Forzar re-render del componente
        setTimeout(() => {
          loadDriverLicense();
        }, 500);
      } else {
        // Actualizar registro existente
        const updateData = {};

        // Asignar la URL de imagen al campo correspondiente según el tipo
        if (licenseType === "front") {
          updateData.frontImageId = licenseData.fileId; // Para referencia interna
          updateData.frontImageUrl = licenseData.licenseUrl; // Para la función de update
        } else if (licenseType === "back") {
          updateData.backImageId = licenseData.fileId; // Para referencia interna
          updateData.backImageUrl = licenseData.licenseUrl; // Para la función de update
        }

        const updatedLicense = await updateDriverLicenseImages(
          driverLicense.$id,
          updateData
        );

        console.log("[PROFILE] License updated:", updatedLicense);
        setDriverLicense(updatedLicense);

        // Forzar re-render del componente
        setTimeout(() => {
          loadDriverLicense();
        }, 500);
      }

      showNotification(
        `Imagen ${
          licenseType === "front" ? "frontal" : "trasera"
        } de licencia subida correctamente`,
        "success"
      );
    } catch (error) {
      console.error("Error uploading license:", error);
      showNotification("Error al subir la imagen de licencia", "error");
    }
  };

  const handleLicenseError = (error) => {
    showNotification(error, "error");
  };

  // Determinar rol para mostrar
  const getUserRoleLabel = () => {
    if (isAdmin) {
      return "Administrador";
    }
    if (isDriver) {
      return "Conductor";
    }
    return "Usuario";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`p-4 rounded-lg border ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <Shield className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants}>
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
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
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
                    {getUserRoleLabel()}
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
                  placeholder="+523221358808"
                  error={phoneError}
                  hint={
                    phoneError
                      ? phoneError
                      : !isAdmin && isDriver
                      ? "Solo administradores pueden cambiar esto"
                      : "Formato: +[código país][número] (ej: +523221358808)"
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
        <motion.div className="space-y-6" variants={itemVariants}>
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
                  {getUserRoleLabel()}
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

      {/* Image Viewer para licencias */}
      <AnimatePresence>
        {imageViewerOpen && (
          <ImageViewer
            isOpen={imageViewerOpen}
            onClose={() => setImageViewerOpen(false)}
            images={viewerImages}
            currentIndex={0}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
