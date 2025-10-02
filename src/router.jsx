import { createBrowserRouter } from "react-router-dom";

// Layouts
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Shared Pages
import Login from "./pages/shared/Login";
import Profile from "./pages/shared/Profile";
import SecuritySettings from "./pages/shared/SecuritySettings";
import NotFound from "./pages/shared/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";

// Driver Pages
import DriverDashboard from "./pages/driver/Dashboard";

// Legacy pages (TODO: Migrar o eliminar)
import Home from "./pages/Home";
import TestAPI from "./pages/TestAPI";
import RealtimeDemo from "./pages/RealtimeDemo";
import InputExamples from "./pages/InputExamples";

// Auth Components
import Protected from "./components/Protected";
import PublicOnly from "./components/PublicOnly";

export const router = createBrowserRouter([
  // Login directo (sin layout especial por ahora)
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },

  // App principal - Layout con sidebar
  {
    path: "/",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      // Redirect home to appropriate dashboard
      {
        index: true,
        element: <div>Redirecting...</div>, // TODO: Implementar redirect logic
      },

      // Perfil (accesible por todos los usuarios autenticados)
      {
        path: "profile",
        element: <Profile />,
      },

      // Configuración de Seguridad (accesible por todos los usuarios autenticados)
      {
        path: "security",
        element: <SecuritySettings />,
      },

      // Rutas de Admin
      {
        path: "admin",
        element: (
          <Protected allow={["admin"]}>
            <AdminDashboard />
          </Protected>
        ),
      },

      // Rutas de Driver (accesibles por drivers y admins)
      {
        path: "driver",
        element: (
          <Protected allow={["driver", "admin"]}>
            <DriverDashboard />
          </Protected>
        ),
      },
    ],
  },

  // Páginas públicas sin layout (para testing, etc.)
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/test-api",
    element: <TestAPI />,
  },
  {
    path: "/realtime-demo",
    element: <RealtimeDemo />,
  },
  {
    path: "/input-examples",
    element: <InputExamples />,
  },

  // 404 - Página no encontrada
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
