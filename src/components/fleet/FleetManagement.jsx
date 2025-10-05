import React, { useState } from "react";
import {
  Truck,
  CreditCard,
  Gauge,
  Settings,
  BarChart3,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import VehiclesDashboard from "./VehiclesDashboard";
import RechargeCardsDashboard from "./RechargeCardsDashboard";
import FleetCatalogManagement from "./FleetCatalogManagement";

const FleetManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("vehicles");

  const tabs = [
    {
      id: "vehicles",
      name: "Vehículos",
      icon: Truck,
      component: VehiclesDashboard,
      description: "Gestión de la flota vehicular",
    },
    {
      id: "cards",
      name: "Tarjetas",
      icon: CreditCard,
      component: RechargeCardsDashboard,
      description: "Tarjetas de recarga y peaje",
    },
    {
      id: "catalogs",
      name: "Catálogos",
      icon: Settings,
      component: FleetCatalogManagement,
      description: "Marcas, modelos y tipos",
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                Gestión de Flota
              </h1>
              <p className="text-gray-600 mt-2">
                Administra vehículos, tarjetas de recarga y catálogos de tu
                empresa
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reportes
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Acceso Rápido
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <Card className="p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:block">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Quick Stats Overview */}
        {activeTab === "vehicles" && <QuickStatsOverview />}

        {/* Active Component */}
        <div className="space-y-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

// Componente de estadísticas rápidas
const QuickStatsOverview = () => {
  return (
    <div className="mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Resumen de Flota
          </h2>
          <Button variant="outline" size="sm">
            Ver Todo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">--</p>
            <p className="text-sm text-blue-600">Vehículos Totales</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <p className="text-2xl font-bold text-green-900">--</p>
            <p className="text-sm text-green-600">Activos</p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Settings className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">--</p>
            <p className="text-sm text-yellow-600">En Mantenimiento</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">--</p>
            <p className="text-sm text-purple-600">Tarjetas Activas</p>
          </div>

          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <Gauge className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-900">--</p>
            <p className="text-sm text-indigo-600">Km del Mes</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FleetManagement;
