import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentSession, bootstrapUserProfile } from "../api/auth";

/**
 * Componente que maneja la creación automática del perfil
 * cuando un usuario inicia sesión por primera vez
 */
export default function ProfileBootstrap({ children }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentSession"],
    queryFn: getCurrentSession,
    retry: false,
  });

  const bootstrapMutation = useMutation({
    mutationFn: bootstrapUserProfile,
    onSuccess: (profile) => {
      console.log("[BOOTSTRAP] Profile created successfully:", profile);
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentSession"] });
    },
    onError: (error) => {
      console.error("[BOOTSTRAP] Failed to create profile:", error);
    },
  });

  useEffect(() => {
    if (user && !bootstrapMutation.isPending && !bootstrapMutation.isSuccess) {
      console.log("[BOOTSTRAP] User authenticated, ensuring profile exists...");

      // Solo intentar una vez por sesión
      const hasAttempted = sessionStorage.getItem(
        `bootstrap-attempted-${user.$id}`
      );
      if (hasAttempted) return;

      // Marcar como intentado
      sessionStorage.setItem(`bootstrap-attempted-${user.$id}`, "true");

      // Pequeño delay para asegurar que la sesión esté completamente establecida
      const timer = setTimeout(() => {
        bootstrapMutation.mutate();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, bootstrapMutation]);

  return children;
}
