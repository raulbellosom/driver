import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, updateUser as updateUserAPI } from "../api/auth";
import { useNotifications } from "../components/common/NotificationSystem";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Query para obtener el usuario actual
  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  // Estados calculados
  const isAuthenticated = !!user && !error;
  const isAdmin = user?.teams?.some(
    (team) => team.$id === import.meta.env.VITE_APPWRITE_TEAM_ADMINS_ID
  );
  const isOps = user?.teams?.some(
    (team) => team.$id === import.meta.env.VITE_APPWRITE_TEAM_OPS_ID
  );
  const isDriver = user?.profile?.isDriver || false;

  // Función de login
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      // Refrescar los datos del usuario
      await refetchUser();

      addNotification({
        type: "success",
        title: "Bienvenido",
        message: "Has iniciado sesión correctamente",
      });

      // Redirigir según el rol
      if (isAdmin) {
        navigate("/admin");
      } else if (isDriver) {
        navigate("/driver");
      } else {
        navigate("/profile");
      }

      return response;
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error de autenticación",
        message: error.message || "Credenciales incorrectas",
      });
      throw error;
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      addNotification({
        type: "success",
        title: "Cuenta creada",
        message: "Tu cuenta ha sido creada exitosamente",
      });

      // Auto-login después del registro
      await login(userData.email, userData.password);

      return response;
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error en el registro",
        message: error.message || "No se pudo crear la cuenta",
      });
      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await authService.logout();

      // Limpiar cache
      queryClient.clear();

      addNotification({
        type: "info",
        title: "Sesión cerrada",
        message: "Has cerrado sesión correctamente",
      });

      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar logout local aunque falle el servidor
      queryClient.clear();
      navigate("/login");
    }
  };

  // Función para actualizar usuario (nombre, teléfono)
  const updateUser = async (userData) => {
    try {
      const response = await updateUserAPI(userData);

      // Invalidar y refrescar datos del usuario
      await queryClient.invalidateQueries(["auth", "me"]);

      addNotification({
        type: "success",
        title: "Usuario actualizado",
        message: "Tu información ha sido actualizada correctamente",
      });

      return response;
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al actualizar",
        message: error.message || "No se pudo actualizar la información",
      });
      throw error;
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);

      // Invalidar y refrescar datos del usuario inmediatamente
      await queryClient.invalidateQueries(["auth", "me"]);

      // Forzar refetch para actualizar la UI inmediatamente
      await refetchUser();

      addNotification({
        type: "success",
        title: "Perfil actualizado",
        message: "Tu perfil ha sido actualizado correctamente",
      });

      return response;
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al actualizar",
        message: error.message || "No se pudo actualizar el perfil",
      });
      throw error;
    }
  }; // Verificar autenticación al inicializar
  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
    }
  }, [isLoading]);

  // Validar sesión periódicamente
  useEffect(() => {
    if (!isAuthenticated || !initialized) return;

    const interval = setInterval(() => {
      refetchUser().catch((error) => {
        console.error("Error validando sesión:", error);
        if (error.code === 401) {
          logout();
        }
      });
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated, initialized, refetchUser]);

  const value = {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    initialized,

    // Roles
    isAdmin,
    isOps,
    isDriver,

    // Métodos
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
