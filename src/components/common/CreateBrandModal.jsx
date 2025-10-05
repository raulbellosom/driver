import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Factory, Save, Loader } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

const CreateBrandModal = ({
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData);
        handleClose();
      } catch (error) {
        console.error("Error creating brand:", error);
      }
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
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
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Factory className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nueva Marca
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
                    label="Nombre de la marca"
                    placeholder="Ej: Toyota, Ford, Chevrolet..."
                    value={formData.name}
                    onChange={(value) => handleChange("name", value)}
                    error={errors.name}
                    required
                    leftIcon={<Factory className="w-4 h-4" />}
                    disabled={loading}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción (opcional)
                    </label>
                    <textarea
                      placeholder="Descripción adicional de la marca..."
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      rows={3}
                      disabled={loading}
                      className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors border-gray-300 dark:border-gray-600 disabled:opacity-50 resize-none"
                    />
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
                        Crear Marca
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

export default CreateBrandModal;
