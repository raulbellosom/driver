import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils";

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Reducer for managing notifications
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

// Provider Component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
  });

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: "info",
      duration: 5000,
      ...notification,
    };

    dispatch({
      type: "ADD_NOTIFICATION",
      payload: newNotification,
    });

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: "REMOVE_NOTIFICATION",
      payload: id,
    });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual Notification Component
const Notification = ({ notification, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success:
      "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400",
  };

  const iconStyles = {
    success: "text-emerald-500 dark:text-emerald-400",
    error: "text-red-500 dark:text-red-400",
    warning: "text-amber-500 dark:text-amber-400",
    info: "text-blue-500 dark:text-blue-400",
  };

  const Icon = icons[notification.type] || icons.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg",
        styles[notification.type]
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", iconStyles[notification.type])} />
        </div>

        <div className="ml-3 w-0 flex-1">
          {notification.title && (
            <p className="text-sm font-medium">{notification.title}</p>
          )}
          {notification.message && (
            <p
              className={cn(
                "text-sm",
                notification.title ? "mt-1 text-opacity-90" : "font-medium"
              )}
            >
              {notification.message}
            </p>
          )}
          {notification.action && (
            <div className="mt-2">{notification.action}</div>
          )}
        </div>

        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:hover:bg-white/5"
            onClick={() => onRemove(notification.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Utility function for quick notifications
export const toast = {
  success: (message, options = {}) => {
    return { type: "success", message, ...options };
  },
  error: (message, options = {}) => {
    return { type: "error", message, ...options };
  },
  warning: (message, options = {}) => {
    return { type: "warning", message, ...options };
  },
  info: (message, options = {}) => {
    return { type: "info", message, ...options };
  },
};

export default NotificationProvider;
