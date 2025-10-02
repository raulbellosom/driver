import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail } from "../api/auth";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => loginWithEmail(email, password),
    onSuccess: (data) => {
      // Actualizar cache con datos de usuario
      queryClient.setQueryData(["currentSession"], data.user);
      queryClient.setQueryData(["userProfile"], data.profile);

      // Redirigir según rol
      const role = data.profile?.role;
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "driver") {
        navigate("/driver", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="text-sm text-gray-600 mt-2">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        {loginMutation.error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {loginMutation.error.message}
          </div>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
            Volver al inicio
          </Link>
        </div>
      </form>
    </div>
  );
}
