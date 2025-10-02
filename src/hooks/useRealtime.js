import { useState, useEffect } from "react";
import { realtimeManager, notificationManager } from "../lib/realtime";

/**
 * Hook para suscribirse a cambios en tiempo real de una colección
 * Implementación del T7 del Sprint 1
 */
export function useRealtimeCollection(collectionId, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);

  const {
    eventTypes = ["create", "update", "delete"],
    enableNotifications = true,
    onEvent = null,
  } = options;

  useEffect(() => {
    if (!collectionId) return;

    setIsConnected(true);
    setError(null);

    const handler = (event) => {
      setLastEvent(event);

      if (enableNotifications) {
        notificationManager.fromRealtimeEvent(event);
      }

      if (onEvent) {
        onEvent(event);
      }
    };

    let subscriptionKey;

    try {
      subscriptionKey = realtimeManager.subscribe(
        collectionId,
        handler,
        eventTypes
      );
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }

    return () => {
      if (subscriptionKey) {
        realtimeManager.unsubscribe(subscriptionKey);
      }
      setIsConnected(false);
    };
  }, [collectionId, JSON.stringify(eventTypes), enableNotifications, onEvent]);

  return {
    isConnected,
    lastEvent,
    error,
  };
}

/**
 * Hook para suscribirse a un documento específico
 */
export function useRealtimeDocument(collectionId, documentId) {
  const [document, setDocument] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionId || !documentId) return;

    setIsConnected(true);
    setError(null);

    const handler = (event) => {
      if (event.type === "document_update") {
        setDocument(event.document);
      }
    };

    let subscriptionKey;

    try {
      subscriptionKey = realtimeManager.subscribeToDocument(
        collectionId,
        documentId,
        handler
      );
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }

    return () => {
      if (subscriptionKey) {
        realtimeManager.unsubscribe(subscriptionKey);
      }
      setIsConnected(false);
    };
  }, [collectionId, documentId]);

  return {
    document,
    isConnected,
    error,
  };
}

/**
 * Hook para manejar notificaciones
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Suscribirse a cambios de notificaciones
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.read).length);
    });

    // Cargar notificaciones iniciales
    setNotifications(notificationManager.notifications);
    setUnreadCount(notificationManager.getUnread().length);

    return unsubscribe;
  }, []);

  const markAsRead = (id) => {
    notificationManager.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationManager.markAllAsRead();
  };

  const removeNotification = (id) => {
    notificationManager.remove(id);
  };

  const addNotification = (notification) => {
    return notificationManager.add(notification);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
  };
}
