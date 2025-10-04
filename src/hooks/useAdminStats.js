import { useQuery } from "@tanstack/react-query";
import { db } from "../lib/appwrite";
import { env } from "../lib/env";
import { Query } from "appwrite";

export const useAdminStats = () => {
  // Consultar total de usuarios con rol driver
  const {
    data: driversCount,
    isLoading: driversLoading,
    error: driversError,
  } = useQuery({
    queryKey: ["admin", "drivers-count"],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_USERS_PROFILE_ID,
          queries: [Query.contains("roles", "driver")],
        });
        return response.total || 0;
      } catch (error) {
        console.error("Error fetching drivers count:", error);
        return 0;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Consultar total de profiles de usuario
  const {
    data: usersCount,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["admin", "users-count"],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_USERS_PROFILE_ID,
          queries: [Query.limit(1)], // Solo necesitamos el total
        });
        return response.total || 0;
      } catch (error) {
        console.error("Error fetching users count:", error);
        return 0;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Consultar marcas de vehículos
  const {
    data: brandsCount,
    isLoading: brandsLoading,
    error: brandsError,
  } = useQuery({
    queryKey: ["admin", "brands-count"],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_BRANDS_ID,
          queries: [Query.limit(1)],
        });
        return response.total || 0;
      } catch (error) {
        console.error("Error fetching brands count:", error);
        return 0;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - cambia menos frecuente
  });

  // Consultar modelos de vehículos
  const {
    data: modelsCount,
    isLoading: modelsLoading,
    error: modelsError,
  } = useQuery({
    queryKey: ["admin", "models-count"],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_MODELS_ID,
          queries: [Query.limit(1)],
        });
        return response.total || 0;
      } catch (error) {
        console.error("Error fetching models count:", error);
        return 0;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  // Consultar empresas
  const {
    data: companiesCount,
    isLoading: companiesLoading,
    error: companiesError,
  } = useQuery({
    queryKey: ["admin", "companies-count"],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_COMPANIES_ID,
          queries: [Query.limit(1)],
        });
        return response.total || 0;
      } catch (error) {
        console.error("Error fetching companies count:", error);
        return 0;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const isLoading =
    driversLoading ||
    usersLoading ||
    brandsLoading ||
    modelsLoading ||
    companiesLoading;

  const hasError =
    driversError || usersError || brandsError || modelsError || companiesError;

  return {
    stats: {
      totalUsers: usersCount || 0,
      totalDrivers: driversCount || 0,
      totalBrands: brandsCount || 0,
      totalModels: modelsCount || 0,
      totalCompanies: companiesCount || 0,
    },
    isLoading,
    error: hasError,
    refetch: () => {
      // Función para refrescar todos los datos
      window.location.reload();
    },
  };
};

export const useRecentUsers = (limit = 5) => {
  return useQuery({
    queryKey: ["admin", "recent-users", limit],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_USERS_PROFILE_ID,
          queries: [Query.orderDesc("$createdAt"), Query.limit(limit)],
        });
        return response.documents || [];
      } catch (error) {
        console.error("Error fetching recent users:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useRecentBrands = (limit = 5) => {
  return useQuery({
    queryKey: ["admin", "recent-brands", limit],
    queryFn: async () => {
      try {
        const response = await db.listDocuments({
          databaseId: env.DB_ID,
          collectionId: env.COLLECTION_BRANDS_ID,
          queries: [Query.orderDesc("$createdAt"), Query.limit(limit)],
        });
        return response.documents || [];
      } catch (error) {
        console.error("Error fetching recent brands:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
