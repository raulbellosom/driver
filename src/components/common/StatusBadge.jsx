import React from "react";
import { cn } from "../../utils";

const StatusBadge = ({ status, text, size = "md", className }) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium";

  const variants = {
    active:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    completed:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    finished: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    maintenance:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    out_of_service:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    retired: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    in_progress:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-sm",
  };

  // Dot indicator
  const dotVariants = {
    active: "bg-emerald-400",
    pending: "bg-amber-400",
    completed: "bg-emerald-400",
    cancelled: "bg-red-400",
    finished: "bg-gray-400",
    maintenance: "bg-amber-400",
    out_of_service: "bg-red-400",
    retired: "bg-gray-400",
    in_progress: "bg-blue-400",
  };

  const statusLabels = {
    active: "Activo",
    pending: "Pendiente",
    completed: "Completado",
    cancelled: "Cancelado",
    finished: "Finalizado",
    maintenance: "Mantenimiento",
    out_of_service: "Fuera de servicio",
    retired: "Retirado",
    in_progress: "En progreso",
  };

  const displayText = text || statusLabels[status] || status;

  return (
    <span
      className={cn(
        baseStyles,
        variants[status] || variants.active,
        sizes[size],
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          dotVariants[status] || dotVariants.active
        )}
      />
      {displayText}
    </span>
  );
};

export default StatusBadge;
