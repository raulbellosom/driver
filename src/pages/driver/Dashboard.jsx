import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Car,
  Clock,
  Navigation,
  Fuel,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { formatters } from "../../utils";

const DriverDashboard = () => {
  // TODO: Obtener datos reales de la API
  const driverStats = {
    activeTrip: {
      id: "trip-001",
      destination: "Centro de Distribución Norte",
      estimatedTime: "1h 30m",
      distance: "45 km",
      status: "in_progress",
    },
    todayStats: {
      completedTrips: 3,
      totalDistance: 120,
      activeTime: "6h 15m",
    },
    vehicle: {
      plate: "ABC-123",
      model: "Ford Transit 2022",
      fuelLevel: 75,
      status: "active",
      lastMaintenance: "2024-12-15",
    },
  };

  const recentTrips = [
    {
      id: 1,
      destination: "Almacén Central",
      completedAt: "2025-01-01T13:30:00Z",
      distance: 25,
      status: "completed",
    },
    {
      id: 2,
      destination: "Sucursal Norte",
      completedAt: "2025-01-01T11:15:00Z",
      distance: 18,
      status: "completed",
    },
    {
      id: 3,
      destination: "Centro Comercial",
      completedAt: "2025-01-01T09:00:00Z",
      distance: 30,
      status: "completed",
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mi Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar Viaje
            </Button>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              Mis Viajes
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Viaje Activo */}
      {driverStats.activeTrip && (
        <motion.div variants={itemVariants}>
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  Viaje Activo
                </CardTitle>
                <StatusBadge status="in_progress" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Destino
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driverStats.activeTrip.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Tiempo Estimado
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {driverStats.activeTrip.estimatedTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Distancia
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Navigation className="h-4 w-4 mr-1" />
                    {driverStats.activeTrip.distance}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <Button variant="success" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Viaje
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver Ruta
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Estadísticas del día */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Viajes Completados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driverStats.todayStats.completedTrips}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Distancia Recorrida
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driverStats.todayStats.totalDistance} km
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tiempo Activo
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driverStats.todayStats.activeTime}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mi Vehículo */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Mi Vehículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {driverStats.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placas: {driverStats.vehicle.plate}
                    </p>
                  </div>
                  <StatusBadge status={driverStats.vehicle.status} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Combustible
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            driverStats.vehicle.fuelLevel > 50
                              ? "bg-green-500"
                              : driverStats.vehicle.fuelLevel > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${driverStats.vehicle.fuelLevel}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {driverStats.vehicle.fuelLevel}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Último mantenimiento
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatters.date(driverStats.vehicle.lastMaintenance)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/driver/vehicle">
                    <Button variant="outline" size="sm" className="w-full">
                      <Car className="h-4 w-4 mr-2" />
                      Ver Detalles del Vehículo
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Viajes Recientes */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Viajes Recientes</CardTitle>
                <Link
                  to="/driver/trips"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {trip.destination}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatters.timeAgo(trip.completedAt)} •{" "}
                          {trip.distance} km
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>
                ))}
              </div>

              {recentTrips.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No hay viajes recientes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Acciones Rápidas */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/driver/search"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Buscar Viaje
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Encontrar nuevo viaje
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/driver/trips"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Mis Viajes
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Historial completo
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/driver/vehicle"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Mi Vehículo
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Información y estado
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DriverDashboard;
