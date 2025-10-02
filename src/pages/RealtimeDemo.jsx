import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealtimeCollection, useNotifications } from "../hooks/useRealtime";
import { fetchVehicleBrands, createVehicleBrand } from "../api/crud";
import { Play, Square, Wifi, WifiOff } from "lucide-react";

export default function RealtimeDemo() {
  const [isListening, setIsListening] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [eventLog, setEventLog] = useState([]);

  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Query para obtener las marcas
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["vehicleBrands"],
    queryFn: fetchVehicleBrands,
  });

  // Mutation para crear nueva marca
  const createBrandMutation = useMutation({
    mutationFn: createVehicleBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleBrands"] });
      setNewBrandName("");
      addNotification({
        type: "success",
        title: "Marca creada",
        message: "Nueva marca de vehículo agregada exitosamente",
        duration: 3000,
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Error",
        message: error.message,
        duration: 5000,
      });
    },
  });

  // Hook de Realtime (T7 implementation)
  const { isConnected, lastEvent, error } = useRealtimeCollection(
    "vehicle_brands",
    {
      eventTypes: ["create", "update", "delete"],
      enableNotifications: isListening,
      onEvent: (event) => {
        // Agregar al log de eventos
        setEventLog((prev) => [
          {
            ...event,
            id: Date.now() + Math.random(),
          },
          ...prev.slice(0, 19), // Mantener solo los últimos 20 eventos
        ]);

        // Refrescar datos cuando hay cambios
        if (isListening) {
          queryClient.invalidateQueries({ queryKey: ["vehicleBrands"] });
        }
      },
    }
  );

  const handleCreateBrand = (e) => {
    e.preventDefault();
    if (newBrandName.trim()) {
      createBrandMutation.mutate({
        name: newBrandName.trim(),
      });
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setEventLog([]); // Limpiar log al empezar a escuchar
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "create":
        return "✅";
      case "update":
        return "✏️";
      case "delete":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Realtime Demo - T7 Sprint 1</h1>
        <p className="text-gray-600">
          Demostración de eventos en tiempo real para vehicle_brands según el
          Sprint 1
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              Estado: {isConnected ? "Conectado" : "Desconectado"}
            </span>
            {error && <span className="text-sm text-red-600">({error})</span>}
          </div>

          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isListening
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isListening ? (
              <>
                <Square className="h-4 w-4" />
                Detener escucha
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Iniciar escucha
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección de datos actuales */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Marcas de Vehículos (Datos actuales)
          </h2>

          {/* Formulario para crear nueva marca */}
          <form
            onSubmit={handleCreateBrand}
            className="bg-gray-50 p-4 rounded-lg space-y-3"
          >
            <h3 className="font-medium">Crear nueva marca</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Nombre de la marca (ej: Toyota)"
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={createBrandMutation.isPending || !newBrandName.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBrandMutation.isPending ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>

          {/* Lista de marcas */}
          <div className="bg-white border rounded-lg">
            <div className="p-3 border-b">
              <h3 className="font-medium">Lista actual ({brands.length})</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Cargando...</div>
              ) : brands.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay marcas
                </div>
              ) : (
                <div className="divide-y">
                  {brands.map((brand) => (
                    <div
                      key={brand.$id}
                      className="p-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{brand.name}</span>
                        <div className="text-xs text-gray-500">
                          ID: {brand.$id}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(brand.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Log de eventos en tiempo real */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Eventos en Tiempo Real</h2>
            <span
              className={`px-2 py-1 rounded text-sm ${
                isListening
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isListening ? "Escuchando" : "Pausado"}
            </span>
          </div>

          <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
            <div className="mb-2 text-green-300">
              [REALTIME LOG] Suscrito a: databases.{"{DB_ID}"}
              .collections.vehicle_brands.documents
            </div>

            {eventLog.length === 0 ? (
              <div className="text-gray-500">
                {isListening
                  ? "Esperando eventos... Crea una nueva marca para ver los cambios en tiempo real."
                  : 'Haz clic en "Iniciar escucha" para ver eventos en tiempo real.'}
              </div>
            ) : (
              <div className="space-y-1">
                {eventLog.map((event) => (
                  <div
                    key={event.id}
                    className="border-l-2 border-green-500 pl-3"
                  >
                    <div className="flex items-center gap-2">
                      <span>{getEventIcon(event.type)}</span>
                      <span className="text-yellow-400">
                        [{new Date(event.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="text-blue-400 uppercase">
                        {event.type}
                      </span>
                    </div>
                    <div className="text-gray-300 text-xs ml-6">
                      Collection: {event.collection}
                    </div>
                    {event.document && (
                      <div className="text-gray-300 text-xs ml-6">
                        Document: {event.document.name || event.document.$id}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {eventLog.length > 0 && (
            <button
              onClick={() => setEventLog([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar log
            </button>
          )}
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          ℹ️ Información Técnica (T7)
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • <strong>Canal:</strong> databases.{"{DB_ID}"}
            .collections.vehicle_brands.documents
          </p>
          <p>
            • <strong>Eventos:</strong> create, update, delete
          </p>
          <p>
            • <strong>Latencia esperada:</strong> &lt;500ms en LAN
          </p>
          <p>
            • <strong>Filtrado ACL:</strong> Solo documentos con permisos se
            propagan
          </p>
          <p>
            • <strong>Reconexión:</strong> Automática en pérdida de conexión
          </p>
        </div>
      </div>
    </div>
  );
}
