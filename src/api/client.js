import { Platform } from "react-native";
import config from "../constants/config";
import {
  cachedFetch,
  buildCacheKey,
  setCache,
  getCache,
  CACHE_TTL,
  CACHE_KEYS,
} from "../utils/cache";

// ─── Cache key for the full papers dataset ──────────────────
const PAPERS_ALL_CACHE_KEY = "papers_all";
// 1 hour TTL for the full dataset (it rarely changes)
const PAPERS_ALL_TTL = 60 * 60 * 1000;

// ─── Resolve base URL based on platform ──────────────────────

function getBaseUrl() {
  if (Platform.OS === "android") {
    return config.API_BASE_URL;
  }
  if (Platform.OS === "ios") {
    return config.API_BASE_URL_IOS;
  }
  return config.API_BASE_URL_WEB;
}

const BASE_URL = getBaseUrl();

// ─── Timeout wrapper ────────────────────────────────────────

function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = config.REQUEST_TIMEOUT_MS,
) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
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

// ─── Retry wrapper ──────────────────────────────────────────

async function fetchWithRetry(url, options = {}, retries = config.MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      return response;
    } catch (err) {
      lastError = err;

      if (attempt < retries) {
        const delay = config.RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

// ─── Build query string from params object ──────────────────

function buildQueryString(params = {}) {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  if (filtered.length === 0) return "";

  const qs = filtered
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return `?${qs}`;
}

// ─── Core request method ────────────────────────────────────

async function request(endpoint, params = {}) {
  const queryString = buildQueryString(params);
  const url = `${BASE_URL}${endpoint}${queryString}`;

  try {
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API Error ${response.status}: ${errorBody.slice(0, 200)}`,
      );
    }

    const json = await response.json();

    if (json.success === false) {
      throw new Error(json.message || "API returned an error");
    }

    return json;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request was cancelled");
    }
    throw err;
  }
}

// ─── Public API methods ─────────────────────────────────────

/**
 * Fetch papers with search, filters, and pagination.
 *
 * @param {Object} options
 * @param {string}  [options.q]             - Search query
 * @param {string}  [options.department]    - Filter by department name
 * @param {string}  [options.deptCode]      - Filter by department code (CS, IT, etc.)
 * @param {string}  [options.subjectCode]   - Filter by subject code (CSPC20, etc.)
 * @param {string}  [options.examType]      - "End Semester" | "Mid Semester"
 * @param {number}  [options.midsemNumber]  - 1 or 2
 * @param {string}  [options.year]          - Year or comma-separated years
 * @param {string}  [options.category]      - "Program Core", etc.
 * @param {string}  [options.catCode]       - "PC", "IR", "PE", "OE", "TC"
 * @param {string}  [options.session]       - "Dec", "May", etc.
 * @param {number}  [options.page]          - Page number (1-based)
 * @param {number}  [options.limit]         - Records per page (default 10)
 * @param {string}  [options.sortBy]        - Sort field
 * @param {string}  [options.sortOrder]     - "asc" | "desc"
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
export async function fetchPapers(options = {}) {
  const response = await request(config.ENDPOINTS.PAPERS, options);
  return {
    data: response.data || [],
    pagination: (response.meta && response.meta.pagination) || {},
  };
}

/**
 * Fetch ALL papers by paginating through the existing /papers endpoint.
 * Fetches page by page (50 per page) until all records are collected.
 * No dependency on a special /papers/all route.
 *
 * @returns {Promise<Array>} — flat array of all paper records
 */
export async function fetchAllPapers() {
  const allRecords = [];
  let page = 1;
  let hasMore = true;
  const limit = 50; // backend MAX_PAGE_SIZE is 50

  while (hasMore) {
    const response = await request(config.ENDPOINTS.PAPERS, {
      page,
      limit,
      sortBy: "year",
      sortOrder: "desc",
    });

    const data = response.data || [];
    allRecords.push(...data);

    const pagination = (response.meta && response.meta.pagination) || {};
    hasMore = pagination.hasMore === true && data.length > 0;
    page++;

    // Safety: prevent infinite loop (max ~100 pages = 5000 papers)
    if (page > 100) break;
  }

  return allRecords;
}

/**
 * Fetch a single paper by its ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchPaperById(id) {
  const response = await request(
    `${config.ENDPOINTS.PAPER_BY_ID}/${encodeURIComponent(id)}`,
  );
  return response.data || null;
}

/**
 * Fetch all available filter options (departments, years, examTypes, etc.)
 *
 * @returns {Promise<Object>}
 */
export async function fetchFilters() {
  const response = await request(config.ENDPOINTS.FILTERS);
  return response.data || {};
}

/**
 * Fetch aggregated statistics.
 *
 * @returns {Promise<Object>}
 */
export async function fetchStats() {
  const response = await request(config.ENDPOINTS.STATS);
  return response.data || {};
}

/**
 * Fetch subject codes, optionally filtered by department or category.
 *
 * @param {Object}  [options]
 * @param {string}  [options.deptCode]
 * @param {string}  [options.category]
 * @returns {Promise<Array>}
 */
export async function fetchSubjects(options = {}) {
  const response = await request(config.ENDPOINTS.SUBJECTS, options);
  return response.data || [];
}

/**
 * Fetch recent notifications from NIT KKR website (scraped by backend).
 *
 * @param {Object}  [options]
 * @param {number}  [options.days=30]  - Number of days to look back
 * @returns {Promise<{data: Array, total: number, days: number, lastFetched: string}>}
 */
export async function fetchNotifications(options = {}) {
  const response = await request(
    config.ENDPOINTS.NOTIFICATIONS_RECENT,
    options,
  );
  return {
    data: response.data || [],
    total: response.total || 0,
    days: response.days || 30,
    fromCache: response.fromCache || false,
    lastFetched: (response.meta && response.meta.lastFetched) || null,
    hash: response.meta && response.meta.hash,
    hasUpdates: response.meta && response.meta.hasUpdates,
  };
}

export async function fetchNotificationCategories() {
  const response = await request(config.ENDPOINTS.NOTIFICATIONS_CATEGORIES);
  return response.data || [];
}

/**
 * Fetch all available jobs from the backend.
 *
 * @returns {Promise<Array>}
 */
export async function fetchJobs(params = {}) {
  const response = await request(config.ENDPOINTS.JOBS, params);
  return response;
}

/**
 * Check API health.
 *
 * @returns {Promise<Object>}
 */
export async function checkHealth() {
  const response = await request(config.ENDPOINTS.HEALTH);
  return response;
}

// ─── Cached API methods ─────────────────────────────────────
//
// These use a stale-while-revalidate strategy:
//   1. Return cached data instantly (even if stale)
//   2. Refresh in background if stale
//   3. Fetch fresh on first call or force refresh
//
// This makes the app feel instant and work offline.

/**
 * Cached fetchFilters — 24h TTL (filters almost never change).
 * Returns { data, fromCache, isStale }.
 */
export async function fetchFiltersCached({ forceRefresh = false } = {}) {
  return cachedFetch(CACHE_KEYS.FILTERS, fetchFilters, [], CACHE_TTL.FILTERS, {
    forceRefresh,
  });
}

/**
 * Cached fetchPapers — 10min TTL per unique query.
 * Cache key is built from the query params so different
 * searches/filters get their own cache entries.
 *
 * @param {Object} options - same as fetchPapers
 * @param {Object} [cacheOpts]
 * @param {boolean} [cacheOpts.forceRefresh]
 * @param {Function} [cacheOpts.onFreshData] - called when background refresh completes
 */
export async function fetchPapersCached(options = {}, cacheOpts = {}) {
  const cacheKey = buildCacheKey("papers", options);
  return cachedFetch(cacheKey, fetchPapers, [options], CACHE_TTL.PAPERS, {
    forceRefresh: cacheOpts.forceRefresh || false,
    onFreshData: cacheOpts.onFreshData,
    useHashSync: false, // Standard pagination usually doesn't need global hash sync
  });
}

/**
 * Cached fetchAllPapers — 1h TTL for the entire dataset.
 * Used by the client-side paperEngine for offline-first local
 * filtering, searching, sorting, and pagination.
 *
 * Returns { data, fromCache, isStale, cachedAt }.
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.forceRefresh] — bypass cache and fetch fresh
 * @param {Function} [opts.onFreshData] — called when background refresh completes (stale-while-revalidate)
 */
export async function fetchAllPapersCached({
  forceRefresh = false,
  onFreshData,
} = {}) {
  const result = await cachedFetch(
    PAPERS_ALL_CACHE_KEY,
    fetchAllPapers,
    [],
    PAPERS_ALL_TTL,
    { forceRefresh, onFreshData, useHashSync: false },
  );
  // Attach cachedAt from the cache entry if available
  if (result.fromCache) {
    try {
      const cached = await getCache(PAPERS_ALL_CACHE_KEY, { allowStale: true });
      if (cached) {
        result.cachedAt = cached.cachedAt;
      }
    } catch {
      /* ignore */
    }
  } else {
    result.cachedAt = Date.now();
  }
  return result;
}

/**
 * Cached fetchNotifications — 30min TTL.
 */
export async function fetchNotificationsCached(
  options = {},
  { forceRefresh = false, onFreshData } = {},
) {
  const cacheKey = buildCacheKey(CACHE_KEYS.NOTIFICATIONS, options);
  return cachedFetch(
    cacheKey,
    fetchNotifications,
    [options],
    CACHE_TTL.NOTIFICATIONS,
    { forceRefresh, onFreshData, useHashSync: true },
  );
}

/**
 * Cached fetchStats — 1h TTL.
 */
export async function fetchStatsCached({ forceRefresh = false } = {}) {
  return cachedFetch(CACHE_KEYS.STATS, fetchStats, [], CACHE_TTL.STATS, {
    forceRefresh,
  });
}

/**
 * Cached fetchSubjects — 24h TTL per query.
 */
export async function fetchSubjectsCached(
  options = {},
  { forceRefresh = false } = {},
) {
  const cacheKey = buildCacheKey(CACHE_KEYS.SUBJECTS, options);
  return cachedFetch(cacheKey, fetchSubjects, [options], CACHE_TTL.SUBJECTS, {
    forceRefresh,
  });
}

/**
 * Cached fetchJobs — 30min TTL.
 */
export async function fetchJobsCached({ forceRefresh = false, onFreshData } = {}) {
  const cacheKey = "jobs_list";
  return cachedFetch(cacheKey, fetchJobs, [], 30 * 60 * 1000, {
    forceRefresh,
    onFreshData,
    useHashSync: true,
  });
}

// ─── Exports ────────────────────────────────────────────────

const apiClient = {
  // Raw (no cache)
  fetchPapers,
  fetchAllPapers,
  fetchPaperById,
  fetchFilters,
  fetchStats,
  fetchSubjects,
  fetchNotifications,
  fetchNotificationCategories,
  fetchJobs,
  checkHealth,
  getBaseUrl,
  // Cached
  fetchFiltersCached,
  fetchPapersCached,
  fetchAllPapersCached,
  fetchNotificationsCached,
  fetchStatsCached,
  fetchSubjectsCached,
  fetchJobsCached,
};

export default apiClient;
