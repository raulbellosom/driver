import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
  Shield,
  Database,
  Users,
  Plus,
} from "lucide-react";

export default function SetupGuide() {
  const [copiedText, setCopiedText] = useState("");
  const [completedSteps, setCompletedSteps] = useState({});

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const markStepComplete = (stepId) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const envVars = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_USERS_PROFILE_ID,
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_AVATARS_ID,
    teamAdmins: import.meta.env.VITE_APPWRITE_TEAM_ADMINS_ID,
    teamDrivers: import.meta.env.VITE_APPWRITE_TEAM_DRIVERS_ID,
  };

  const collectionAttributes = [
    { name: "userId", type: "String", size: 50, required: true, array: false },
    {
      name: "role",
      type: "Enum",
      options: ["admin", "driver"],
      required: true,
      default: "driver",
    },
    { name: "name", type: "String", size: 120, required: true, array: false },
    { name: "driver", type: "Boolean", required: true, default: true },
    { name: "enabled", type: "Boolean", required: true, default: true },
    { name: "avatarUrl", type: "URL", required: false, array: false },
    { name: "phone", type: "String", size: 20, required: false, array: false },
    {
      name: "licenseNumber",
      type: "String",
      size: 50,
      required: false,
      array: false,
    },
    { name: "licenseExpiry", type: "DateTime", required: false, array: false },
    {
      name: "companyId",
      type: "String",
      size: 50,
      required: false,
      array: false,
    },
  ];

  const collectionIndexes = [
    { name: "userId_unique", type: "unique", attributes: ["userId"] },
  ];

  const collectionPermissions = [
    {
      type: "Create",
      rules: ["users"],
      description: "Usuarios autenticados pueden crear perfiles",
    },
  ];

  const bucketPermissions = [
    {
      type: "Read",
      rules: ["any"],
      description: "Cualquiera puede ver avatares (público)",
    },
    {
      type: "Create",
      rules: ["users"],
      description: "Usuarios autenticados pueden subir avatares",
    },
    {
      type: "Update",
      rules: ["users"],
      description: "Usuarios autenticados pueden actualizar avatares",
    },
    {
      type: "Delete",
      rules: [`team:${envVars.teamAdmins}`, "users"],
      description: "Admins y propietarios pueden eliminar avatares",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">
          Setup Task 2: Perfiles de Usuario
        </h1>
      </div>

      {/* Estado del proyecto */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">
              Configuración requerida
            </h3>
            <p className="text-sm text-blue-800">
              Sigue estos pasos para configurar completamente la gestión de
              perfiles en Appwrite.
            </p>
          </div>
        </div>
      </div>

      {/* Variables actuales */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-gray-600" />
          Variables de configuración actuales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <span className="font-mono text-xs text-gray-700">{key}:</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-mono text-xs truncate max-w-40 ${
                    value ? "text-gray-800" : "text-red-500"
                  }`}
                >
                  {value || "❌ No configurado"}
                </span>
                {value && (
                  <button
                    onClick={() => copyToClipboard(value, key)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedText === key ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paso 1: Crear colección */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                completedSteps.collection ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {completedSteps.collection ? "✓" : "1"}
            </span>
            Crear colección "users_profile"
          </h2>
          <button
            onClick={() => markStepComplete("collection")}
            className={`px-3 py-1 text-xs rounded ${
              completedSteps.collection
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {completedSteps.collection ? "Completado" : "Marcar como hecho"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-medium text-yellow-800">
              Ir a: Database → {envVars.databaseId} → Create Collection
            </p>
            <p className="text-yellow-700">
              Collection ID:{" "}
              <code className="bg-yellow-100 px-1 rounded">
                {envVars.collectionId}
              </code>
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Atributos (Attributes):</h4>
            <div className="space-y-2">
              {collectionAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center space-x-4">
                    <code className="font-mono font-medium">{attr.name}</code>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {attr.type}
                    </span>
                    {attr.size && (
                      <span className="text-gray-500">({attr.size})</span>
                    )}
                    {attr.required && (
                      <span className="text-red-600 text-xs">required</span>
                    )}
                    {attr.default && (
                      <span className="text-green-600 text-xs">
                        default: {attr.default.toString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Índices (Indexes):</h4>
            <div className="space-y-2">
              {collectionIndexes.map((index, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center space-x-4">
                    <code className="font-mono font-medium">{index.name}</code>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {index.type}
                    </span>
                    <span className="text-gray-500">
                      ({index.attributes.join(", ")})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Configuración:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                • <strong>Display name:</strong> <code>name</code>
              </li>
              <li>
                • <strong>Document security:</strong> ✅ Enabled (permite
                permisos por documento)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Permisos de colección:</h4>
            <div className="space-y-2">
              {collectionPermissions.map((perm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
                >
                  <div className="flex items-center space-x-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                      {perm.type}
                    </span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {perm.rules.join(", ")}
                    </code>
                  </div>
                  <span className="text-gray-600 text-xs">
                    {perm.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Paso 2: Crear bucket */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                completedSteps.bucket ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {completedSteps.bucket ? "✓" : "2"}
            </span>
            Crear bucket "avatars" (opcional)
          </h2>
          <button
            onClick={() => markStepComplete("bucket")}
            className={`px-3 py-1 text-xs rounded ${
              completedSteps.bucket
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {completedSteps.bucket ? "Completado" : "Marcar como hecho"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-medium text-yellow-800">
              Ir a: Storage → Create Bucket
            </p>
            <p className="text-yellow-700">
              Bucket ID:{" "}
              <code className="bg-yellow-100 px-1 rounded">avatars</code>
            </p>
            <p className="text-yellow-600 text-xs mt-1">
              Si no creas este bucket, se usará el de vehículos temporalmente.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Configuración del bucket:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                • <strong>Name:</strong> avatars
              </li>
              <li>
                • <strong>File Security:</strong> ✅ Enabled
              </li>
              <li>
                • <strong>Max file size:</strong> 5MB
              </li>
              <li>
                • <strong>Allowed file extensions:</strong> jpg, jpeg, png, webp
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Permisos del bucket:</h4>
            <div className="space-y-2">
              {bucketPermissions.map((perm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
                >
                  <div className="flex items-center space-x-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                      {perm.type}
                    </span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {perm.rules.join(", ")}
                    </code>
                  </div>
                  <span className="text-gray-600 text-xs">
                    {perm.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Paso 3: Actualizar .env */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                completedSteps.env ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {completedSteps.env ? "✓" : "3"}
            </span>
            Actualizar archivo .env
          </h2>
          <button
            onClick={() => markStepComplete("env")}
            className={`px-3 py-1 text-xs rounded ${
              completedSteps.env
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {completedSteps.env ? "Completado" : "Marcar como hecho"}
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Agrega el ID del bucket de avatares en tu archivo .env:
          </p>
          <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
            VITE_APPWRITE_BUCKET_AVATARS_ID=&lt;BUCKET_ID_AQUI&gt;
          </div>
        </div>
      </div>

      {/* Paso 4: Probar */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                completedSteps.test ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {completedSteps.test ? "✓" : "4"}
            </span>
            Probar funcionalidad
          </h2>
          <button
            onClick={() => markStepComplete("test")}
            className={`px-3 py-1 text-xs rounded ${
              completedSteps.test
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {completedSteps.test ? "Completado" : "Marcar como hecho"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <h4 className="font-medium text-green-800 mb-2">
              ¡Todo listo! Ahora puedes:
            </h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>
                • Registrar nuevos usuarios → se crea perfil automáticamente
              </li>
              <li>
                • Iniciar sesión → perfil se carga automáticamente si no existe
              </li>
              <li>
                • Editar perfiles → persiste en Appwrite con permisos correctos
              </li>
              <li>• Subir avatares → funciona con validaciones</li>
              <li>• Roles diferenciados → admins vs drivers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enlaces útiles */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Enlaces útiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://cloud.appwrite.io/console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 font-medium">Appwrite Console</span>
          </a>
          <a
            href="/profile"
            className="flex items-center space-x-2 p-3 bg-green-50 rounded hover:bg-green-100 transition-colors"
          >
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-green-800 font-medium">Ir a Mi Perfil</span>
          </a>
        </div>
      </div>
    </div>
  );
}
