import React, { useState } from "react";
import {
  Tag,
  Package,
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
} from "lucide-react";
import {
  useVehicleBrands,
  useVehicleTypes,
  useVehicleModels,
} from "../../hooks/useVehicles";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import StatusBadge from "../common/StatusBadge";
import CatalogModal from "./CatalogModal";

const FleetCatalogManagement = () => {
  const {
    brands,
    loading: brandsLoading,
    actions: brandActions,
  } = useVehicleBrands();
  const {
    types,
    loading: typesLoading,
    actions: typeActions,
  } = useVehicleTypes();
  const {
    models,
    loading: modelsLoading,
    actions: modelActions,
  } = useVehicleModels();

  const [activeTab, setActiveTab] = useState("brands");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    {
      id: "brands",
      name: "Marcas",
      icon: Tag,
      data: brands,
      actions: brandActions,
      loading: brandsLoading,
    },
    {
      id: "types",
      name: "Tipos",
      icon: Package,
      data: types,
      actions: typeActions,
      loading: typesLoading,
    },
    {
      id: "models",
      name: "Modelos",
      icon: Car,
      data: models,
      actions: modelActions,
      loading: modelsLoading,
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  // Filtrar datos según búsqueda
  const filteredData = activeTabData.data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (
      window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)
    ) {
      try {
        await activeTabData.actions.delete(item.$id);
      } catch (error) {
        alert("Error al eliminar el elemento: " + error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleItemSaved = () => {
    handleCloseModal();
    activeTabData.actions.refresh();
  };

  const getCatalogConfig = (catalogType) => {
    switch (catalogType) {
      case "brands":
        return {
          title: "Marcas de Vehículos",
          description: "Gestiona las marcas disponibles para los vehículos",
          createLabel: "Nueva Marca",
          emptyTitle: "No hay marcas registradas",
          emptyDescription:
            "Comienza agregando las marcas de vehículos que maneja tu empresa",
        };
      case "types":
        return {
          title: "Tipos de Vehículos",
          description:
            "Categoriza los tipos de vehículos (sedan, SUV, camión, etc.)",
          createLabel: "Nuevo Tipo",
          emptyTitle: "No hay tipos registrados",
          emptyDescription:
            "Agrega los tipos de vehículos para mejor organización",
        };
      case "models":
        return {
          title: "Modelos de Vehículos",
          description: "Administra los modelos específicos de cada marca",
          createLabel: "Nuevo Modelo",
          emptyTitle: "No hay modelos registrados",
          emptyDescription:
            "Registra los modelos específicos de las marcas de vehículos",
        };
      default:
        return {};
    }
  };

  const config = getCatalogConfig(activeTab);

  if (activeTabData.loading && activeTabData.data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Catálogos de Flota
          </h1>
          <p className="text-gray-500 mt-1">
            Administra marcas, tipos y modelos de vehículos
          </p>
        </div>
      </div>

      {/* Tabs */}
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
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
                <StatusBadge
                  variant={isActive ? "info" : "secondary"}
                  size="sm"
                  className="ml-2"
                >
                  {tab.data.length}
                </StatusBadge>
              </button>
            );
          })}
        </nav>
      </Card>

      {/* Current Tab Content */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {config.title}
            </h2>
            <p className="text-gray-500">{config.description}</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {config.createLabel}
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            icon={Search}
            placeholder={`Buscar ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Content */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTabData.data.length === 0
                ? config.emptyTitle
                : "No se encontraron resultados"}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTabData.data.length === 0
                ? config.emptyDescription
                : "Intenta con una búsqueda diferente"}
            </p>
            {activeTabData.data.length === 0 && (
              <Button
                onClick={handleCreate}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                {config.createLabel}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((item) => (
              <CatalogItem
                key={item.$id}
                item={item}
                type={activeTab}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <CatalogModal
          type={activeTab}
          item={selectedItem}
          onClose={handleCloseModal}
          onSave={handleItemSaved}
        />
      )}
    </div>
  );
};

// Componente para cada item del catálogo
const CatalogItem = ({ item, type, onEdit, onDelete }) => {
  const getTypeSpecificInfo = () => {
    switch (type) {
      case "brands":
        return {
          subtitle: `${item.vehicleModels?.length || 0} modelos`,
          icon: Tag,
        };
      case "types":
        return {
          subtitle: item.description || "Sin descripción",
          icon: Package,
        };
      case "models":
        return {
          subtitle: `${item.brand?.name || "Sin marca"} ${
            item.year ? `(${item.year})` : ""
          }`,
          icon: Car,
        };
      default:
        return { subtitle: "", icon: Package };
    }
  };

  const { subtitle, icon: ItemIcon } = getTypeSpecificInfo();

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <ItemIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {type === "types" && item.vehicleModels && (
            <p className="text-xs text-gray-400">
              {item.vehicleModels.length} modelos asociados
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge variant={item.enabled ? "success" : "secondary"} size="sm">
          {item.enabled ? "Activo" : "Inactivo"}
        </StatusBadge>

        <Button variant="outline" size="sm" onClick={onEdit} className="px-3">
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FleetCatalogManagement;
