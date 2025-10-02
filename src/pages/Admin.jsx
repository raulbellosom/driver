import { Link } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import {
  Shield,
  Users,
  Building,
  Car,
  FileText,
  Settings,
  Database,
  HardDrive,
} from "lucide-react";

export default function Admin() {
  const { profile, can } = useRole();

  const adminCards = [
    {
      title: "Gestión de Usuarios",
      description: "Crear, editar y administrar usuarios del sistema",
      icon: Users,
      link: "/admin/users",
      color: "blue",
    },
    {
      title: "Empresas",
      description: "Gestionar empresas y sus configuraciones",
      icon: Building,
      link: "/admin/companies",
      color: "green",
    },
    {
      title: "Vehículos",
      description: "Administrar marcas, modelos y vehículos",
      icon: Car,
      link: "/admin/vehicles",
      color: "purple",
    },
    {
      title: "Reportes",
      description: "Ver reportes del sistema y estadísticas",
      icon: FileText,
      link: "/admin/reports",
      color: "orange",
    },
    {
      title: "Almacenamiento",
      description: "Gestionar buckets y archivos del sistema",
      icon: HardDrive,
      link: "/admin/storage",
      color: "indigo",
    },
    {
      title: "Configuración",
      description: "Configuraciones generales del sistema",
      icon: Settings,
      link: "/admin/settings",
      color: "gray",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900",
      green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-900",
      purple:
        "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900",
      orange:
        "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900",
      indigo:
        "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900",
      gray: "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900",
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel Administrativo
          </h1>
          <p className="text-gray-600">
            Bienvenido, <span className="font-medium">{profile?.name}</span>
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sistema</p>
              <p className="text-lg font-bold text-green-600">Activo</p>
            </div>
            <Database className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tu Rol</p>
              <p className="text-lg font-bold text-blue-600">Administrador</p>
            </div>
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teams</p>
              <p className="text-lg font-bold text-purple-600">dp_admins</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permisos</p>
              <p className="text-lg font-bold text-orange-600">Completo</p>
            </div>
            <Settings className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className={`block p-6 rounded-lg border-2 transition-all duration-200 ${getColorClasses(
                card.color
              )}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm opacity-80">{card.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Development Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-yellow-600" />
          <h3 className="font-medium text-yellow-900">
            Desarrollo en Progreso
          </h3>
        </div>
        <p className="text-sm text-yellow-800 mt-2">
          Algunas funcionalidades están aún en desarrollo. La gestión de
          usuarios ya está disponible.
        </p>
      </div>
    </div>
  );
}
