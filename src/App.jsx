import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useRoles } from "./hooks/useRoles";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Shared Pages
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";
import Profile from "./pages/shared/Profile";
import SecuritySettings from "./pages/shared/SecuritySettings";
import NotFound from "./pages/shared/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import UsersManagement from "./pages/UsersManagement";

// Driver Pages
import DriverDashboard from "./pages/driver/Dashboard";

// Fleet Management Pages
import FleetManagement from "./components/fleet/FleetManagement";
import VehicleForm from "./pages/shared/VehicleForm";

// Auth Components
import Protected from "./components/Protected";
import PublicOnly from "./components/PublicOnly";

// Componente para redirección inicial - optimizado
const RedirectToUserDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    primaryRole: role,
    isRoot,
    isAdmin,
    isOps,
    isDriver,
    isLoading: roleLoading,
  } = useRoles();

  // Mostrar loader mientras se determinan los roles
  if (authLoading || roleLoading || !user) {
    return null; // El componente Protected ya maneja el loading
  }

  // Debug solo ocasionalmente
  if (process.env.NODE_ENV === "development" && Math.random() < 0.1) {
    console.log("[REDIRECT] Redirecting user with role:", role, {
      isRoot,
      isAdmin,
      isOps,
      isDriver,
    });
  }

  if (isRoot || isAdmin) {
    return <Navigate to="/admin" replace />;
  } else if (isOps) {
    return <Navigate to="/admin" replace />;
  } else if (isDriver) {
    return <Navigate to="/driver" replace />;
  } else {
    return <Navigate to="/profile" replace />;
  }
};

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />

      {/* Register */}
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />

      {/* App principal con layout */}
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        {/* Redirect home to appropriate dashboard */}
        <Route index element={<RedirectToUserDashboard />} />

        {/* Perfil (accesible por todos los usuarios autenticados) */}
        <Route path="profile" element={<Profile />} />

        {/* Configuración de Seguridad (accesible por todos los usuarios autenticados) */}
        <Route path="security" element={<SecuritySettings />} />

        {/* Rutas de Admin */}
        <Route
          path="admin"
          element={
            <Protected allow={["admin"]}>
              <AdminDashboard />
            </Protected>
          }
        />

        {/* Gestión de Usuarios - Admin y Ops */}
        <Route
          path="admin/users"
          element={
            <Protected allow={["admin", "ops"]}>
              <UsersManagement />
            </Protected>
          }
        />

        {/* Fleet Management - Admin y Ops */}
        <Route
          path="fleet"
          element={
            <Protected allow={["admin", "ops"]}>
              <FleetManagement />
            </Protected>
          }
        />

        {/* Vehicle Form - Admin y Ops */}
        <Route
          path="fleet/vehicles/new"
          element={
            <Protected allow={["admin", "ops"]}>
              <VehicleForm />
            </Protected>
          }
        />

        <Route
          path="fleet/vehicles/edit/:vehicleId"
          element={
            <Protected allow={["admin", "ops"]}>
              <VehicleForm />
            </Protected>
          }
        />

        {/* Rutas de Driver (accesibles por drivers y admins) */}
        <Route
          path="driver"
          element={
            <Protected allow={["driver", "admin"]}>
              <DriverDashboard />
            </Protected>
          }
        />
      </Route>

      {/* 404 - Página no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
