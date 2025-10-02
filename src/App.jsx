import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Shared Pages
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";
import Profile from "./pages/shared/Profile";
import NotFound from "./pages/shared/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";

// Driver Pages
import DriverDashboard from "./pages/driver/Dashboard";

// Auth Components
import Protected from "./components/Protected";
import PublicOnly from "./components/PublicOnly";

// Componente para redirección inicial
const RedirectToUserDashboard = () => {
  const { isAdmin, isDriver } = useAuth();

  if (isAdmin) {
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

        {/* Rutas de Admin */}
        <Route
          path="admin"
          element={
            <Protected allow={["admin"]}>
              <AdminDashboard />
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
