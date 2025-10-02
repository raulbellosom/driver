import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/auth";
import { X, User, Mail, Lock, Shield } from "lucide-react";

export default function CreateUserModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "driver",
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      onClose();
      setFormData({ name: "", email: "", password: "", role: "driver" });

      // Mostrar mensaje de éxito
      if (result.message) {
        alert(result.message); // En una app real, usar un toast/notification system
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Crear Usuario</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={createUserMutation.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="juan@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Lock className="w-4 h-4 inline mr-1" />
              Contraseña temporal
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              El usuario podrá cambiar su contraseña después del primer login
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Shield className="w-4 h-4 inline mr-1" />
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="driver">Conductor</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === "admin"
                ? "Acceso completo al sistema y gestión de usuarios"
                : "Acceso limitado a su perfil y funciones de conductor"}
            </p>
          </div>

          {createUserMutation.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              Error: {createUserMutation.error.message}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={createUserMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
