import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./components/common/NotificationSystem";
import { AuthProvider } from "./hooks/useAuth";
import App from "./App";
import "./index.css";

// Configuración optimizada de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000, // 10 minutos - más tiempo para evitar refetches
      gcTime: 15 * 60 * 1000, // 15 minutos (antes cacheTime)
      retry: (failureCount, error) => {
        // No reintentar en errores de autenticación
        if (error?.code === 401 || error?.status === 401) return false;
        return failureCount < 1; // Solo un reintento
      },
    },
    mutations: {
      retry: false, // No reintentar mutaciones por defecto
    },
  },
});

// Render de la aplicación con todos los providers
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
