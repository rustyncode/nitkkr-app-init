// ─── useNotificationTracker Hook ────────────────────────────
//
// Polls the backend /digest endpoint on mount (app open) to
// check for new NIT KKR notifications. If new items are found,
// fires a local system notification automatically.
//
// Usage:
//   const { status, newCount, lastCheck, refresh } = useNotificationTracker();
//
// The hook:
//   1. Runs checkForNewNotifications() on mount (once)
//   2. Exposes a manual refresh() for pull-to-refresh / button
//   3. Provides status + stats for UI display
//   4. Respects cooldown (won't spam the backend)

import { useState, useEffect, useCallback, useRef } from "react";
import {
  checkForNewNotifications,
  forcePoll,
  getTrackerStats,
} from "../utils/notificationTracker";

// ─── Status constants ───────────────────────────────────────

const STATUS = {
  IDLE: "idle",
  CHECKING: "checking",
  NEW_FOUND: "new_found",
  NO_CHANGE: "no_change",
  ERROR: "error",
  SKIPPED: "skipped",
  FIRST_SYNC: "first_sync",
};

// ─── Hook ───────────────────────────────────────────────────

export default function useNotificationTracker({ autoCheck = true } = {}) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [newCount, setNewCount] = useState(0);
  const [newItems, setNewItems] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Prevent double-mount in React strict mode
  const hasCheckedRef = useRef(false);

  // ─── Core check function ────────────────────────────────────

  const runCheck = useCallback(async (force = false) => {
    setStatus(STATUS.CHECKING);
    setError(null);

    try {
      const result = force
        ? await forcePoll()
        : await checkForNewNotifications();

      if (result.skipped) {
        setStatus(STATUS.SKIPPED);
        return result;
      }

      if (result.error) {
        setStatus(STATUS.ERROR);
        setError(result.error);
        return result;
      }

      if (result.isFirstSync) {
        setStatus(STATUS.FIRST_SYNC);
        setNewCount(0);
        setNewItems([]);
      } else if (result.hasNew) {
        setStatus(STATUS.NEW_FOUND);
        setNewCount(result.newCount);
        setNewItems(result.newItems || []);
      } else {
        setStatus(STATUS.NO_CHANGE);
        setNewCount(0);
        setNewItems([]);
      }

      setLastCheck(new Date().toISOString());

      // Refresh stats after check
      try {
        const freshStats = await getTrackerStats();
        setStats(freshStats);
      } catch {
        // Stats are optional — don't fail the whole check
      }

      return result;
    } catch (err) {
      console.error("[useNotifTracker] Check failed:", err.message);
      setStatus(STATUS.ERROR);
      setError(err.message);
      return {
        checked: false,
        hasNew: false,
        newCount: 0,
        error: err.message,
      };
    }
  }, []);

  // ─── Manual refresh (bypasses cooldown) ─────────────────────

  const refresh = useCallback(() => {
    return runCheck(true);
  }, [runCheck]);

  // ─── Load stats ─────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const s = await getTrackerStats();
      setStats(s);
      return s;
    } catch {
      return null;
    }
  }, []);

  // ─── Auto-check on mount ────────────────────────────────────

  useEffect(() => {
    if (!autoCheck) return;
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Small delay so the app has time to render first
    const timer = setTimeout(() => {
      runCheck(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoCheck, runCheck]);

  // ─── Load stats on mount ────────────────────────────────────

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ─── Return ─────────────────────────────────────────────────

  return {
    // Current state
    status,
    isChecking: status === STATUS.CHECKING,
    hasNew: status === STATUS.NEW_FOUND,
    newCount,
    newItems,
    lastCheck,
    error,
    stats,

    // Actions
    refresh,
    loadStats,

    // Constants for external use
    STATUS,
  };
}

export { STATUS };
