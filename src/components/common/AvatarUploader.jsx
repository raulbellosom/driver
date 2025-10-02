import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Check, AlertCircle } from "lucide-react";
import {
  uploadAvatar,
  validateImageFile,
  formatFileSize,
} from "../../api/storage";

const AvatarUploader = ({
  currentAvatar,
  onAvatarUploaded,
  onError,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file || disabled) return;

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      onError?.(validation.errors.join(", "));
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

      const result = await uploadAvatar(file, (progress) => {
        setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
      });

      onAvatarUploaded?.(result);
      setPreview(null);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      onError?.(error.message);
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

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        className={`
          relative w-32 h-32 rounded-full overflow-hidden border-4 cursor-pointer
          transition-all duration-300 group
          ${
            dragOver
              ? "border-green-400 bg-green-50"
              : uploading
              ? "border-blue-400"
              : "border-gray-300 hover:border-green-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        {/* Avatar Image */}
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.img
              key="preview"
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            />
          ) : currentAvatar ? (
            <motion.img
              key="current"
              src={currentAvatar}
              alt="Avatar actual"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.div
              key="placeholder"
              className="w-full h-full bg-gray-100 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Camera className="w-8 h-8 text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-sm font-medium">{uploadProgress}%</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Overlay */}
        <AnimatePresence>
          {!uploading && !disabled && (
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Actions */}
        <AnimatePresence>
          {preview && !uploading && (
            <motion.button
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                cancelPreview();
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Drag Over Indicator */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              className="absolute inset-0 bg-green-500 bg-opacity-20 border-2 border-green-400 border-dashed flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-green-700 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium">Suelta la imagen</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upload Instructions */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Subiendo imagen...
            </div>
          ) : (
            <>
              <p>Haz clic o arrastra una imagen</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG, WebP (máx. 5MB)
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarUploader;
