import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useNotifications } from "../hooks/useRealtime";

export default function NotificationSystem() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    markAllAsRead,
  } = useNotifications();

  // Solo mostrar las primeras 5 notificaciones activas
  const activeNotifications = notifications.slice(0, 5);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <>
      {/* Notification Bell (for header) */}
      <NotificationBell count={unreadCount} onClick={markAllAsRead} />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {activeNotifications.map((notification) => (
          <Transition
            key={notification.id}
            as={Fragment}
            show={true}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transform ease-in duration-200 transition"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="translate-x-full opacity-0"
          >
            <div
              className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getBgColor(
                notification.type
              )}`}
            >
              <div className="flex items-start space-x-3">
                {getIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-700">
                    {notification.message}
                  </p>
                  {notification.data && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Marcar como leído"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        ))}
      </div>
    </>
  );
}

// Componente separado para el icono de la campanita
export function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      title={
        count > 0 ? `${count} notificaciones no leídas` : "Sin notificaciones"
      }
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// Panel de notificaciones expandido (opcional)
export function NotificationPanel() {
  const { notifications, markAsRead, markAllAsRead, removeNotification } =
    useNotifications();

  return (
    <div className="max-w-md w-full bg-white border rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Notificaciones
          </h3>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                    )}
                    <p className="text-sm text-gray-700">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
