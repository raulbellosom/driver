import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRechargeCards } from "../../hooks/useFleetManagement";
import { useAuth } from "../../hooks/useAuth";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import StatusBadge from "../common/StatusBadge";
import RechargeCardModal from "./RechargeCardModal";
import RechargeCardItem from "./RechargeCardItem";

const RechargeCardsDashboard = () => {
  const { user } = useAuth();
  const { cards, loading, error, stats, actions } = useRechargeCards({
    companyId: user?.companies?.$id,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtros aplicados
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      !searchTerm ||
      card.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.provider?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || card.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateCard = () => {
    setSelectedCard(null);
    setShowModal(true);
  };

  const handleEditCard = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleCardSaved = () => {
    handleCloseModal();
    actions.refresh();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "blocked":
        return <Lock className="w-5 h-5 text-red-600" />;
      case "lost":
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-blue-600" />;
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar tarjetas
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Tarjetas de Recarga
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona las tarjetas de recarga de combustible y peaje
          </p>
        </div>
        <Button onClick={handleCreateCard} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Tarjeta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <CreditCard className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Activas</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.active}
              </p>
              <p className="text-xs text-green-600">
                {stats.activePercentage}%
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Bloqueadas</p>
              <p className="text-3xl font-bold text-red-900">{stats.blocked}</p>
            </div>
            <Lock className="w-10 h-10 text-red-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Perdidas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.lost}</p>
            </div>
            <XCircle className="w-10 h-10 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar por código o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="blocked">Bloqueada</option>
              <option value="lost">Perdida</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cards List */}
      {filteredCards.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {cards.length === 0
              ? "No hay tarjetas registradas"
              : "No se encontraron tarjetas"}
          </h3>
          <p className="text-gray-500 mb-6">
            {cards.length === 0
              ? "Comienza agregando tu primera tarjeta de recarga"
              : "Intenta ajustar los filtros de búsqueda"}
          </p>
          {cards.length === 0 && (
            <Button
              onClick={handleCreateCard}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Agregar Tarjeta
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <RechargeCardItem
              key={card.$id}
              card={card}
              onEdit={() => handleEditCard(card)}
              onDelete={() => actions.delete(card.$id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <RechargeCardModal
          card={selectedCard}
          onClose={handleCloseModal}
          onSave={handleCardSaved}
        />
      )}
    </div>
  );
};

export default RechargeCardsDashboard;
