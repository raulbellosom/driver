import React from "react";
import { Link } from "react-router-dom";
import { Users, Car, Building, Plus, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import {
  useAdminStats,
  useRecentUsers,
  useRecentBrands,
} from "../../hooks/useAdminStats";

const AdminDashboard = () => {
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refetch,
  } = useAdminStats();
  const { data: recentUsers, isLoading: usersLoading } = useRecentUsers(5);
  const { data: recentBrands, isLoading: brandsLoading } = useRecentBrands(3);

  // Configuración de acciones rápidas
  const quickActions = [
    {
      title: "Gestionar Usuarios",
      description: "Ver y administrar usuarios del sistema",
      icon: Users,
      href: "/admin/users",
      color: "primary",
    },
    {
      title: "Marcas y Modelos",
      description: "Administrar catálogo de vehículos",
      icon: Car,
      href: "/admin/brands",
      color: "success",
    },
    {
      title: "Empresas",
      description: "Gestionar empresas registradas",
      icon: Building,
      href: "/admin/companies",
      color: "secondary",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Dashboard Administrativo
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-2">
              Gestión y monitoreo del sistema DriverPro
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {statsError && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="text-error-600 border-error-300 hover:bg-error-50 whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
        </div>

        {statsError && (
          <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-700">
              Error al cargar las estadísticas. Por favor, verifica la conexión
              con Appwrite.
            </p>
          </div>
        )}
      </motion.div>

      {/* Estadísticas principales */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Usuarios Registrados
                </p>
                <div className="flex items-center space-x-2">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  ) : (
                    <p className="text-3xl font-bold text-secondary-900 dark:text-white">
                      {stats.totalUsers}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Conductores
                </p>
                <div className="flex items-center space-x-2">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-success-600" />
                  ) : (
                    <p className="text-3xl font-bold text-secondary-900 dark:text-white">
                      {stats.totalDrivers}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Marcas de Vehículos
                </p>
                <div className="flex items-center space-x-2">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-accent-600" />
                  ) : (
                    <p className="text-3xl font-bold text-secondary-900 dark:text-white">
                      {stats.totalBrands}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Empresas
                </p>
                <div className="flex items-center space-x-2">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-secondary-600" />
                  ) : (
                    <p className="text-3xl font-bold text-secondary-900 dark:text-white">
                      {stats.totalCompanies}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acciones Rápidas */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.href}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${action.color}-100 dark:bg-${action.color}-900/30 group-hover:bg-${action.color}-200 dark:group-hover:bg-${action.color}-900/50 transition-colors`}
                        >
                          <Icon
                            className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usuarios Recientes */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuarios Recientes</CardTitle>
                <Link
                  to="/admin/users"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user.$id} className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          {user.isDriver ? "Conductor" : "Usuario"} •{" "}
                          {new Date(user.$createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge
                        status={user.enabled ? "active" : "inactive"}
                      >
                        {user.enabled ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                    <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                      No hay usuarios registrados
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Próximas funcionalidades */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <StatusBadge status="active" text="API Conectado" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Todos los servicios operativos
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status="active" text="Base de Datos" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Conexión estable
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status="active" text="Tiempo Real" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Sincronización activa
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
