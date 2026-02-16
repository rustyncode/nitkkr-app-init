// ─── Persistent Notification Tracker ────────────────────────
//
// This module handles the app-side notification polling system:
//
// Architecture:
//   1. On app open → poll GET /api/notifications/digest (tiny payload ~500B)
//   2. Compare digest.hash with locally cached hash (stored on disk)
//   3. If hash differs → fetch full data from /api/notifications/digest/full
//   4. Diff new items against locally cached titles
//   5. Fire local system notification for each batch of new items
//   6. Save new hash + seen titles to disk for next comparison
//
// This gives us:
//   ✅ Persistent across app restarts (saved to FileSystem)
//   ✅ No push notification server needed (local notifications)
//   ✅ Efficient polling (only fetches full data when hash changes)
//   ✅ Works with Expo Go (no dev build required for local notifs)
//   ✅ Works offline (gracefully skips if no network)

import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import config from "../constants/config";
import { notifyNewCollegeAlerts } from "./notifications";

// ─── File paths for persistent storage ──────────────────────

const TRACKER_DIR = FileSystem.documentDirectory + "notification_tracker/";
const HASH_FILE = TRACKER_DIR + "digest_hash.json";
const SEEN_TITLES_FILE = TRACKER_DIR + "seen_titles.json";
const TRACKER_META_FILE = TRACKER_DIR + "tracker_meta.json";

// ─── Constants ──────────────────────────────────────────────

const POLL_COOLDOWN_MS = 5 * 60 * 1000; // Don't poll more than once every 5 min
const MAX_SEEN_TITLES = 500; // Cap the seen titles set to prevent unbounded growth
const FETCH_TIMEOUT_MS = 15000; // 15 second timeout for digest calls

// ─── In-memory state ────────────────────────────────────────

let _lastPollTime = 0;
let _isPolling = false;
let _cachedHash = null;
let _cachedSeenTitles = null;

// ─── Ensure tracker directory exists ────────────────────────

let _dirReady = false;

async function ensureDir() {
  if (_dirReady) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(TRACKER_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(TRACKER_DIR, {
        intermediates: true,
      });
    }
    _dirReady = true;
  } catch (err) {
    console.warn("[NotifTracker] Failed to create dir:", err.message);
  }
}

// ─── Read/Write helpers ─────────────────────────────────────

async function readJSON(filePath, fallback = null) {
  try {
    const info = await FileSystem.getInfoAsync(filePath);
    if (!info.exists) return fallback;
    const raw = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[NotifTracker] Read failed:", err.message);
    return fallback;
  }
}

async function writeJSON(filePath, data) {
  try {
    await ensureDir();
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return true;
  } catch (err) {
    console.warn("[NotifTracker] Write failed:", err.message);
    return false;
  }
}

// ─── Get base URL ───────────────────────────────────────────

function getBaseUrl() {
  if (Platform.OS === "android") {
    return config.API_BASE_URL;
  }
  if (Platform.OS === "ios") {
    return config.API_BASE_URL_IOS;
  }
  return config.API_BASE_URL_WEB;
}

// ─── Fetch with timeout ─────────────────────────────────────

function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Digest fetch timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ─── Load cached hash from disk ─────────────────────────────

async function getCachedHash() {
  if (_cachedHash !== null) return _cachedHash;

  const data = await readJSON(HASH_FILE, { hash: null, savedAt: null });
  _cachedHash = data.hash;
  return _cachedHash;
}

async function saveCachedHash(hash) {
  _cachedHash = hash;
  return writeJSON(HASH_FILE, {
    hash,
    savedAt: new Date().toISOString(),
  });
}

// ─── Load/Save seen titles ──────────────────────────────────

async function getSeenTitles() {
  if (_cachedSeenTitles !== null) return _cachedSeenTitles;

  const data = await readJSON(SEEN_TITLES_FILE, { titles: [] });
  _cachedSeenTitles = new Set(data.titles || []);
  return _cachedSeenTitles;
}

async function saveSeenTitles(titlesSet) {
  // Cap the set size to prevent unbounded growth
  let titlesArray = Array.from(titlesSet);
  if (titlesArray.length > MAX_SEEN_TITLES) {
    // Keep the most recent ones (assuming they were added in order)
    titlesArray = titlesArray.slice(titlesArray.length - MAX_SEEN_TITLES);
  }

  _cachedSeenTitles = new Set(titlesArray);
  return writeJSON(SEEN_TITLES_FILE, {
    titles: titlesArray,
    count: titlesArray.length,
    savedAt: new Date().toISOString(),
  });
}

// ─── Save tracker meta (for debugging / settings screen) ────

async function saveTrackerMeta(meta) {
  return writeJSON(TRACKER_META_FILE, {
    ...meta,
    updatedAt: new Date().toISOString(),
  });
}

async function getTrackerMeta() {
  return readJSON(TRACKER_META_FILE, {
    lastPollAt: null,
    lastHash: null,
    lastNewCount: 0,
    totalChecks: 0,
    totalNewDetected: 0,
  });
}

// ─── Core: Check for new notifications ──────────────────────
//
// This is the MAIN function. Call it on app open.
//
// Returns:
//   {
//     checked: boolean      — whether a check was actually performed
//     hasNew: boolean       — whether new notifications were found
//     newCount: number      — how many new notifications
//     newItems: Array       — the new notification items (title, date, category)
//     hash: string          — the current digest hash
//     skipped: boolean      — true if skipped due to cooldown
//     error: string|null    — error message if failed
//   }

async function checkForNewNotifications({ force = false } = {}) {
  // Prevent concurrent polling
  if (_isPolling) {
    return {
      checked: false,
      hasNew: false,
      newCount: 0,
      newItems: [],
      skipped: true,
      reason: "already_polling",
    };
  }

  // Cooldown check (unless forced)
  const now = Date.now();
  if (!force && now - _lastPollTime < POLL_COOLDOWN_MS) {
    return {
      checked: false,
      hasNew: false,
      newCount: 0,
      newItems: [],
      skipped: true,
      reason: "cooldown",
      cooldownRemaining: POLL_COOLDOWN_MS - (now - _lastPollTime),
    };
  }

  _isPolling = true;
  _lastPollTime = now;

  try {
    const baseUrl = getBaseUrl();
    const trackerMeta = await getTrackerMeta();

    // ─── Step 1: Fetch lightweight digest ─────────────────────
    console.log("[NotifTracker] Polling digest...");

    let digestResponse;
    try {
      digestResponse = await fetchWithTimeout(
        `${baseUrl}/notifications/digest`
      );
    } catch (err) {
      console.warn("[NotifTracker] Digest fetch failed:", err.message);
      return {
        checked: true,
        hasNew: false,
        newCount: 0,
        newItems: [],
        error: `Network error: ${err.message}`,
      };
    }

    if (!digestResponse.ok) {
      console.warn(
        "[NotifTracker] Digest returned status:",
        digestResponse.status
      );
      return {
        checked: true,
        hasNew: false,
        newCount: 0,
        newItems: [],
        error: `Server error: ${digestResponse.status}`,
      };
    }

    const digestJson = await digestResponse.json();
    const digest = digestJson.data || digestJson;
    const serverHash = digest.hash;

    if (!serverHash) {
      console.warn("[NotifTracker] Digest returned no hash");
      return {
        checked: true,
        hasNew: false,
        newCount: 0,
        newItems: [],
        error: "No hash in digest response",
      };
    }

    // ─── Step 2: Compare hash with local cache ────────────────
    const localHash = await getCachedHash();

    console.log(
      `[NotifTracker] Hash compare: local=${localHash || "none"} server=${serverHash}`
    );

    if (localHash === serverHash) {
      // No changes — update meta and return
      await saveTrackerMeta({
        ...trackerMeta,
        lastPollAt: new Date().toISOString(),
        lastHash: serverHash,
        totalChecks: (trackerMeta.totalChecks || 0) + 1,
        lastResult: "no_change",
      });

      console.log("[NotifTracker] No changes detected.");
      return {
        checked: true,
        hasNew: false,
        newCount: 0,
        newItems: [],
        hash: serverHash,
      };
    }

    // ─── Step 3: Hash changed — fetch full data ───────────────
    console.log("[NotifTracker] Hash changed! Fetching full data...");

    let fullResponse;
    try {
      fullResponse = await fetchWithTimeout(
        `${baseUrl}/notifications/digest/full`
      );
    } catch (err) {
      // Hash changed but we can't fetch full data — save hash anyway
      // so we don't keep re-fetching on every poll
      console.warn("[NotifTracker] Full fetch failed:", err.message);
      return {
        checked: true,
        hasNew: false,
        newCount: 0,
        newItems: [],
        error: `Full data fetch failed: ${err.message}`,
      };
    }

    if (!fullResponse.ok) {
      return {
        checked: true,
        hasNew: false,
        newCount: 0,
        newItems: [],
        error: `Full data server error: ${fullResponse.status}`,
      };
    }

    const fullJson = await fullResponse.json();
    const fullData = fullJson.data || fullJson;
    const allItems = fullData.items || [];

    // ─── Step 4: Diff against seen titles ─────────────────────
    const seenTitles = await getSeenTitles();
    const newItems = [];

    for (const item of allItems) {
      const title = (item.title || "").trim();
      if (title && !seenTitles.has(title)) {
        newItems.push({
          title: item.title,
          date: item.date,
          category: item.category,
          link: item.link,
          source: item.source,
        });
      }
    }

    // ─── Step 5: Fire local notification if new items found ───
    const isFirstSync = localHash === null;

    if (newItems.length > 0 && !isFirstSync) {
      console.log(
        `[NotifTracker] 🔔 ${newItems.length} NEW notification(s)!`
      );
      newItems.slice(0, 3).forEach((item) => {
        console.log(`  → ${item.title?.slice(0, 80)}`);
      });

      // Fire local system notification
      try {
        await notifyNewCollegeAlerts(
          newItems.length,
          newItems[0]?.title || "New update from NIT KKR"
        );
      } catch (err) {
        console.warn(
          "[NotifTracker] Local notification failed:",
          err.message
        );
      }
    } else if (isFirstSync) {
      console.log(
        `[NotifTracker] First sync — seeding ${allItems.length} items (no notification fired)`
      );
    } else {
      console.log(
        "[NotifTracker] Hash changed but no genuinely new titles found (items may have been removed/reordered)"
      );
    }

    // ─── Step 6: Persist new hash + seen titles ───────────────
    // Add all current item titles to seen set
    for (const item of allItems) {
      const title = (item.title || "").trim();
      if (title) {
        seenTitles.add(title);
      }
    }

    await saveCachedHash(serverHash);
    await saveSeenTitles(seenTitles);
    await saveTrackerMeta({
      lastPollAt: new Date().toISOString(),
      lastHash: serverHash,
      lastNewCount: isFirstSync ? 0 : newItems.length,
      totalChecks: (trackerMeta.totalChecks || 0) + 1,
      totalNewDetected:
        (trackerMeta.totalNewDetected || 0) +
        (isFirstSync ? 0 : newItems.length),
      lastResult: isFirstSync
        ? "first_sync"
        : newItems.length > 0
          ? "new_found"
          : "hash_changed_no_new",
      seenTitlesCount: seenTitles.size,
    });

    return {
      checked: true,
      hasNew: !isFirstSync && newItems.length > 0,
      newCount: isFirstSync ? 0 : newItems.length,
      newItems: isFirstSync ? [] : newItems,
      hash: serverHash,
      isFirstSync,
    };
  } catch (err) {
    console.error("[NotifTracker] Unexpected error:", err.message);
    return {
      checked: true,
      hasNew: false,
      newCount: 0,
      newItems: [],
      error: err.message,
    };
  } finally {
    _isPolling = false;
  }
}

// ─── Reset tracker (clear all cached data) ──────────────────

async function resetTracker() {
  try {
    _cachedHash = null;
    _cachedSeenTitles = null;
    _lastPollTime = 0;

    const dirInfo = await FileSystem.getInfoAsync(TRACKER_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(TRACKER_DIR, { idempotent: true });
      _dirReady = false;
    }

    console.log("[NotifTracker] Tracker reset complete.");
    return true;
  } catch (err) {
    console.warn("[NotifTracker] Reset failed:", err.message);
    return false;
  }
}

// ─── Get tracker stats (for Settings / debug screen) ────────

async function getTrackerStats() {
  const meta = await getTrackerMeta();
  const hash = await getCachedHash();
  const seenTitles = await getSeenTitles();

  return {
    currentHash: hash,
    seenTitlesCount: seenTitles.size,
    lastPollAt: meta.lastPollAt,
    lastNewCount: meta.lastNewCount || 0,
    totalChecks: meta.totalChecks || 0,
    totalNewDetected: meta.totalNewDetected || 0,
    lastResult: meta.lastResult || "none",
    isPolling: _isPolling,
    cooldownActive: Date.now() - _lastPollTime < POLL_COOLDOWN_MS,
  };
}

// ─── Force poll (bypasses cooldown) ─────────────────────────

async function forcePoll() {
  return checkForNewNotifications({ force: true });
}

// ─── Exports ────────────────────────────────────────────────

export {
  checkForNewNotifications,
  forcePoll,
  resetTracker,
  getTrackerStats,
  getTrackerMeta,
  getCachedHash,
  getSeenTitles,
};

const notificationTracker = {
  checkForNewNotifications,
  forcePoll,
  resetTracker,
  getTrackerStats,
  getTrackerMeta,
  getCachedHash,
  getSeenTitles,
};

export default notificationTracker;
