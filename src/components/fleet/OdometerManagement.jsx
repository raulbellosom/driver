import React, { useState } from "react";
import {
  Gauge,
  Plus,
  TrendingUp,
  Calendar,
  MapPin,
  AlertCircle,
  BarChart3,
  Clock,
} from "lucide-react";
import { useVehicleOdometers } from "../../hooks/useFleetManagement";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import StatusBadge from "../common/StatusBadge";
import OdometerModal from "./OdometerModal";

const OdometerManagement = ({ vehicleId, vehicle }) => {
  const { odometers, latest, stats, loading, error, actions } =
    useVehicleOdometers(vehicleId);
  const [showModal, setShowModal] = useState(false);

  const handleAddReading = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleReadingSaved = () => {
    handleCloseModal();
    actions.refresh();
  };

  const getSourceConfig = (source) => {
    switch (source) {
      case "manual":
        return { variant: "primary", label: "Manual", icon: "✋" };
      case "trip":
        return { variant: "success", label: "Viaje", icon: "🚗" };
      case "service":
        return { variant: "warning", label: "Servicio", icon: "🔧" };
      default:
        return { variant: "secondary", label: source, icon: "📊" };
    }
  };

  if (loading && odometers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Cargando lecturas de odómetro...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar odómetro
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
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-600" />
            Control de Odómetro
          </h2>
          <p className="text-gray-500 mt-1">
            {vehicle?.plate} - {vehicle?.brand?.name} {vehicle?.model?.name}
          </p>
        </div>
        <Button onClick={handleAddReading} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Lectura
        </Button>
      </div>

      {/* Current Status & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Lectura Actual
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {latest?.value?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-blue-600">
                {vehicle?.odometerUnit || "km"}
              </p>
            </div>
            <Gauge className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        {stats && (
          <>
            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Distancia ({stats.period}d)
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.totalDistance?.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    {vehicle?.odometerUnit || "km"}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Promedio Diario
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.averageDaily}
                  </p>
                  <p className="text-xs text-purple-600">
                    {vehicle?.odometerUnit || "km"}/día
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lecturas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.readingsCount}
                  </p>
                  <p className="text-xs text-gray-600">registros</p>
                </div>
                <Clock className="w-10 h-10 text-gray-500" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Latest Reading */}
      {latest && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Última Lectura
          </h3>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {latest.value.toLocaleString()}{" "}
                  {vehicle?.odometerUnit || "km"}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(latest.at).toLocaleDateString()}
                  </span>
                  <StatusBadge
                    variant={getSourceConfig(latest.source).variant}
                    size="sm"
                  >
                    {getSourceConfig(latest.source).icon}{" "}
                    {getSourceConfig(latest.source).label}
                  </StatusBadge>
                </div>
              </div>
            </div>
            {latest.note && (
              <div className="text-right">
                <p className="text-sm text-gray-600 italic">"{latest.note}"</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Reading History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Historial de Lecturas
          </h3>
          <Button variant="outline" size="sm" onClick={actions.refresh}>
            Actualizar
          </Button>
        </div>

        {odometers.length === 0 ? (
          <div className="text-center py-12">
            <Gauge className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay lecturas registradas
            </h4>
            <p className="text-gray-500 mb-6">
              Comienza agregando la primera lectura del odómetro
            </p>
            <Button
              onClick={handleAddReading}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Agregar Primera Lectura
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {odometers.map((reading, index) => {
              const sourceConfig = getSourceConfig(reading.source);
              const previousReading = odometers[index + 1];
              const distance = previousReading
                ? reading.value - previousReading.value
                : 0;

              return (
                <div
                  key={reading.$id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {reading.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle?.odometerUnit || "km"}
                      </p>
                    </div>

                    <div className="border-l border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(reading.at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(reading.at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge variant={sourceConfig.variant} size="sm">
                          {sourceConfig.icon} {sourceConfig.label}
                        </StatusBadge>

                        {distance > 0 && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            +{distance.toLocaleString()}{" "}
                            {vehicle?.odometerUnit || "km"}
                          </span>
                        )}
                      </div>

                      {reading.note && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          "{reading.note}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <OdometerModal
          vehicleId={vehicleId}
          vehicle={vehicle}
          lastReading={latest}
          onClose={handleCloseModal}
          onSave={handleReadingSaved}
        />
      )}
    </div>
  );
};

export default OdometerManagement;
