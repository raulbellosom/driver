import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Car,
  MapPin,
  BarChart3,
  User,
  Navigation,
  Search,
  Wrench,
  X,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils";
import Button from "../common/Button";

const Sidebar = ({
  isOpen,
  onClose,
  userRole = "admin",
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();

  // Definir navegación según el rol
  const getNavigationItems = () => {
    if (userRole === "admin" || userRole === "owner") {
      return [
        {
          section: "Panel Principal",
          items: [
            { name: "Dashboard", href: "/admin", icon: Home },
            { name: "Usuarios", href: "/admin/users", icon: Users },
            { name: "Vehículos", href: "/admin/vehicles", icon: Car },
            { name: "Viajes", href: "/admin/trips", icon: MapPin },
            { name: "Reportes", href: "/admin/reports", icon: BarChart3 },
          ],
        },
      ];
    }

    if (userRole === "driver") {
      return [
        {
          section: "Mi Panel",
          items: [
            { name: "Dashboard", href: "/driver", icon: Home },
            { name: "Mis Viajes", href: "/driver/trips", icon: MapPin },
            { name: "Buscar Viaje", href: "/driver/search", icon: Search },
            { name: "Mi Vehículo", href: "/driver/vehicle", icon: Car },
          ],
        },
      ];
    }

    // Rol por defecto
    return [
      {
        section: "General",
        items: [
          { name: "Inicio", href: "/", icon: Home },
          { name: "Mi Perfil", href: "/profile", icon: User },
        ],
      },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    if (href === "/admin" || href === "/driver") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="DriverPro"
            className="h-8 w-8"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              DriverPro
            </span>
          )}
        </div>

        {/* Close button (mobile only) */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className={`space-y-6 ${isCollapsed ? "space-y-2" : ""}`}>
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold whitespace-nowrap text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {section.section}
                </h3>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose} // Close mobile sidebar on navigation
                      title={isCollapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-colors",
                        isCollapsed
                          ? "justify-center px-3 py-3"
                          : "space-x-3 px-3 py-2",
                        active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Collapse Toggle Button - Solo en Desktop */}
      <div className="hidden lg:block p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <motion.div
          animate={{ width: isCollapsed ? 80 : 256 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col overflow-hidden"
        >
          <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-hidden">
            <SidebarContent />
          </div>
        </motion.div>
      </div>{" "}
      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onClose}
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
