import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Users, Shield, Zap, Heart, Star } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useRoles } from "../hooks/useRoles";

// Frases motivacionales que se van rotando
const motivationalMessages = [
  { text: "Conectando con tu futuro...", icon: Zap },
  { text: "Preparando tu experiencia...", icon: Star },
  { text: "Construyendo algo increíble...", icon: Heart },
  { text: "¡Tu aventura está por comenzar!", icon: Truck },
  { text: "Cargando oportunidades...", icon: Users },
  { text: "Asegurando tu sesión...", icon: Shield },
];

const Protected = ({ allow, children }) => {
  const { user, isAuthenticated, isLoading, initialized } = useAuth();
  const {
    primaryRole: role,
    isRoot,
    isAdmin,
    isOps,
    isDriver,
    isLoading: roleLoading,
  } = useRoles();
  const location = useLocation();

  // Estado para la rotación de mensajes
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Determinar si está cargando
  const isActuallyLoading = !initialized || isLoading || roleLoading;

  // Efecto para rotar mensajes cada 2 segundos - solo cuando está cargando
  useEffect(() => {
    if (isActuallyLoading) {
      const interval = setInterval(() => {
        setCurrentMessageIndex(
          (prev) => (prev + 1) % motivationalMessages.length
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActuallyLoading]);

  // Mostrar loading mientras se inicializa la autenticación o se cargan los roles
  if (isActuallyLoading) {
    const currentMessage = motivationalMessages[currentMessageIndex];
    const CurrentIcon = currentMessage.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="text-center space-y-8 max-w-md mx-auto px-6">
          {/* Logo y animación principal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Círculo de fondo animado */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Anillos animados alrededor */}
            <div className="absolute -inset-4">
              <div className="w-32 h-32 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-spin opacity-20"></div>
            </div>
            <div className="absolute -inset-8">
              <div className="w-40 h-40 border border-purple-200 dark:border-purple-800 rounded-full animate-ping opacity-10"></div>
            </div>
          </motion.div>

          {/* Mensaje motivacional rotativo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <CurrentIcon className="w-5 h-5 text-blue-500 animate-bounce" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentMessage.text}
                </h2>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Barra de progreso animada */}
          <div className="space-y-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Puntos de carga */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Texto subtle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-sm text-gray-500 dark:text-gray-400 font-medium"
          >
            DriverPro • Gestión Inteligente
          </motion.p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos, verificar permisos
  if (allow && Array.isArray(allow)) {
    const hasPermission = allow.some((allowedRole) => {
      switch (allowedRole) {
        case "root":
          return isRoot;
        case "admin":
          return isAdmin || isRoot; // Root puede acceder a rutas de admin
        case "ops":
          return isOps || isAdmin || isRoot; // Roles superiores pueden acceder a rutas de ops
        case "driver":
          return isDriver || isOps || isAdmin || isRoot; // Todos los roles pueden acceder a rutas de driver
        default:
          return false;
      }
    });

    if (!hasPermission) {
      // Redirigir a la página apropiada según el rol del usuario
      if (isRoot || isAdmin) {
        return <Navigate to="/admin" replace />;
      } else if (isOps) {
        return <Navigate to="/admin" replace />; // Ops también van al admin dashboard
      } else if (isDriver) {
        return <Navigate to="/driver" replace />;
      } else {
        return <Navigate to="/profile" replace />;
      }
    }
  }

  return children;
};

export default Protected;
