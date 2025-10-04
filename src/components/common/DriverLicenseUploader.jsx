import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Upload,
  X,
  Eye,
  Download,
  Check,
  AlertCircle,
  Camera,
  Trash2,
} from "lucide-react";
import {
  uploadDriverLicense,
  validateImageFile,
  formatFileSize,
} from "../../api/storage";
import ImageViewer from "./ImageViewer";

const DriverLicenseUploader = ({
  licenseType = "front", // "front" | "back"
  currentImage = null,
  onImageUploaded,
  onError,
  onImageDelete, // Nueva prop para eliminar imagen
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const fileInputRef = useRef(null);

  const isfront = licenseType === "front";
  const title = isfront ? "Frontal de la Licencia" : "Reverso de la Licencia";
  const placeholder = isfront ? "Lado frontal" : "Lado reverso";

  const handleFileSelect = async (file) => {
    if (!file || disabled) return;

    // Validar archivo con límite de 15MB
    const validation = validateImageFile(file, 15 * 1024 * 1024);
    if (!validation.isValid) {
      const errorMessage = `❌ Error de validación:\n${validation.errors
        .map((err) => `• ${err}`)
        .join("\n")}`;
      if (validation.fileInfo) {
        const fileInfoMsg = `\n\nArchivo: ${validation.fileInfo.name} (${validation.fileInfo.sizeMB}MB, ${validation.fileInfo.type})`;
        onError?.(errorMessage + fileInfoMsg);
      } else {
        onError?.(errorMessage);
      }
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Subir archivo
    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadDriverLicense(
        file,
        licenseType,
        (progress) => {
          setUploadProgress(
            Math.round((progress.loaded / progress.total) * 100)
          );
        }
      );

      console.log("[UPLOADER] Upload result:", result);
      console.log("[UPLOADER] Calling onImageUploaded with:", {
        result,
        licenseType,
      });

      onImageUploaded?.(result, licenseType);
      setPreview(null);
    } catch (error) {
      console.error(`License ${licenseType} upload failed:`, error);
      let errorMessage = `❌ Error al subir la imagen ${
        licenseType === "front" ? "frontal" : "trasera"
      }:`;

      if (error.message.includes("network")) {
        errorMessage += "\n• Problema de conexión a internet";
      } else if (error.message.includes("permission")) {
        errorMessage += "\n• Sin permisos para subir archivos";
      } else if (
        error.message.includes("size") ||
        error.message.includes("large")
      ) {
        errorMessage += "\n• El archivo es demasiado grande (máximo 15MB)";
      } else if (
        error.message.includes("type") ||
        error.message.includes("format")
      ) {
        errorMessage += "\n• Formato de imagen no soportado";
      } else {
        errorMessage += `\n• ${error.message}`;
      }

      errorMessage +=
        "\n\n💡 Intenta con una imagen más pequeña o diferente formato";
      onError?.(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const triggerFileInput = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadCurrentImage = () => {
    if (currentImage) {
      const link = document.createElement("a");
      link.href = currentImage;
      link.download = `licencia_${licenseType}.jpg`;
      link.click();
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {title}
          </h3>

          {currentImage && !preview && !uploading && (
            <div className="flex items-center gap-2">
              <button
                onClick={downloadCurrentImage}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Descargar imagen"
              >
                <Download className="w-4 h-4" />
              </button>
              {onImageDelete && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `¿Estás seguro de que quieres eliminar la imagen ${
                          licenseType === "front" ? "frontal" : "trasera"
                        } de la licencia?`
                      )
                    ) {
                      onImageDelete(licenseType, {
                        url: currentImage,
                        type: licenseType,
                      });
                    }
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment" // Para usar cámara trasera por defecto
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <motion.div
          className={`
            relative border-2 border-dashed rounded-xl p-6 cursor-pointer
            transition-all duration-300 min-h-[200px]
            ${
              dragOver
                ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500"
                : uploading
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500"
                : currentImage || preview
                ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
                : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-gray-50 dark:hover:bg-gray-800/30"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={(e) => {
            // Si hay imagen actual, no abrir file input - solo permitir el click en áreas específicas
            if (currentImage && !preview) {
              e.stopPropagation();
              return;
            }
            triggerFileInput();
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          whileHover={disabled ? {} : { scale: 1.01 }}
          whileTap={disabled ? {} : { scale: 0.99 }}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                className="relative"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <img
                  src={preview}
                  alt={`Vista previa - ${placeholder}`}
                  className="w-full h-48 object-cover mx-auto rounded-lg"
                />
                <button
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelPreview();
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : currentImage ? (
              <motion.div
                key="current"
                className="relative text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative">
                  <img
                    src={currentImage}
                    alt={`Licencia - ${placeholder}`}
                    className="w-full h-48 object-cover mx-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowViewer(true);
                    }}
                  />
                  {/* Overlay permanente para indicar que se puede cambiar */}
                  <div className="absolute top-2 left-2 bg-green-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium">
                    ✓ Subida
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mt-3">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Imagen cargada</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded px-3 py-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-600 transition-colors cursor-pointer"
                >
                  <span className="text-amber-700 dark:text-amber-300">
                    🔄 Haz clic para reemplazar imagen
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {placeholder}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Toma una foto o sube desde tu galería
                </p>

                {/* Botones de Cámara y Galería para móviles */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Crear input específico para cámara
                      const cameraInput = document.createElement("input");
                      cameraInput.type = "file";
                      cameraInput.accept = "image/*";
                      cameraInput.capture = "environment";
                      cameraInput.onchange = handleInputChange;
                      cameraInput.click();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Usar Cámara</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Subir Archivo</span>
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  JPG, PNG, WebP, HEIC (máx. 15MB)
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress - Centrado y mejorado */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 flex items-center justify-center rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center p-6">
                  {/* Spinner centrado y más grande */}
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  {/* Texto mejorado */}
                  <div className="space-y-3">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      📤 Subiendo imagen...
                    </div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      {uploadProgress}%
                    </div>

                    {/* Barra de progreso mejorada */}
                    <div className="w-40 bg-gray-200 dark:bg-gray-600 rounded-full h-3 mx-auto overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-full rounded-full flex items-center justify-end pr-1"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {uploadProgress > 20 && (
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        )}
                      </motion.div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {licenseType === "front"
                        ? "Imagen frontal"
                        : "Imagen trasera"}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag Over Indicator */}
          <AnimatePresence>
            {dragOver && (
              <motion.div
                className="absolute inset-0 bg-green-500 bg-opacity-20 dark:bg-green-400 dark:bg-opacity-20 border-2 border-green-400 dark:border-green-500 border-dashed flex items-center justify-center rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-green-700 dark:text-green-300 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4" />
                  <div className="text-lg font-medium">
                    Suelta la imagen aquí
                  </div>
                  <div className="text-sm">{placeholder}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tips eliminados - Ahora se muestran en el componente padre para evitar duplicación */}
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {showViewer && currentImage && (
          <ImageViewer
            images={[
              {
                url: currentImage,
                alt: `Licencia - ${placeholder}`,
                title: title,
              },
            ]}
            currentIndex={0}
            isOpen={showViewer}
            onClose={() => setShowViewer(false)}
            showDeleteButton={!!onImageDelete}
            onDelete={(index, imageData) => {
              if (onImageDelete) {
                onImageDelete(licenseType, imageData);
              }
              setShowViewer(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DriverLicenseUploader;
