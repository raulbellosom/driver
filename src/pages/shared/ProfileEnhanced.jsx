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
  AlertCircle,
  Check,
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
  const { user, updateProfile, isAdmin, isDriver } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [driverLicense, setDriverLicense] = useState(null);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);

      // También actualizar información de licencia si es conductor
      if (
        isDriver &&
        driverLicense &&
        (formData.licenseNumber ||
          formData.licenseExpiry ||
          formData.licenseClass)
      ) {
        // Aquí podrías actualizar la información de la licencia en la base de datos
      }

      setIsEditing(false);
      showNotification("Perfil actualizado correctamente", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Error al actualizar el perfil", "error");
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
        const newLicense = await createDriverLicenseRecord(user.$id, {
          licenseNumber: formData.licenseNumber || "Pendiente",
          expiryDate: formData.licenseExpiry || null,
          licenseClass: formData.licenseClass || "B",
          [`${licenseType}ImageId`]: licenseData.fileId,
          [`${licenseType}ImageUrl`]: licenseData.licenseUrl,
        });
        setDriverLicense(newLicense);
      } else {
        // Actualizar registro existente
        const updatedLicense = await updateDriverLicenseImages(
          driverLicense.$id,
          {
            [`${licenseType}ImageId`]: licenseData.fileId,
            [`${licenseType}ImageUrl`]: licenseData.licenseUrl,
          }
        );
        setDriverLicense(updatedLicense);
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

  const viewLicenseImages = () => {
    const images = [];
    if (driverLicense?.front_image_url) {
      images.push({
        src: driverLicense.front_image_url,
        alt: "Frente de la licencia de conducir",
        title: "Licencia - Frente",
      });
    }
    if (driverLicense?.back_image_url) {
      images.push({
        src: driverLicense.back_image_url,
        alt: "Reverso de la licencia de conducir",
        title: "Licencia - Reverso",
      });
    }

    if (images.length > 0) {
      setViewerImages(images);
      setImageViewerOpen(true);
    }
  };

  const getUserRoleLabel = () => {
    if (isAdmin) return "Administrador";
    if (isDriver) return "Conductor";
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
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tu información personal y configuración
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {/* Security Settings Link */}
            <Button
              as={Link}
              to="/security"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Seguridad
            </Button>

            {/* Edit/Save Buttons */}
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            ) : (
              isAdmin && (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "personal"
                  ? "border-green-500 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Información Personal
            </button>
            {isDriver && (
              <button
                onClick={() => setActiveTab("license")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "license"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Car className="w-4 h-4 inline mr-2" />
                Licencia de Conducir
              </button>
            )}
          </nav>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
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

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.profile?.displayName || user.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{getUserRoleLabel()}</p>
                    <StatusBadge
                      status={user.profile?.enabled ? "active" : "cancelled"}
                      text={user.profile?.enabled ? "Activo" : "Inactivo"}
                      size="sm"
                    />

                    {!isDriver && !isAdmin && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <strong>Nota:</strong> Solo los conductores y
                            administradores pueden subir avatares y editar su
                            información.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre para mostrar"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing || (!isAdmin && !isDriver)}
                    leftIcon={<User className="h-4 w-4" />}
                    hint={
                      !isAdmin && !isDriver
                        ? "Solo administradores y conductores pueden cambiar esto"
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
                    disabled={!isEditing || (!isAdmin && !isDriver)}
                    leftIcon={<Phone className="h-4 w-4" />}
                    placeholder="+52 555 123 4567"
                    hint={
                      !isAdmin && !isDriver
                        ? "Solo administradores y conductores pueden cambiar esto"
                        : undefined
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
              </CardContent>
            </Card>
          )}

          {/* Driver License Tab */}
          {activeTab === "license" && isDriver && (
            <div className="space-y-6">
              {/* License Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Licencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Número de Licencia"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Ej: 123456789"
                    />

                    <Input
                      label="Fecha de Vencimiento"
                      name="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clase de Licencia
                      </label>
                      <select
                        name="licenseClass"
                        value={formData.licenseClass}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="A">Clase A - Motocicletas</option>
                        <option value="B">Clase B - Automóviles</option>
                        <option value="C">Clase C - Camiones</option>
                        <option value="D">Clase D - Autobuses</option>
                      </select>
                    </div>
                  </div>

                  {driverLicense && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Estado:{" "}
                            <span className="capitalize">
                              {driverLicense.status?.replace("_", " ")}
                            </span>
                          </p>
                          <p className="text-sm text-green-600">
                            Subida: {formatters.date(driverLicense.uploaded_at)}
                          </p>
                        </div>
                        {(driverLicense.front_image_url ||
                          driverLicense.back_image_url) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={viewLicenseImages}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Imágenes
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* License Images Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes de la Licencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {loadingLicense ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Cargando información de licencia...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <DriverLicenseUploader
                        licenseType="front"
                        currentImage={driverLicense?.front_image_url}
                        onImageUploaded={handleLicenseUpload}
                        onError={handleLicenseError}
                      />

                      <DriverLicenseUploader
                        licenseType="back"
                        currentImage={driverLicense?.back_image_url}
                        onImageUploaded={handleLicenseUpload}
                        onError={handleLicenseError}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <StatusBadge
                  status={user.profile?.enabled ? "active" : "cancelled"}
                  text={user.profile?.enabled ? "Activo" : "Inactivo"}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rol</span>
                <span className="text-sm font-medium text-gray-900">
                  {getUserRoleLabel()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Registro</span>
                <span className="text-sm text-gray-900">
                  {formatters.date(user.registration)}
                </span>
              </div>

              {isDriver && driverLicense && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Licencia</span>
                    <StatusBadge
                      status={
                        driverLicense.status === "verified"
                          ? "active"
                          : driverLicense.status === "pending_verification"
                          ? "pending"
                          : "cancelled"
                      }
                      text={
                        driverLicense.status === "verified"
                          ? "Verificada"
                          : driverLicense.status === "pending_verification"
                          ? "Pendiente"
                          : "Rechazada"
                      }
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                as={Link}
                to="/security"
                variant="outline"
                className="w-full justify-start"
              >
                <Shield className="w-4 h-4 mr-2" />
                Configurar Seguridad
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración Avanzada
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {imageViewerOpen && viewerImages.length > 0 && (
          <ImageViewer
            images={viewerImages}
            currentIndex={0}
            isOpen={imageViewerOpen}
            onClose={() => setImageViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
