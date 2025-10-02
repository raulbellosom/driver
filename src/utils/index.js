import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatters = {
  // Formatear fecha y hora
  dateTime: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  },

  // Formatear solo fecha
  date: (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  },

  // Formatear moneda
  currency: (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  },

  // Formatear distancia
  distance: (km) => {
    if (!km) return "-";
    return `${km.toLocaleString("es-MX")} km`;
  },

  // Formatear tiempo relativo
  timeAgo: (date) => {
    if (!date) return "-";
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatters.date(date);
  },
};

export const validators = {
  // Validar email
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar teléfono mexicano
  phone: (phone) => {
    const phoneRegex = /^(\+52\s?)?(\d{10})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  // Validar RFC
  rfc: (rfc) => {
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc.toUpperCase());
  },

  // Validar placa vehicular
  plate: (plate) => {
    // Formato mexicano: ABC-123-D o ABC-12-34
    const plateRegex = /^[A-Z]{3}-?\d{2,3}-?[A-Z0-9]{1,2}$/;
    return plateRegex.test(plate.toUpperCase().replace(/\s/g, ""));
  },

  // Validar VIN
  vin: (vin) => {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  },
};

export const constants = {
  // Estados de vehículos
  VEHICLE_STATES: {
    ACTIVE: { value: "active", label: "Activo", color: "success" },
    MAINTENANCE: {
      value: "maintenance",
      label: "Mantenimiento",
      color: "warning",
    },
    OUT_OF_SERVICE: {
      value: "out_of_service",
      label: "Fuera de servicio",
      color: "danger",
    },
    RETIRED: { value: "retired", label: "Retirado", color: "gray" },
  },

  // Estados de viajes
  TRIP_STATES: {
    PENDING: { value: "pending", label: "Pendiente", color: "warning" },
    IN_PROGRESS: {
      value: "in_progress",
      label: "En progreso",
      color: "primary",
    },
    COMPLETED: { value: "completed", label: "Completado", color: "success" },
    CANCELLED: { value: "cancelled", label: "Cancelado", color: "danger" },
  },

  // Tipos de combustible
  FUEL_TYPES: {
    GASOLINE: { value: "gasoline", label: "Gasolina" },
    DIESEL: { value: "diesel", label: "Diésel" },
    GAS: { value: "gas", label: "Gas LP" },
    ELECTRIC: { value: "electric", label: "Eléctrico" },
    HYBRID: { value: "hybrid", label: "Híbrido" },
  },

  // Roles de usuario
  USER_ROLES: {
    ADMIN: { value: "admin", label: "Administrador" },
    DRIVER: { value: "driver", label: "Conductor" },
    DISPATCHER: { value: "dispatcher", label: "Despachador" },
    FINANCE: { value: "finance", label: "Finanzas" },
  },

  // Colores del sistema (basados en la paleta DriverPro)
  COLORS: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6", // primary
      600: "#2563eb", // primary-dark
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    success: {
      500: "#10b981",
      600: "#059669",
    },
    warning: {
      500: "#f59e0b",
      600: "#d97706",
    },
    danger: {
      500: "#ef4444",
      600: "#dc2626",
    },
  },
};
