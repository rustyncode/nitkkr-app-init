import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";

// ─── Availability Detection ─────────────────────────────────
// expo-notifications remote push was removed from Expo Go in SDK 53+.
// We detect this gracefully and disable push features while keeping
// local notification scheduling working where possible.

let Notifications = null;
let _isAvailable = false;

try {
  Notifications = require("expo-notifications");
  _isAvailable = true;
} catch (err) {
  // Module not installed or not linkable — stay silent
}

/**
 * Whether expo-notifications is available at all.
 * Even when true, some features (push tokens) may not work in Expo Go.
 */
function isNotificationsAvailable() {
  return _isAvailable && Notifications !== null;
}

// ─── Configure default notification behavior ────────────────

try {
  if (_isAvailable && Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch {
  // Silently ignore — likely running in Expo Go without push support
}

// ─── Register for push notifications ────────────────────────

/**
 * Registers the device for push notifications and returns the Expo push token.
 * On Android, also creates a default notification channel.
 *
 * @returns {Promise<string|null>} The Expo push token string, or null if registration failed.
 */
async function registerForPushNotifications() {
  if (!_isAvailable || !Notifications) {
    return null;
  }

  let token = null;

  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    return null;
  }

  try {
    // Create Android notification channels (this works even in Expo Go)
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          description: "Default notification channel for NIT KKR",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2C3E9B",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
        });

        await Notifications.setNotificationChannelAsync("new-papers", {
          name: "New Papers",
          description: "Notifications about newly uploaded question papers",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#F59E0B",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
        });

        await Notifications.setNotificationChannelAsync("college-alerts", {
          name: "College Alerts",
          description:
            "New announcements and notifications from NIT Kurukshetra",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2C3E9B",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
        });
      } catch {
        // Channel creation may fail in Expo Go — that's fine
      }
    }

    // Check existing permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    // Get the Expo push token — this WILL fail in Expo Go SDK 53+
    // That's expected. We catch it silently and just skip push.
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : {},
      );
      token = tokenData.data;
    } catch {
      // Push token unavailable (Expo Go limitation) — local notifications still work
      token = null;
    }
  } catch {
    // Registration failed entirely — stay silent
  }

  return token;
}

// ─── Schedule a local notification ──────────────────────────

/**
 * Schedules a local notification to fire after a delay.
 *
 * @param {Object} options
 * @param {string} options.title    - Notification title
 * @param {string} options.body     - Notification body text
 * @param {Object} [options.data]   - Optional data payload
 * @param {number} [options.delaySeconds=1] - Seconds before notification fires
 * @param {string} [options.channelId="default"] - Android channel ID
 * @returns {Promise<string>} The scheduled notification identifier
 */
async function scheduleLocalNotification({
  title,
  body,
  data = {},
  delaySeconds = 1,
  channelId = "default",
}) {
  if (!_isAvailable || !Notifications) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
        ...(Platform.OS === "android" ? { channelId } : {}),
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });
    return id;
  } catch {
    // Scheduling may fail in Expo Go — that's okay
    return null;
  }
}

// ─── Notify about new papers ────────────────────────────────

/**
 * Sends a local notification about newly available papers.
 *
 * @param {number} count - Number of new papers
 * @param {string} [department] - Optional department name for specificity
 * @returns {Promise<string|null>}
 */
async function notifyNewPapers(count, department) {
  const deptText = department ? ` for ${department}` : "";
  const paperWord = count === 1 ? "paper" : "papers";

  return scheduleLocalNotification({
    title: "📄 New Papers Available!",
    body: `${count} new question ${paperWord}${deptText} just uploaded. Tap to view.`,
    data: { type: "new_papers", department: department || null },
    delaySeconds: 1,
    channelId: "new-papers",
  });
}

// ─── Notify about new college notifications ─────────────────

/**
 * Sends a local notification about new college announcements.
 *
 * @param {number} count - Number of new notifications
 * @param {string} [firstTitle] - Title of the first/most recent notification
 * @returns {Promise<string|null>}
 */
async function notifyNewCollegeAlerts(count, firstTitle) {
  // Gracefully handle expo-notifications not being available in Expo Go
  if (!_isAvailable || !Notifications || count <= 0) {
    if (!_isAvailable || !Notifications) {
      console.log('[Notifications] Running in Expo Go or module unavailable - skipping college alerts notification.');
    }
    return null;
  }

  const body =
    count === 1
      ? firstTitle || "1 new notification from NIT Kurukshetra."
      : `${count} new notifications from NIT Kurukshetra.${firstTitle ? `\nLatest: ${firstTitle}` : ""}`;

  return scheduleLocalNotification({
    title: "🔔 NIT KKR Update",
    body,
    data: { type: "college_alert", count },
    delaySeconds: 1,
    channelId: "college-alerts",
  });
}

// ─── Notify download complete ───────────────────────────────

/**
 * Sends a local notification when a paper download completes.
 *
 * @param {string} fileName - Name of the downloaded file
 * @returns {Promise<string|null>}
 */
async function notifyDownloadComplete(fileName) {
  return scheduleLocalNotification({
    title: "✅ Download Complete",
    body: `${fileName} has been downloaded successfully.`,
    data: { type: "download_complete", fileName },
    delaySeconds: 0,
    channelId: "default",
  });
}

// ─── Notify download failed ────────────────────────────────

/**
 * Sends a local notification when a paper download fails.
 *
 * @param {string} fileName - Name of the file that failed
 * @returns {Promise<string|null>}
 */
async function notifyDownloadFailed(fileName) {
  return scheduleLocalNotification({
    title: "❌ Download Failed",
    body: `Could not download ${fileName}. Please check your connection and try again.`,
    data: { type: "download_failed", fileName },
    delaySeconds: 0,
    channelId: "default",
  });
}

// ─── Cancel a scheduled notification ────────────────────────

/**
 * Cancels a specific scheduled notification.
 *
 * @param {string} notificationId - The notification identifier to cancel
 */
async function cancelNotification(notificationId) {
  if (!_isAvailable || !Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Silently ignore
  }
}

// ─── Cancel all scheduled notifications ─────────────────────

async function cancelAllNotifications() {
  if (!_isAvailable || !Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Silently ignore
  }
}

// ─── Get notification permissions status ────────────────────

/**
 * Returns the current notification permission status.
 *
 * @returns {Promise<string>} "granted" | "denied" | "undetermined"
 */
async function getPermissionStatus() {
  if (!_isAvailable || !Notifications) return "undetermined";

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return "undetermined";
  }
}

// ─── Request notification permission with explanation ────────

/**
 * Requests notification permission, showing an explanation alert if previously denied.
 *
 * @returns {Promise<boolean>} Whether permission was granted
 */
async function requestPermissionWithExplanation() {
  if (!_isAvailable || !Notifications) return false;

  try {
    const { status: currentStatus } = await Notifications.getPermissionsAsync();

    if (currentStatus === "granted") {
      return true;
    }

    if (currentStatus === "denied") {
      Alert.alert(
        "Notifications Disabled",
        "To receive updates about new papers and college alerts, please enable notifications in your device settings.",
        [{ text: "OK", style: "default" }],
      );
      return false;
    }

    // Status is undetermined — ask for permission
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

// ─── Get badge count ────────────────────────────────────────

async function getBadgeCount() {
  if (!_isAvailable || !Notifications) return 0;

  try {
    return await Notifications.getBadgeCountAsync();
  } catch {
    return 0;
  }
}

// ─── Set badge count ────────────────────────────────────────

async function setBadgeCount(count) {
  if (!_isAvailable || !Notifications) return;

  try {
    await Notifications.setBadgeCountAsync(count);
  } catch {
    // Silently ignore
  }
}

// ─── Clear badge ────────────────────────────────────────────

async function clearBadge() {
  return setBadgeCount(0);
}

// ─── Add notification listeners ─────────────────────────────

/**
 * Adds listeners for notification received (foreground) and response (user tapped).
 *
 * @param {Object} callbacks
 * @param {Function} [callbacks.onReceived]  - Called when a notification is received in foreground
 * @param {Function} [callbacks.onTapped]    - Called when user taps on a notification
 * @returns {Function} Cleanup function to remove listeners
 */
function addNotificationListeners({ onReceived, onTapped }) {
  if (!_isAvailable || !Notifications) return () => { };

  const subscriptions = [];

  try {
    if (onReceived) {
      const sub = Notifications.addNotificationReceivedListener(
        (notification) => {
          onReceived(notification);
        },
      );
      subscriptions.push(sub);
    }

    if (onTapped) {
      const sub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data || {};
          onTapped(data, response);
        },
      );
      subscriptions.push(sub);
    }
  } catch {
    // Listener setup may fail in Expo Go — that's okay
  }

  // Return cleanup function
  return () => {
    subscriptions.forEach((sub) => {
      try {
        if (Notifications) {
          Notifications.removeNotificationSubscription(sub);
        }
      } catch {
        // Silently ignore
      }
    });
  };
}

// ─── Get last notification response (cold start) ────────────

/**
 * Gets the notification response that launched the app (cold start).
 *
 * @returns {Promise<Object|null>}
 */
async function getLastNotificationResponse() {
  if (!_isAvailable || !Notifications) return null;

  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response || null;
  } catch {
    return null;
  }
}

// ─── Exports ────────────────────────────────────────────────

export {
  isNotificationsAvailable,
  registerForPushNotifications,
  scheduleLocalNotification,
  notifyNewPapers,
  notifyNewCollegeAlerts,
  notifyDownloadComplete,
  notifyDownloadFailed,
  cancelNotification,
  cancelAllNotifications,
  getPermissionStatus,
  requestPermissionWithExplanation,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
  addNotificationListeners,
  getLastNotificationResponse,
};

const notificationUtils = {
  isNotificationsAvailable,
  registerForPushNotifications,
  scheduleLocalNotification,
  notifyNewPapers,
  notifyNewCollegeAlerts,
  notifyDownloadComplete,
  notifyDownloadFailed,
  cancelNotification,
  cancelAllNotifications,
  getPermissionStatus,
  requestPermissionWithExplanation,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
  addNotificationListeners,
  getLastNotificationResponse,
};

export default notificationUtils;
