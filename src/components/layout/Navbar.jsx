import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Settings, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import ThemeSelector from "../common/ThemeSelector";
import ImageViewer from "../common/ImageViewer";
import { useAuth } from "../../hooks/useAuth"; // TODO: Implementar
import { cn } from "../../utils";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Usar el hook de auth real
  const { user, logout, isAdmin, isDriver } = useAuth();

  const handleLogout = async () => {
    try {
      setProfileDropdownOpen(false); // Cerrar dropdown primero
      await logout();
      // El navigate se maneja en el hook useAuth
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/admin")) {
      if (path === "/admin") return "Panel Administrativo";
      if (path === "/admin/users") return "Gestión de Usuarios";
      if (path === "/admin/vehicles") return "Gestión de Vehículos";
      if (path === "/admin/trips") return "Gestión de Viajes";
      if (path === "/admin/reports") return "Reportes";
      return "Administración";
    }
    if (path.startsWith("/driver")) {
      if (path === "/driver") return "Inicio";
      if (path === "/driver/trips") return "Mis Viajes";
      if (path === "/driver/search") return "Buscar Viaje";
      if (path === "/driver/vehicle") return "Mi Vehículo";
      return "Conductor";
    }
    if (path === "/profile") return "Mi Perfil";
    return "DriverPro";
  };

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Page title only - Logo is now only in sidebar */}
            <div className="ml-2 lg:ml-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme controls */}
            <ThemeSelector />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-9 w-9 relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-4 w-4" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notificaciones
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* TODO: Implementar lista de notificaciones */}
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No hay notificaciones nuevas
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 p-2"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {user?.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-300 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowImageViewer(true);
                    }}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  <span className="hidden sm:inline">
                    {user?.name || "Usuario"}
                  </span>
                  <span className="sm:hidden">
                    {(user?.name || "Usuario").length > 10
                      ? `${(user?.name || "Usuario").substring(0, 10)}...`
                      : user?.name || "Usuario"}
                  </span>
                </span>
              </Button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold mb-3 relative group">
                          {user?.profile?.avatarUrl ? (
                            <img
                              src={user.profile.avatarUrl}
                              alt={user.name}
                              className="h-16 w-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-300 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProfileDropdownOpen(false);
                                setShowImageViewer(true);
                              }}
                            />
                          ) : (
                            user?.name?.charAt(0) || "U"
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.profile?.displayName || user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                        <p className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mt-2">
                          {isAdmin
                            ? "Administrador"
                            : isDriver
                            ? "Conductor"
                            : "Usuario"}
                        </p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </Link>

                      <hr className="my-1 border-gray-200 dark:border-gray-700" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(profileDropdownOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}

      {/* Image Viewer for Avatar */}
      {showImageViewer && user?.profile?.avatarUrl && (
        <ImageViewer
          isOpen={showImageViewer}
          images={[
            {
              url: user.profile.avatarUrl,
              alt: `Avatar de ${user.name || "Usuario"}`,
              title:
                user.profile?.displayName || user.name || "Avatar de usuario",
            },
          ]}
          currentIndex={0}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
