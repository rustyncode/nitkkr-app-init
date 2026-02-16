import * as FileSystem from "expo-file-system/legacy";

// ─── Cache directory ────────────────────────────────────────

const CACHE_DIR = FileSystem.documentDirectory + "app_cache/";

// ─── Default TTLs (in milliseconds) ────────────────────────

export const CACHE_TTL = {
  FILTERS: 24 * 60 * 60 * 1000, // 24 hours — filters almost never change
  PAPERS: 10 * 60 * 1000, // 10 minutes
  NOTIFICATIONS: 30 * 60 * 1000, // 30 minutes
  STATS: 60 * 60 * 1000, // 1 hour
  SUBJECTS: 24 * 60 * 60 * 1000, // 24 hours
};

// ─── Cache keys ─────────────────────────────────────────────

export const CACHE_KEYS = {
  FILTERS: "filters",
  STATS: "stats",
  NOTIFICATIONS: "notifications",
  SUBJECTS: "subjects",
  // Papers use dynamic keys based on query params
};

// ─── Ensure cache directory exists ──────────────────────────

let dirReady = false;

async function ensureCacheDir() {
  if (dirReady) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
    dirReady = true;
  } catch (err) {
    console.warn("[Cache] Failed to create cache dir:", err.message);
  }
}

// ─── Sanitize key for filesystem ────────────────────────────

function sanitizeKey(key) {
  return key
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 120);
}

// ─── Build a file path for a cache key ──────────────────────

function getCachePath(key) {
  return `${CACHE_DIR}${sanitizeKey(key)}.json`;
}

// ─── Build a deterministic cache key from params ────────────

export function buildCacheKey(prefix, params = {}) {
  const filtered = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b));

  if (filtered.length === 0) return prefix;

  const paramStr = filtered.map(([k, v]) => `${k}=${v}`).join("&");

  return `${prefix}_${paramStr}`;
}

// ─── Write data to cache ────────────────────────────────────

export async function setCache(key, data, ttlMs) {
  try {
    await ensureCacheDir();

    const entry = {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      ttlMs,
    };

    const path = getCachePath(key);
    await FileSystem.writeAsStringAsync(path, JSON.stringify(entry), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return true;
  } catch (err) {
    console.warn("[Cache] Write failed for", key, ":", err.message);
    return false;
  }
}

// ─── Read data from cache ───────────────────────────────────
//
// Returns { data, isStale, cachedAt } or null if not found.
// If allowStale is true, returns expired data with isStale=true
// so the caller can show it while fetching fresh data.

export async function getCache(key, { allowStale = true } = {}) {
  try {
    await ensureCacheDir();

    const path = getCachePath(key);
    const fileInfo = await FileSystem.getInfoAsync(path);

    if (!fileInfo.exists) return null;

    const raw = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const entry = JSON.parse(raw);
    const now = Date.now();
    const isStale = now > entry.expiresAt;

    if (isStale && !allowStale) {
      return null;
    }

    return {
      data: entry.data,
      isStale,
      cachedAt: entry.cachedAt,
      age: now - entry.cachedAt,
    };
  } catch (err) {
    // Corrupted or unreadable — silently fail
    console.warn("[Cache] Read failed for", key, ":", err.message);
    return null;
  }
}

// ─── Check if a fresh (non-stale) cache entry exists ────────

export async function hasFreshCache(key) {
  const result = await getCache(key, { allowStale: false });
  return result !== null;
}

// ─── Delete a specific cache entry ──────────────────────────

export async function removeCache(key) {
  try {
    const path = getCachePath(key);
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
    return true;
  } catch (err) {
    console.warn("[Cache] Remove failed for", key, ":", err.message);
    return false;
  }
}

// ─── Clear all cache ────────────────────────────────────────

export async function clearAllCache() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      dirReady = false;
    }
    console.log("[Cache] All cache cleared");
    return true;
  } catch (err) {
    console.warn("[Cache] Clear all failed:", err.message);
    return false;
  }
}

// ─── Get cache stats (for debugging / settings screen) ──────

export async function getCacheStats() {
  try {
    await ensureCacheDir();

    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    let totalSize = 0;
    let freshCount = 0;
    let staleCount = 0;
    const entries = [];
    const now = Date.now();

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = `${CACHE_DIR}${file}`;
      const info = await FileSystem.getInfoAsync(filePath);

      if (info.exists) {
        totalSize += info.size || 0;

        try {
          const raw = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const entry = JSON.parse(raw);
          const isStale = now > entry.expiresAt;

          if (isStale) staleCount++;
          else freshCount++;

          entries.push({
            key: file.replace(".json", ""),
            size: info.size || 0,
            isStale,
            cachedAt: new Date(entry.cachedAt).toISOString(),
            expiresAt: new Date(entry.expiresAt).toISOString(),
          });
        } catch {
          staleCount++;
        }
      }
    }

    return {
      totalEntries: files.filter((f) => f.endsWith(".json")).length,
      freshCount,
      staleCount,
      totalSizeKB: Math.round(totalSize / 1024),
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      entries,
    };
  } catch (err) {
    console.warn("[Cache] Stats failed:", err.message);
    return {
      totalEntries: 0,
      freshCount: 0,
      staleCount: 0,
      totalSizeKB: 0,
      totalSizeMB: "0.00",
      entries: [],
    };
  }
}

// ─── Purge only stale entries ───────────────────────────────

export async function purgeStaleCache() {
  try {
    await ensureCacheDir();

    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    const now = Date.now();
    let purged = 0;

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = `${CACHE_DIR}${file}`;

      try {
        const raw = await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const entry = JSON.parse(raw);

        if (now > entry.expiresAt) {
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          purged++;
        }
      } catch {
        // Corrupted file — remove it
        await FileSystem.deleteAsync(filePath, { idempotent: true });
        purged++;
      }
    }

    console.log(`[Cache] Purged ${purged} stale entries`);
    return purged;
  } catch (err) {
    console.warn("[Cache] Purge failed:", err.message);
    return 0;
  }
}

// ─── High-level: fetch with cache (stale-while-revalidate) ──
//
// Usage:
//   const data = await cachedFetch("filters", fetchFilters, {}, CACHE_TTL.FILTERS);
//
// Returns cached data immediately (even stale) and kicks off
// a background refresh if stale. On first call with no cache,
// it fetches fresh.

export async function cachedFetch(
  cacheKey,
  fetchFn,
  fetchArgs = [],
  ttlMs = CACHE_TTL.PAPERS,
  { onFreshData, forceRefresh = false } = {},
) {
  // 1. Try cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await getCache(cacheKey, { allowStale: true });

    if (cached) {
      if (!cached.isStale) {
        // Fresh cache — return directly
        return { data: cached.data, fromCache: true, isStale: false };
      }

      // Stale cache — return it, but refresh in background
      const staleResult = {
        data: cached.data,
        fromCache: true,
        isStale: true,
      };

      // Background refresh
      (async () => {
        try {
          const freshData = Array.isArray(fetchArgs)
            ? await fetchFn(...fetchArgs)
            : await fetchFn(fetchArgs);
          await setCache(cacheKey, freshData, ttlMs);
          if (onFreshData) onFreshData(freshData);
        } catch (err) {
          console.warn(
            "[Cache] Background refresh failed for",
            cacheKey,
            ":",
            err.message,
          );
        }
      })();

      return staleResult;
    }
  }

  // 2. No cache (or force refresh) — fetch fresh
  const freshData = Array.isArray(fetchArgs)
    ? await fetchFn(...fetchArgs)
    : await fetchFn(fetchArgs);
  await setCache(cacheKey, freshData, ttlMs);
  return { data: freshData, fromCache: false, isStale: false };
}

// ─── Exports ────────────────────────────────────────────────

const cache = {
  get: getCache,
  set: setCache,
  remove: removeCache,
  has: hasFreshCache,
  clearAll: clearAllCache,
  stats: getCacheStats,
  purgeStale: purgeStaleCache,
  cachedFetch,
  buildKey: buildCacheKey,
  CACHE_TTL,
  CACHE_KEYS,
};

export default cache;
