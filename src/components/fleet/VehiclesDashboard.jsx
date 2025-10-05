import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useVehicles } from "../../hooks/useVehicles";
import { useAuth } from "../../hooks/useAuth";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import StatusBadge from "../common/StatusBadge";
import VehicleCard from "./VehicleCard";

const VehiclesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicles, loading, error, stats, actions } = useVehicles({
    companyId: user?.companies?.$id,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtros aplicados
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      !searchTerm ||
      vehicle.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateVehicle = () => {
    navigate("/fleet/vehicles/new");
  };

  const handleEditVehicle = (vehicle) => {
    navigate(`/fleet/vehicles/edit/${vehicle.$id}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "maintenance":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "inactive":
        return <Clock className="w-5 h-5 text-gray-600" />;
      case "sold":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Truck className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "sold":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar vehículos
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={actions.refresh} variant="outline">
          Reintentar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            Gestión de Vehículos
          </h1>
          <p className="text-gray-500 mt-1">
            Administra la flota de vehículos de tu empresa
          </p>
        </div>
        <Button
          onClick={handleCreateVehicle}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Truck className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Activos</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.active}
              </p>
              <p className="text-xs text-green-600">
                {stats.activePercentage}%
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Mantenimiento
              </p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.maintenance}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
            <Clock className="w-10 h-10 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por placa, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="inactive">Inactivo</option>
              <option value="sold">Vendido</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {vehicles.length === 0
              ? "No hay vehículos registrados"
              : "No se encontraron vehículos"}
          </h3>
          <p className="text-gray-500 mb-6">
            {vehicles.length === 0
              ? "Comienza agregando tu primer vehículo a la flota"
              : "Intenta ajustar los filtros de búsqueda"}
          </p>
          {vehicles.length === 0 && (
            <Button
              onClick={handleCreateVehicle}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Agregar Vehículo
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.$id}
              vehicle={vehicle}
              onEdit={() => handleEditVehicle(vehicle)}
              onDelete={() => actions.delete(vehicle.$id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiclesDashboard;
