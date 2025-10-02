import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../api/me";
import { client, account, db } from "../lib/appwrite";
import { env } from "../lib/env";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Loader,
  Server,
  Database,
  User,
  AlertCircle,
} from "lucide-react";

export default function Home() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const user = data?.user;

  const [pingStatus, setPingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pingAppwrite = async () => {
    setIsLoading(true);
    setPingStatus(null);

    const results = {
      client: false,
      account: false,
      database: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Test 1: Client Connection (Health check)
      try {
        console.log("[PING] Testing client connection...");
        // Simple health check - try to get project info or make any API call
        await account.get().catch(() => {
          // Even if not authenticated, a proper response means connection works
          throw new Error("Connection test");
        });
        results.client = true;
      } catch (error) {
        // If we get a 401 (unauthorized), the connection is actually working
        if (error.code === 401 || error.message.includes("unauthorized")) {
          results.client = true;
        }
      }

      // Test 2: Account Service
      try {
        console.log("[PING] Testing account service...");
        await account.get();
        results.account = true;
      } catch (error) {
        console.log(
          "[PING] Account test (expected if not logged in):",
          error.message
        );
        // Account service is working even if user is not authenticated
        if (error.code === 401) {
          results.account = true;
        }
      }

      // Test 3: Database Service
      try {
        console.log("[PING] Testing database service...");
        // Try to list documents (will fail with permissions but proves connection)
        await db.listDocuments(
          env.DB_ID,
          env.COLLECTION_USERS_PROFILE_ID || "test",
          []
        );
        results.database = true;
      } catch (error) {
        console.log("[PING] Database test:", error.message);
        // Database service is working even if we don't have permissions
        if (
          error.code === 404 ||
          error.message.includes("not found") ||
          error.message.includes("permissions") ||
          error.code === 401
        ) {
          results.database = true;
        }
      }

      console.log("[PING] Final results:", results);
      setPingStatus(results);
    } catch (error) {
      console.error("[PING] Connection test failed:", error);
      setPingStatus({
        ...results,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === true)
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === false) return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  const getStatusColor = (status) => {
    if (status === true) return "text-green-600";
    if (status === false) return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚛 DriverPro</h1>
        <p className="text-gray-600">
          Sistema de Gestión de Flotas Vehiculares
        </p>
      </div>

      {/* Appwrite Connection Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Verificación de Conexión Appwrite
          </h2>
          <button
            onClick={pingAppwrite}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            <span>{isLoading ? "Probando..." : "Ping Appwrite"}</span>
          </button>
        </div>

        {/* Connection Status */}
        {pingStatus && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Connection */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Server className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Conexión Cliente</div>
                  <div
                    className={`text-xs ${getStatusColor(pingStatus.client)}`}
                  >
                    {pingStatus.client ? "Conectado" : "Desconectado"}
                  </div>
                </div>
                {getStatusIcon(pingStatus.client)}
              </div>

              {/* Account Service */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Servicio de Cuentas</div>
                  <div
                    className={`text-xs ${getStatusColor(pingStatus.account)}`}
                  >
                    {pingStatus.account ? "Disponible" : "No disponible"}
                  </div>
                </div>
                {getStatusIcon(pingStatus.account)}
              </div>

              {/* Database Service */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Database className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Base de Datos</div>
                  <div
                    className={`text-xs ${getStatusColor(pingStatus.database)}`}
                  >
                    {pingStatus.database ? "Disponible" : "No disponible"}
                  </div>
                </div>
                {getStatusIcon(pingStatus.database)}
              </div>
            </div>

            {/* Overall Status */}
            <div
              className={`p-3 rounded-lg ${
                pingStatus.client && pingStatus.account && pingStatus.database
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                {pingStatus.client &&
                pingStatus.account &&
                pingStatus.database ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span
                  className={`font-medium ${
                    pingStatus.client &&
                    pingStatus.account &&
                    pingStatus.database
                      ? "text-green-800"
                      : "text-yellow-800"
                  }`}
                >
                  {pingStatus.client &&
                  pingStatus.account &&
                  pingStatus.database
                    ? "✅ Conexión con Appwrite establecida correctamente"
                    : "⚠️ Algunos servicios pueden no estar disponibles"}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Última verificación:{" "}
                {new Date(pingStatus.timestamp).toLocaleString()}
              </div>
            </div>

            {pingStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Error de conexión:</span>
                </div>
                <div className="text-sm text-red-700 mt-1">
                  {pingStatus.error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Configuración Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Endpoint:</span>
            <div className="text-gray-600 break-all">{env.ENDPOINT}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Project ID:</span>
            <div className="text-gray-600">{env.PROJECT_ID}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Database ID:</span>
            <div className="text-gray-600">{env.DB_ID}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Teams:</span>
            <div className="text-gray-600">
              Admins: {env.TEAM_ADMINS_ID?.substring(0, 8)}...
              <br />
              Drivers: {env.TEAM_DRIVERS_ID?.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>

      {/* User Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Estado del Usuario</h3>
        {user ? (
          <>
            <div className="flex items-center space-x-2 text-green-600 mb-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Sesión activa</span>
            </div>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium text-gray-700">Usuario:</span>{" "}
                <span className="text-gray-600">{user.name || user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span>{" "}
                <span className="text-gray-600 font-mono text-xs">
                  {user.$id}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>{" "}
                <span className="text-gray-600">{user.email}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500">
            <WifiOff className="w-5 h-5" />
            <span>No has iniciado sesión</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          {!user ? (
            <>
              <a
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </a>
              <a
                href="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Registrarse
              </a>
            </>
          ) : (
            <>
              <a
                href="/profile"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Perfil
              </a>
              <a
                href="/test-api"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Probar APIs
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
