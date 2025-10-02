import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Protected = ({ allow, children }) => {
  const { user, isAuthenticated, isLoading, initialized, isAdmin, isDriver } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se inicializa la autenticación
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Verificando sesión...</p>
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
    const hasPermission = allow.some(role => {
      switch (role) {
        case 'admin':
          return isAdmin;
        case 'driver':
          return isDriver || isAdmin; // Los admins pueden acceder a rutas de driver
        default:
          return false;
      }
    });

    if (!hasPermission) {
      // Redirigir a la página apropiada según el rol del usuario
      if (isAdmin) {
        return <Navigate to="/admin" replace />;
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
