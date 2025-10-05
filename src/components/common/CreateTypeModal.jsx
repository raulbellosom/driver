import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Save, Loader } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

const CreateTypeModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialValue = "",
}) => {
  const [formData, setFormData] = useState({
    name: initialValue,
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Actualizar el nombre cuando cambie initialValue
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, name: initialValue }));
  }, [initialValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData);
        handleClose();
      } catch (error) {
        console.error("Error creating type:", error);
      }
    }
  };

  const handleClose = () => {
    setFormData({ name: initialValue, description: "" });
    setErrors({});
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
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
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nuevo Tipo de Vehículo
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <Input
                    label="Tipo de vehículo"
                    placeholder="Ej: Sedán, SUV, Camioneta..."
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={errors.name}
                    required
                    leftIcon={<Tag className="w-4 h-4" />}
                    disabled={loading}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Descripción del tipo de vehículo..."
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      rows={3}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none disabled:opacity-50 ${
                        errors.description
                          ? "border-red-300 dark:border-red-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" loading={loading}>
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Crear Tipo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTypeModal;
