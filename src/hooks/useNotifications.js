import { useState, useEffect, useRef, useCallback } from "react";
import {
  isNotificationsAvailable,
  registerForPushNotifications,
  addNotificationListeners,
  getPermissionStatus,
  requestPermissionWithExplanation,
  clearBadge,
  getLastNotificationResponse,
} from "../utils/notifications";

// ─── useNotifications Hook ──────────────────────────────────
//
// Manages the full notification lifecycle:
//   • Registers for push notifications on mount
//   • Listens for foreground notifications and user taps
//   • Tracks permission status and push token
//   • Handles cold-start notification responses
//   • Provides methods to request permission and check status
//
// Fully graceful in Expo Go where push notifications are unavailable.
// All errors are silently caught — the app works fine without push.

export default function useNotifications({ onTapped } = {}) {
  // ─── State ──────────────────────────────────────────────────

  const [pushToken, setPushToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("undetermined");
  const [lastNotification, setLastNotification] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Keep the onTapped callback in a ref so listener doesn't go stale
  const onTappedRef = useRef(onTapped);
  useEffect(() => {
    onTappedRef.current = onTapped;
  }, [onTapped]);

  // ─── Register and set up listeners on mount ────────────────

  useEffect(() => {
    let cleanupListeners = null;
    let isMounted = true;

    async function init() {
      // Skip entirely if notifications module isn't available
      if (!isNotificationsAvailable()) {
        if (isMounted) {
          setPermissionStatus("unavailable");
        }
        return;
      }

      try {
        // Check current permission status
        const status = await getPermissionStatus();
        if (isMounted) {
          setPermissionStatus(status);
        }

        // Register for push notifications (requests permission if needed)
        const token = await registerForPushNotifications();
        if (isMounted && token) {
          setPushToken(token);
        }

        // Re-check permission after registration attempt
        const updatedStatus = await getPermissionStatus();
        if (isMounted) {
          setPermissionStatus(updatedStatus);
        }

        // Check if the app was opened from a notification (cold start)
        try {
          const coldStartResponse = await getLastNotificationResponse();
          if (isMounted && coldStartResponse) {
            const data =
              coldStartResponse.notification?.request?.content?.data || {};
            setLastNotification(data);
            if (onTappedRef.current) {
              onTappedRef.current(data, coldStartResponse);
            }
          }
        } catch {
          // Cold-start check may fail in Expo Go — that's fine
        }

        // Set up notification listeners
        cleanupListeners = addNotificationListeners({
          onReceived: (notification) => {
            if (!isMounted) return;
            const data = notification?.request?.content?.data || {};
            setLastNotification(data);
            setNotificationCount((prev) => prev + 1);
          },
          onTapped: (data, response) => {
            if (!isMounted) return;
            setLastNotification(data);

            // Clear badge when user interacts with a notification
            clearBadge();

            if (onTappedRef.current) {
              onTappedRef.current(data, response);
            }
          },
        });
      } catch {
        // Silently handle init errors (common in Expo Go)
      }
    }

    init();

    return () => {
      isMounted = false;
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, []);

  // ─── Request permission manually ──────────────────────────

  const requestPermission = useCallback(async () => {
    const granted = await requestPermissionWithExplanation();
    const status = await getPermissionStatus();
    setPermissionStatus(status);

    if (granted && !pushToken) {
      const token = await registerForPushNotifications();
      if (token) {
        setPushToken(token);
      }
    }

    return granted;
  }, [pushToken]);

  // ─── Refresh permission status ────────────────────────────

  const refreshPermissionStatus = useCallback(async () => {
    const status = await getPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

  // ─── Clear notification count ─────────────────────────────

  const clearNotificationCount = useCallback(() => {
    setNotificationCount(0);
    clearBadge();
  }, []);

  // ─── Derived state ────────────────────────────────────────

  const isAvailable = isNotificationsAvailable();
  const isPermissionGranted = permissionStatus === "granted";
  const isUnavailable = permissionStatus === "unavailable";
  const hasUnread = notificationCount > 0;

  // ─── Return ───────────────────────────────────────────────

  return {
    // Token
    pushToken,

    // Permission
    permissionStatus,
    isPermissionGranted,
    isUnavailable,
    isAvailable,
    requestPermission,
    refreshPermissionStatus,

    // Notification state
    lastNotification,
    notificationCount,
    hasUnread,
    clearNotificationCount,
  };
}
