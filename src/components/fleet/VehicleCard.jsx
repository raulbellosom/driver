import React from "react";
import {
  Calendar,
  Fuel,
  MapPin,
  Settings,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

const VehicleCard = ({ vehicle, onEdit, onDelete, onView }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return { variant: "success", label: "Activo" };
      case "maintenance":
        return { variant: "warning", label: "Mantenimiento" };
      case "inactive":
        return { variant: "secondary", label: "Inactivo" };
      case "sold":
        return { variant: "danger", label: "Vendido" };
      default:
        return { variant: "primary", label: status };
    }
  };

  const getConditionConfig = (condition) => {
    switch (condition) {
      case "new":
        return { variant: "success", label: "Nuevo" };
      case "semi_new":
        return { variant: "primary", label: "Semi-nuevo" };
      case "maintenance":
        return { variant: "warning", label: "Mantenimiento" };
      case "repair":
        return { variant: "danger", label: "Reparación" };
      case "for_sale":
        return { variant: "secondary", label: "En venta" };
      case "rented":
        return { variant: "info", label: "Rentado" };
      default:
        return { variant: "secondary", label: condition };
    }
  };

  const statusConfig = getStatusConfig(vehicle.status);
  const conditionConfig = getConditionConfig(vehicle.condition);

  const needsAttention =
    vehicle.status === "maintenance" || vehicle.condition === "repair";

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        needsAttention ? "ring-2 ring-yellow-200" : ""
      }`}
    >
      {needsAttention && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded-bl-lg flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Atención
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {vehicle.plate}
            </h3>
            <p className="text-sm text-gray-500">
              {vehicle.brand?.name} {vehicle.model?.name}
              {vehicle.year && ` (${vehicle.year})`}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge variant={statusConfig.variant} size="sm">
              {statusConfig.label}
            </StatusBadge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium">
              {vehicle.type?.name || "No especificado"}
            </span>
          </div>

          {vehicle.color && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: vehicle.color.toLowerCase() }}
              ></div>
              <span className="text-gray-600">Color:</span>
              <span className="font-medium capitalize">{vehicle.color}</span>
            </div>
          )}

          {vehicle.mileage && (
            <div className="flex items-center gap-2 text-sm">
              <Fuel className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Kilometraje:</span>
              <span className="font-medium">
                {vehicle.mileage?.toLocaleString()}{" "}
                {vehicle.odometerUnit || "km"}
              </span>
            </div>
          )}

          {vehicle.acquisitionDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Adquisición:</span>
              <span className="font-medium">
                {new Date(vehicle.acquisitionDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {vehicle.vin && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 text-xs">VIN:</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {vehicle.vin}
              </span>
            </div>
          )}
        </div>

        {/* Condition Badge */}
        <div className="mb-4">
          <StatusBadge variant={conditionConfig.variant} size="sm">
            {conditionConfig.label}
          </StatusBadge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(vehicle)}
            className="flex-1 flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(vehicle)}
            className="flex-1 flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(vehicle)}
            className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cost indicator */}
      {vehicle.cost && (
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valor:</span>
            <span className="font-semibold text-gray-900">
              ${vehicle.cost?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VehicleCard;
