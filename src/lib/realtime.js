import { client } from "../lib/appwrite";
import { env } from "../lib/env";

// ==========================================
// REALTIME SUBSCRIPTIONS & NOTIFICATIONS
// ==========================================

/**
 * Configuración base para Realtime de Appwrite
 * Según T7 del Sprint 1: suscripción a cambios de vehicle_brands y vehicle_models
 */

export class RealtimeManager {
  constructor() {
    this.subscriptions = new Map();
    this.eventHandlers = new Map();
  }

  /**
   * Suscribirse a una colección específica
   * @param {string} collectionId - ID de la colección
   * @param {function} onEvent - Callback para manejar eventos
   * @param {Array} eventTypes - Tipos de eventos ['databases.*.collections.*.documents.*']
   */
  subscribe(
    collectionId,
    onEvent,
    eventTypes = ["create", "update", "delete"]
  ) {
    const channel = `databases.${env.DB_ID}.collections.${collectionId}.documents`;

    console.log(`[Realtime] Subscribing to: ${channel}`);

    const unsubscribe = client.subscribe(channel, (response) => {
      const { events, payload } = response;

      console.log("[Realtime] Event received:", { events, payload });

      // Determinar tipo de evento
      let eventType = "unknown";
      if (events.includes(`${channel}.*.create`)) eventType = "create";
      else if (events.includes(`${channel}.*.update`)) eventType = "update";
      else if (events.includes(`${channel}.*.delete`)) eventType = "delete";

      // Llamar handler si está habilitado
      if (eventTypes.includes(eventType) || eventTypes.includes("*")) {
        onEvent({
          type: eventType,
          collection: collectionId,
          document: payload,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Guardar referencia para poder cancelar después
    const subscriptionKey = `${collectionId}:${Date.now()}`;
    this.subscriptions.set(subscriptionKey, unsubscribe);

    return subscriptionKey;
  }

  /**
   * Cancelar suscripción específica
   */
  unsubscribe(subscriptionKey) {
    const unsubscribe = this.subscriptions.get(subscriptionKey);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log(`[Realtime] Unsubscribed: ${subscriptionKey}`);
    }
  }

  /**
   * Cancelar todas las suscripciones
   */
  unsubscribeAll() {
    for (const [key, unsubscribe] of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.clear();
    console.log("[Realtime] All subscriptions cancelled");
  }

  /**
   * Suscribirse a un documento específico
   * Útil para actualización en tiempo real de formularios
   */
  subscribeToDocument(collectionId, documentId, onEvent) {
    const channel = `databases.${env.DB_ID}.collections.${collectionId}.documents.${documentId}`;

    const unsubscribe = client.subscribe(channel, (response) => {
      onEvent({
        type: "document_update",
        collection: collectionId,
        documentId,
        document: response.payload,
        timestamp: new Date().toISOString(),
      });
    });

    const subscriptionKey = `${collectionId}:${documentId}`;
    this.subscriptions.set(subscriptionKey, unsubscribe);

    return subscriptionKey;
  }
}

// Instancia global del manager
export const realtimeManager = new RealtimeManager();

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

export class NotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.maxNotifications = 50;
  }

  /**
   * Agregar nueva notificación
   */
  add(notification) {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    this.notifications.unshift(newNotification);

    // Mantener límite máximo
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Notificar listeners
    this._notifyListeners();

    // Auto-remove para notificaciones temporales
    if (notification.autoRemove !== false) {
      setTimeout(() => this.remove(id), notification.duration || 5000);
    }

    return id;
  }

  /**
   * Remover notificación
   */
  remove(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this._notifyListeners();
  }

  /**
   * Marcar como leída
   */
  markAsRead(id) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this._notifyListeners();
    }
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this._notifyListeners();
  }

  /**
   * Obtener notificaciones no leídas
   */
  getUnread() {
    return this.notifications.filter((n) => !n.read);
  }

  /**
   * Suscribirse a cambios de notificaciones
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  _notifyListeners() {
    this.listeners.forEach((callback) => callback(this.notifications));
  }

  /**
   * Crear notificación desde evento de Realtime
   */
  fromRealtimeEvent(event) {
    let message = "";
    let type = "info";

    switch (event.type) {
      case "create":
        message = `Nuevo elemento creado en ${event.collection}`;
        type = "success";
        break;
      case "update":
        message = `Elemento actualizado en ${event.collection}`;
        type = "info";
        break;
      case "delete":
        message = `Elemento eliminado de ${event.collection}`;
        type = "warning";
        break;
      default:
        message = `Cambio en ${event.collection}`;
    }

    return this.add({
      type,
      title: "Actualización en tiempo real",
      message,
      data: event,
    });
  }
}

// Instancia global del manager de notificaciones
export const notificationManager = new NotificationManager();

// ==========================================
// INTEGRATION HELPERS
// ==========================================

/**
 * Configurar Realtime + Notificaciones para una colección
 * Según T7 del Sprint 1
 */
export function setupCollectionSync(collectionId, options = {}) {
  const {
    enableNotifications = true,
    eventTypes = ["create", "update", "delete"],
    customHandler = null,
  } = options;

  const handler = (event) => {
    if (enableNotifications) {
      notificationManager.fromRealtimeEvent(event);
    }

    if (customHandler) {
      customHandler(event);
    }
  };

  return realtimeManager.subscribe(collectionId, handler, eventTypes);
}

/**
 * Hook personalizado para usar en React (se implementará en hooks/)
 */
export function createRealtimeHook(collectionId) {
  return function useRealtimeCollection() {
    // Este se implementará como hook de React
    // Por ahora devolvemos la estructura base
    return {
      subscribe: (handler) => realtimeManager.subscribe(collectionId, handler),
      unsubscribe: (key) => realtimeManager.unsubscribe(key),
      isConnected: true, // TODO: implementar estado de conexión real
    };
  };
}

// ==========================================
// RECONNECTION LOGIC
// ==========================================

/**
 * Manejo de reconexión automática
 * Importante para PWAs que pueden perder conexión
 */
export class ReconnectionManager {
  constructor(realtimeManager) {
    this.realtimeManager = realtimeManager;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000; // Start with 1 second
    this.isReconnecting = false;

    this.setupConnectionMonitoring();
  }

  setupConnectionMonitoring() {
    // Monitor network status
    window.addEventListener("online", () => {
      console.log("[Realtime] Network back online, reconnecting...");
      this.handleReconnection();
    });

    window.addEventListener("offline", () => {
      console.log("[Realtime] Network offline");
      this.isReconnecting = true;
    });
  }

  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[Realtime] Max reconnection attempts reached");
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    setTimeout(() => {
      // Resubscribe to all active channels
      // En una implementación completa, guardaríamos el estado de las suscripciones
      console.log(`[Realtime] Reconnection attempt ${this.reconnectAttempts}`);

      // Exponential backoff
      this.reconnectInterval *= 2;

      this.isReconnecting = false;
    }, this.reconnectInterval);
  }

  reset() {
    this.reconnectAttempts = 0;
    this.reconnectInterval = 1000;
    this.isReconnecting = false;
  }
}

// Instancia global del manager de reconexión
export const reconnectionManager = new ReconnectionManager(realtimeManager);
