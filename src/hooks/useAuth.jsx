import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api/auth";
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

  // Query optimizada para obtener el usuario actual con toda su información
  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: authService.getCurrentUser,
    retry: (failureCount, error) => {
      if (error?.code === 401) return false;
      return failureCount < 1;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - más tiempo para evitar refetches
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Solo refetch si es necesario
    refetchOnReconnect: false,
  });

  // Estados calculados con memoización para evitar re-renders innecesarios
  const isAuthenticated = useMemo(() => !!user && !error, [user, error]);

  const { isRoot, isAdmin, isOps, isDriver } = useMemo(() => {
    if (!user?.profile?.roles) {
      return { isRoot: false, isAdmin: false, isOps: false, isDriver: false };
    }

    const roles = user.profile.roles || [];

    return {
      isRoot: roles.includes("root"),
      isAdmin: roles.includes("admin"),
      isOps: roles.includes("ops"),
      isDriver: roles.includes("driver"),
    };
  }, [user?.profile?.roles]);

  // Función de login optimizada
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authService.login(email, password);

        // Invalidar cache y hacer un solo refetch
        queryClient.removeQueries({ queryKey: ["auth"] });
        queryClient.removeQueries({ queryKey: ["userProfile"] });

        // Un solo refetch después de limpiar el cache
        await refetchUser();

        addNotification({
          type: "success",
          title: "Bienvenido",
          message: "Has iniciado sesión correctamente",
        });

        // Navegar inmediatamente
        navigate("/");

        return response;
      } catch (error) {
        addNotification({
          type: "error",
          title: "Error de autenticación",
          message: error.message || "Credenciales incorrectas",
        });
        throw error;
      }
    },
    [queryClient, refetchUser, addNotification, navigate]
  );

  // Función de registro optimizada
  const register = useCallback(
    async (userData) => {
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
    },
    [login, addNotification]
  );

  // Función de logout optimizada
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      queryClient.clear();
      addNotification({
        type: "info",
        title: "Sesión cerrada",
        message: "Has cerrado sesión correctamente",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      queryClient.clear();
      navigate("/login");
    }
  }, [queryClient, addNotification, navigate]);

  // Función para actualizar usuario optimizada
  const updateUser = useCallback(
    async (userData) => {
      try {
        const response = await authService.updateUser(userData);
        await queryClient.invalidateQueries({
          queryKey: ["auth", "currentUser"],
        });
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
    },
    [queryClient, addNotification]
  );

  // Función para actualizar perfil optimizada
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const response = await authService.updateProfile(profileData);
        await queryClient.invalidateQueries({
          queryKey: ["auth", "currentUser"],
        });
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
    },
    [queryClient, addNotification]
  ); // Verificar autenticación al inicializar - optimizado
  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
    }
  }, [isLoading]);

  // Valor del contexto memoizado para evitar re-renders
  const value = useMemo(
    () => ({
      // Estado
      user,
      isAuthenticated,
      isLoading,
      initialized,

      // Roles
      isRoot,
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
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      initialized,
      isRoot,
      isAdmin,
      isOps,
      isDriver,
      login,
      register,
      logout,
      updateUser,
      updateProfile,
      refetchUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
