import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicOnly = ({ children, redirectTo }) => {
  const { isAuthenticated, isLoading, initialized, isAdmin, isDriver } = useAuth();

  // Mostrar loading mientras se inicializa
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir según el rol
  if (isAuthenticated) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Redirigir según el rol del usuario
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else if (isDriver) {
      return <Navigate to="/driver" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};

export default PublicOnly;
