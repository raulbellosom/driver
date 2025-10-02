import { useEffect, useState } from "react";
import { client, account } from "../lib/appwrite";
import { env } from "../lib/env";

export default function DebugConnection() {
  const [connectionTest, setConnectionTest] = useState({
    status: "testing",
    endpoint: null,
    projectId: null,
    error: null,
    response: null,
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionTest({
      status: "testing",
      endpoint: env.ENDPOINT,
      projectId: env.PROJECT_ID,
      error: null,
      response: null,
    });

    try {
      // Intentar hacer una llamada básica a Appwrite
      console.log("[DEBUG] Testing connection to Appwrite...");
      console.log("[DEBUG] Using endpoint:", env.ENDPOINT);
      console.log("[DEBUG] Using project ID:", env.PROJECT_ID);

      // Test 1: Verificar que el cliente esté configurado
      console.log("[DEBUG] Client configuration:", {
        endpoint: client.config.endpoint,
        project: client.config.project,
      });

      // Test 2: Hacer una llamada real
      const response = await account.get();

      setConnectionTest({
        status: "success",
        endpoint: env.ENDPOINT,
        projectId: env.PROJECT_ID,
        error: null,
        response: response,
      });
    } catch (error) {
      console.error("[DEBUG] Connection test failed:", error);

      setConnectionTest({
        status: "error",
        endpoint: env.ENDPOINT,
        projectId: env.PROJECT_ID,
        error: {
          message: error.message,
          code: error.code || "unknown",
          type: error.type || "unknown",
          response: error.response || null,
        },
        response: null,
      });
    }
  };

  const testEndpointOnly = async () => {
    try {
      const response = await fetch(`${env.ENDPOINT}/health`);
      console.log(
        "[DEBUG] Health endpoint test:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("[DEBUG] Health response:", data);
      }
    } catch (error) {
      console.error("[DEBUG] Health endpoint failed:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">🔧 Debug Conexión Appwrite</h1>
        <p className="text-gray-600 mt-2">
          Diagnóstico de configuración y conectividad
        </p>
      </div>

      {/* Variables de entorno */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="font-semibold mb-3">📋 Variables de Entorno</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div>
            <span className="text-gray-600">ENDPOINT:</span>
            <div
              className={`p-2 bg-white rounded ${
                env.ENDPOINT ? "text-green-700" : "text-red-700"
              }`}
            >
              {env.ENDPOINT || "NO DEFINIDO"}
            </div>
          </div>
          <div>
            <span className="text-gray-600">PROJECT_ID:</span>
            <div
              className={`p-2 bg-white rounded ${
                env.PROJECT_ID ? "text-green-700" : "text-red-700"
              }`}
            >
              {env.PROJECT_ID || "NO DEFINIDO"}
            </div>
          </div>
          <div>
            <span className="text-gray-600">DATABASE_ID:</span>
            <div
              className={`p-2 bg-white rounded ${
                env.DB_ID ? "text-green-700" : "text-red-700"
              }`}
            >
              {env.DB_ID || "NO DEFINIDO"}
            </div>
          </div>
          <div>
            <span className="text-gray-600">TEAM_ADMINS_ID:</span>
            <div
              className={`p-2 bg-white rounded ${
                env.TEAM_ADMINS_ID ? "text-green-700" : "text-red-700"
              }`}
            >
              {env.TEAM_ADMINS_ID || "NO DEFINIDO"}
            </div>
          </div>
        </div>
      </div>

      {/* Test de conexión */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">🌐 Test de Conexión</h2>
          <div className="space-x-2">
            <button
              onClick={testConnection}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Reintentar
            </button>
            <button
              onClick={testEndpointOnly}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Test Health
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionTest.status === "testing"
                  ? "bg-yellow-500 animate-pulse"
                  : connectionTest.status === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="font-medium">
              Estado:{" "}
              {connectionTest.status === "testing"
                ? "Probando conexión..."
                : connectionTest.status === "success"
                ? "Conectado exitosamente"
                : "Error de conexión"}
            </span>
          </div>

          {connectionTest.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h3 className="font-medium text-red-800">❌ Error detectado:</h3>
              <div className="mt-2 text-sm space-y-1">
                <p>
                  <strong>Código:</strong> {connectionTest.error.code}
                </p>
                <p>
                  <strong>Tipo:</strong> {connectionTest.error.type}
                </p>
                <p>
                  <strong>Mensaje:</strong> {connectionTest.error.message}
                </p>
              </div>

              {connectionTest.error.code === 404 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-yellow-800">
                    💡 Posibles soluciones:
                  </h4>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    <li>
                      Verifica que el PROJECT_ID sea correcto:{" "}
                      <code>{env.PROJECT_ID}</code>
                    </li>
                    <li>
                      Asegúrate de que el proyecto exista en Appwrite Console
                    </li>
                    <li>
                      Verifica que la URL del endpoint sea correcta:{" "}
                      <code>{env.ENDPOINT}</code>
                    </li>
                    <li>
                      Confirma que los servicios estén habilitados en el
                      proyecto
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {connectionTest.response && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h3 className="font-medium text-green-800">
                ✅ Respuesta exitosa:
              </h3>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(connectionTest.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Información de configuración del cliente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-800 mb-3">
          ℹ️ Configuración del Cliente SDK
        </h2>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>SDK:</strong> Appwrite Web SDK (Cliente)
          </p>
          <p>
            <strong>Tipo de aplicación:</strong> Frontend/PWA
          </p>
          <p>
            <strong>Autenticación:</strong> Session-based (cookies/localStorage)
          </p>
          <p>
            <strong>Servicios disponibles:</strong> Account, Databases, Teams,
            Storage, Realtime
          </p>
        </div>
      </div>

      {/* URLs para debug manual */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="font-semibold mb-3">🔗 URLs para Debug Manual</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Health Check:</strong>
            <a
              href={`${env.ENDPOINT}/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              {env.ENDPOINT}/health
            </a>
          </div>
          <div>
            <strong>Console del Proyecto:</strong>
            <a
              href={`https://appwrite.racoondevs.com/console/project-${env.PROJECT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              Abrir en Console
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
