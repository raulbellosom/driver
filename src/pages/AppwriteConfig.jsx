import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/auth";
import {
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
  Shield,
  Users,
  Database,
} from "lucide-react";

export default function AppwriteConfig() {
  const [copiedText, setCopiedText] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const envVars = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_USERS_PROFILE_ID,
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_AVATARS_ID,
    teamAdmin: import.meta.env.VITE_APPWRITE_TEAM_ADMIN_ID,
    teamDriver: import.meta.env.VITE_APPWRITE_TEAM_DRIVER_ID,
    teamOperator: import.meta.env.VITE_APPWRITE_TEAM_OPERATOR_ID,
  };

  const permissionConfigs = [
    {
      title: "Colección users_profile",
      type: "collection",
      id: envVars.collectionId,
      permissions: [
        {
          action: "read",
          rule: `team:${envVars.teamAdmin}`,
          description: "Admins pueden leer todos los perfiles",
        },
        {
          action: "read",
          rule: `team:${envVars.teamOperator}`,
          description: "Operadores pueden leer todos los perfiles",
        },
        {
          action: "read",
          rule: "users",
          description: "Usuarios autenticados pueden leer perfiles",
        },
        {
          action: "create",
          rule: "users",
          description: "Usuarios autenticados pueden crear su perfil",
        },
        {
          action: "update",
          rule: `team:${envVars.teamAdmin}`,
          description: "Admins pueden actualizar cualquier perfil",
        },
        {
          action: "update",
          rule: "user:{userId}",
          description: "Usuarios pueden actualizar su propio perfil",
        },
        {
          action: "delete",
          rule: `team:${envVars.teamAdmin}`,
          description: "Solo admins pueden eliminar perfiles",
        },
      ],
    },
    {
      title: "Bucket avatars",
      type: "bucket",
      id: envVars.bucketId,
      permissions: [
        {
          action: "read",
          rule: "any",
          description: "Cualquiera puede ver avatares (público)",
        },
        {
          action: "create",
          rule: "users",
          description: "Usuarios autenticados pueden subir avatares",
        },
        {
          action: "update",
          rule: "users",
          description: "Usuarios autenticados pueden actualizar avatares",
        },
        {
          action: "delete",
          rule: `team:${envVars.teamAdmin}`,
          description: "Solo admins pueden eliminar avatares",
        },
        {
          action: "delete",
          rule: "user:{userId}",
          description: "Usuarios pueden eliminar sus propios avatares",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">
          Configuración de Permisos Appwrite
        </h1>
      </div>

      {/* Estado actual */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Acción requerida</h3>
            <p className="text-sm text-blue-800">
              Para que el sistema funcione correctamente, necesitas configurar
              los permisos en Appwrite Console. Sigue los pasos a continuación.
            </p>
          </div>
        </div>
      </div>

      {/* Variables de entorno */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-gray-600" />
          Variables de configuración
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="font-mono text-xs">{key}:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-gray-600 truncate max-w-32">
                  {value || "No configurado"}
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

      {/* Configuración de permisos */}
      {permissionConfigs.map((config, idx) => (
        <div key={idx} className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              {config.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 font-mono">
                {config.id}
              </span>
              <button
                onClick={() => copyToClipboard(config.id, `${config.type}-id`)}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedText === `${config.type}-id` ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {config.permissions.map((perm, permIdx) => (
              <div
                key={permIdx}
                className="border-l-4 border-blue-200 pl-4 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {perm.action}
                    </span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {perm.rule}
                    </code>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(perm.rule, `${permIdx}-rule`)
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedText === `${permIdx}-rule` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{perm.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Instrucciones */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Pasos para configurar</h2>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              1
            </span>
            <div>
              <p className="font-medium">Abrir Appwrite Console</p>
              <p className="text-gray-600">
                Ve a tu proyecto en Appwrite Console
              </p>
              <a
                href="https://cloud.appwrite.io/console"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-1"
              >
                Abrir Console <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </li>

          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              2
            </span>
            <div>
              <p className="font-medium">Configurar Colección</p>
              <p className="text-gray-600">
                Ve a Database → Tu Base de Datos → Colección "users_profile" →
                Settings → Permissions
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Agrega los permisos mostrados arriba para cada acción (read,
                create, update, delete)
              </p>
            </div>
          </li>

          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
            <div>
              <p className="font-medium">Configurar Storage</p>
              <p className="text-gray-600">
                Ve a Storage → Bucket "avatars" → Settings → Permissions
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Configura los permisos para permitir subida y lectura de
                avatares
              </p>
            </div>
          </li>

          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              ✓
            </span>
            <div>
              <p className="font-medium">Probar funcionalidad</p>
              <p className="text-gray-600">
                Regresa a la aplicación y prueba crear/editar perfiles y subir
                avatares
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Estado del usuario actual */}
      {profile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">
                Usuario autenticado
              </h3>
              <p className="text-sm text-green-800">
                Estás conectado como: <strong>{profile.name}</strong> (
                {profile.role})
              </p>
              <p className="text-xs text-green-700 mt-1">
                ID de usuario:{" "}
                <code className="bg-green-100 px-1 rounded">
                  {profile.userId}
                </code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
