import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Plus,
  Minus,
  Activity,
  Shield,
  ShieldOff,
} from "lucide-react";
import { useCardBalance } from "../../hooks/useFleetManagement";
import Card from "../common/Card";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

const RechargeCardItem = ({ card, onEdit, onDelete, onView }) => {
  const { balance, loading: balanceLoading } = useCardBalance(card.$id);
  const [showBalance, setShowBalance] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return { variant: "success", label: "Activa", icon: Shield };
      case "blocked":
        return { variant: "danger", label: "Bloqueada", icon: ShieldOff };
      case "lost":
        return { variant: "secondary", label: "Perdida", icon: AlertTriangle };
      default:
        return { variant: "primary", label: status, icon: CreditCard };
    }
  };

  const getProviderConfig = (provider) => {
    switch (provider) {
      case "parkia":
        return {
          label: "Parkia",
          color: "bg-blue-100 text-blue-800",
          icon: "🅿️",
        };
      case "rfid":
        return {
          label: "RFID",
          color: "bg-purple-100 text-purple-800",
          icon: "📡",
        };
      case "other":
        return {
          label: "Otro",
          color: "bg-gray-100 text-gray-800",
          icon: "💳",
        };
      default:
        return {
          label: provider,
          color: "bg-gray-100 text-gray-800",
          icon: "💳",
        };
    }
  };

  const statusConfig = getStatusConfig(card.status);
  const providerConfig = getProviderConfig(card.provider);
  const StatusIcon = statusConfig.icon;

  const isLowBalance = balance?.balance !== null && balance?.balance < 100;
  const isNegativeBalance = balance?.balance !== null && balance?.balance < 0;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isNegativeBalance
          ? "ring-2 ring-red-200"
          : isLowBalance
          ? "ring-2 ring-yellow-200"
          : ""
      }`}
    >
      {/* Alert indicator */}
      {(isLowBalance || isNegativeBalance) && (
        <div
          className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium rounded-bl-lg flex items-center gap-1 ${
            isNegativeBalance
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-white"
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          {isNegativeBalance ? "Negativo" : "Saldo bajo"}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white font-mono text-sm">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-mono">
                {card.code}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${providerConfig.color}`}
                >
                  <span className="mr-1">{providerConfig.icon}</span>
                  {providerConfig.label}
                </span>
              </div>
            </div>
          </div>
          <StatusBadge variant={statusConfig.variant} size="sm">
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </StatusBadge>
        </div>

        {/* Balance Section */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Saldo Disponible
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-xs px-2 py-1 h-auto"
            >
              {showBalance ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>
          </div>

          {balanceLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Cargando...</span>
            </div>
          ) : showBalance && balance ? (
            <div>
              <div
                className={`text-2xl font-bold ${
                  isNegativeBalance
                    ? "text-red-600"
                    : isLowBalance
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                ${balance.balance?.toLocaleString()} {balance.currency}
              </div>
              {balance.lastMovement && (
                <div className="text-xs text-gray-500 mt-1">
                  Último movimiento:{" "}
                  {new Date(balance.lastMovement.at).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 font-mono">****.**</div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {card.allowNegative && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Permite saldo negativo</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {balance?.totalMovements || 0} movimientos
            </span>
          </div>

          {card.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 text-xs">
                Creada: {new Date(card.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {card.status === "active" && showBalance && (
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1 text-green-600 hover:bg-green-50"
            >
              <Plus className="w-4 h-4" />
              Recargar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50"
            >
              <Activity className="w-4 h-4" />
              Historial
            </Button>
          </div>
        )}

        {/* Main Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(card)}
            className="flex-1 flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(card)}
            className="flex-1 flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(card)}
            className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Helper component for eye off icon
const EyeOff = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

export default RechargeCardItem;
