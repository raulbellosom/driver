import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit: error.message || "Credenciales incorrectas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-900 dark:to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
        >
          {/* Header con logo */}
          <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 px-8 py-12 text-center relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-sm mb-6 shadow-lg"
            >
              <Truck className="w-10 h-10 text-white drop-shadow-sm" />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-sm">
                DriverPro
              </h1>
              <p className="text-green-100 text-lg font-medium">
                Sistema de gestión vehicular
              </p>
            </motion.div>
          </div>

          {/* Formulario */}
          <div className="p-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:border-green-600 dark:focus:border-green-400 transition-all duration-300 font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-gray-100 ${
                      errors.email
                        ? "border-red-300 dark:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-500 dark:focus:border-red-400 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
                    }`}
                    placeholder="Ingresa tu correo electrónico"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 focus:border-green-600 dark:focus:border-green-400 transition-all duration-300 font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-gray-100 ${
                      errors.password
                        ? "border-red-300 dark:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-500 dark:focus:border-red-400 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
                    }`}
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-600 rounded-r-2xl transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Error general */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-l-4 border-red-500 dark:border-red-400 rounded-2xl shadow-sm"
                >
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {errors.submit}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 hover:from-green-600 hover:via-green-700 hover:to-emerald-800 dark:from-green-600 dark:via-green-700 dark:to-emerald-800 dark:hover:from-green-700 dark:hover:via-green-800 dark:hover:to-emerald-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    <span className="text-lg">Iniciando sesión...</span>
                  </div>
                ) : (
                  <span className="text-lg">Iniciar sesión</span>
                )}
              </motion.button>

              {/* Enlaces */}
              <div className="text-center mt-6">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold underline decoration-green-300 dark:decoration-green-500 hover:decoration-green-500 dark:hover:decoration-green-400 transition-all"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </motion.form>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-700 border-t border-gray-100 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold underline decoration-green-300 dark:decoration-green-500 hover:decoration-green-500 dark:hover:decoration-green-400 transition-all"
              >
                Solicitar acceso
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-green-200 dark:border-green-700">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Sistema seguro y confiable
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
