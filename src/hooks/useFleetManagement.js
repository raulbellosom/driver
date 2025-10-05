import { useState, useEffect, useCallback, useMemo } from "react";
import {
  vehicleOdometers,
  rechargeCards,
  rechargeMovements,
} from "../api/fleet-management";

// ===============================
// VEHICLE ODOMETERS HOOK
// ===============================

export function useVehicleOdometers(vehicleId, options = {}) {
  const { autoLoad = true, limit = 50 } = options;

  const [odometers, setOdometers] = useState([]);
  const [latest, setLatest] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOdometers = useCallback(async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar lecturas y estadísticas en paralelo
      const [readingsResult, latestResult, statsResult] = await Promise.all([
        vehicleOdometers.getByVehicle(vehicleId, { limit }),
        vehicleOdometers.getLatestByVehicle(vehicleId),
        vehicleOdometers.getVehicleStats(vehicleId),
      ]);

      setOdometers(readingsResult.data);
      setLatest(latestResult.data);
      setStats(statsResult.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, limit]);

  const addReading = useCallback(
    async (odometerData) => {
      try {
        setLoading(true);
        const result = await vehicleOdometers.create({
          ...odometerData,
          vehicleId,
        });

        // Actualizar estado local
        setOdometers((prev) => [result.data, ...prev]);
        setLatest(result.data);

        // Recargar estadísticas
        const statsResult = await vehicleOdometers.getVehicleStats(vehicleId);
        setStats(statsResult.data);

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [vehicleId]
  );

  useEffect(() => {
    if (autoLoad && vehicleId) {
      loadOdometers();
    }
  }, [autoLoad, vehicleId, loadOdometers]);

  return {
    odometers,
    latest,
    stats,
    loading,
    error,
    actions: {
      refresh: loadOdometers,
      addReading,
    },
  };
}

// ===============================
// RECHARGE CARDS HOOK
// ===============================

export function useRechargeCards(options = {}) {
  const {
    autoLoad = true,
    includeDisabled = false,
    companyId = null,
    status = null,
  } = options;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await rechargeCards.getAll({
        includeDisabled,
        companyId,
        status,
      });
      setCards(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [includeDisabled, companyId, status]);

  const createCard = useCallback(async (cardData) => {
    try {
      setLoading(true);
      const result = await rechargeCards.create(cardData);
      setCards((prev) => [result.data, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCard = useCallback(async (cardId, cardData) => {
    try {
      setLoading(true);
      const result = await rechargeCards.update(cardId, cardData);
      setCards((prev) =>
        prev.map((card) => (card.$id === cardId ? result.data : card))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCard = useCallback(async (cardId) => {
    try {
      setLoading(true);
      await rechargeCards.delete(cardId);
      setCards((prev) => prev.filter((card) => card.$id !== cardId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadCards();
    }
  }, [autoLoad, loadCards]);

  // Memoized computed values
  const cardStats = useMemo(() => {
    const total = cards.length;
    const active = cards.filter((c) => c.status === "active").length;
    const blocked = cards.filter((c) => c.status === "blocked").length;
    const lost = cards.filter((c) => c.status === "lost").length;

    return {
      total,
      active,
      blocked,
      lost,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [cards]);

  return {
    cards,
    loading,
    error,
    stats: cardStats,
    actions: {
      refresh: loadCards,
      create: createCard,
      update: updateCard,
      delete: deleteCard,
    },
  };
}

// ===============================
// RECHARGE MOVEMENTS HOOK
// ===============================

export function useRechargeMovements(cardId, options = {}) {
  const { autoLoad = true, limit = 50 } = options;

  const [movements, setMovements] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMovements = useCallback(async () => {
    if (!cardId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar movimientos y balance en paralelo
      const [movementsResult, balanceResult] = await Promise.all([
        rechargeMovements.getByCard(cardId, { limit }),
        rechargeMovements.getCardBalance(cardId),
      ]);

      setMovements(movementsResult.data);
      setBalance(balanceResult.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cardId, limit]);

  const addMovement = useCallback(
    async (movementData) => {
      try {
        setLoading(true);
        const result = await rechargeMovements.create({
          ...movementData,
          cardId,
        });

        // Actualizar estado local
        setMovements((prev) => [result.data, ...prev]);

        // Recalcular balance
        const balanceResult = await rechargeMovements.getCardBalance(cardId);
        setBalance(balanceResult.data);

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cardId]
  );

  const topupCard = useCallback(
    async (amount, options = {}) => {
      return rechargeMovements
        .topupCard(cardId, amount, options)
        .then((result) => {
          // Refresh local state
          loadMovements();
          return result;
        });
    },
    [cardId, loadMovements]
  );

  const spendCard = useCallback(
    async (amount, options = {}) => {
      return rechargeMovements
        .spendCard(cardId, amount, options)
        .then((result) => {
          // Refresh local state
          loadMovements();
          return result;
        });
    },
    [cardId, loadMovements]
  );

  useEffect(() => {
    if (autoLoad && cardId) {
      loadMovements();
    }
  }, [autoLoad, cardId, loadMovements]);

  return {
    movements,
    balance,
    loading,
    error,
    actions: {
      refresh: loadMovements,
      addMovement,
      topup: topupCard,
      spend: spendCard,
    },
  };
}

// ===============================
// CARD BALANCE HOOK (Lightweight)
// ===============================

export function useCardBalance(cardId) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBalance = useCallback(async () => {
    if (!cardId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await rechargeMovements.getCardBalance(cardId);
      setBalance(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    if (cardId) {
      loadBalance();
    }
  }, [cardId, loadBalance]);

  return {
    balance,
    loading,
    error,
    refresh: loadBalance,
  };
}
