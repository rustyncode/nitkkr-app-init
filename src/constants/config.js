// ─── API & App Configuration ─────────────────────────────────
// Auto-detects the dev machine IP so real devices can connect.

import Constants from "expo-constants";


// ─── Auto-detect dev server host IP ─────────────────────────
// When running in Expo Go on a real device, we extract the IP
// from the Expo debugger host so the app can reach the backend
// running on the same machine.

function getDevServerHost() {
  try {
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ||
      Constants.manifest?.debuggerHost ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      null;

    if (debuggerHost) {
      // debuggerHost is like "10.68.151.62:8081" — strip the port
      const host = debuggerHost.split(":")[0];
      if (host && host !== "undefined") {
        return host;
      }
    }
  } catch (e) {
    // Silently fall through
  }
  return null;
}

const DEV_HOST = getDevServerHost();
const LOCAL_IP = "10.0.2.2"; // Standard Android Emulator fallback
const DEV_API = DEV_HOST
  ? `http://${DEV_HOST}:5001/api/v1`
  : `http://${LOCAL_IP}:5001/api/v1`;

const PRODUCTION_API = "https://nitkkr-app.vercel.app/api/v1";

const ENV = {
  development: {
    API_BASE_URL: DEV_API,
    API_BASE_URL_IOS: DEV_HOST
      ? `http://${DEV_HOST}:5001/api/v1`
      : "http://localhost:5001/api/v1",
    API_BASE_URL_WEB: DEV_HOST
      ? `http://${DEV_HOST}:5001/api/v1`
      : "http://localhost:5001/api/v1",
  },
  production: {
    API_BASE_URL: PRODUCTION_API,
    API_BASE_URL_IOS: PRODUCTION_API,
    API_BASE_URL_WEB: PRODUCTION_API,
  },
};

const IS_DEV = __DEV__;
const currentEnv = IS_DEV ? ENV.development : ENV.production;

const config = {
  // ─── API ────────────────────────────────────────────────────
  API_BASE_URL: currentEnv.API_BASE_URL,
  API_BASE_URL_IOS: currentEnv.API_BASE_URL_IOS,
  API_BASE_URL_WEB: currentEnv.API_BASE_URL_WEB,

  // ─── Endpoints ─────────────────────────────────────────────
  ENDPOINTS: {
    PAPERS: "/papers",
    PAPERS_ALL: "/papers/all",
    PAPER_BY_ID: "/papers", // append /:id
    FILTERS: "/filters",
    STATS: "/stats",
    SUBJECTS: "/subjects",
    HEALTH: "/health",
    NOTIFICATIONS: "/notifications",
    NOTIFICATIONS_RECENT: "/notifications/recent",
    NOTIFICATIONS_CATEGORIES: "/notifications/categories",
    NOTIFICATIONS_REFRESH: "/notifications/refresh",
    NOTIFICATIONS_DIGEST: "/notifications/digest",
    NOTIFICATIONS_DIGEST_FULL: "/notifications/digest/full",
    NOTIFICATIONS_SCRAPE: "/notifications/scrape",
    JOBS: "/jobs",
  },

  // ─── Pagination ────────────────────────────────────────────
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // ─── Request ───────────────────────────────────────────────
  REQUEST_TIMEOUT_MS: 25000, // 25 seconds (more generous for real devices)

  // ─── App Info ──────────────────────────────────────────────
  APP_NAME: "RustiNet",
  APP_TAGLINE: "Student Hub",
  APP_DESCRIPTION: "Your one-stop app for PYQ papers, attendance tracking, and college updates",
  APP_VERSION: "1.0.0",

  // ─── Firebase Storage (direct download links) ──────────────
  FIREBASE_BUCKET: "kkr-repo-60a6a.appspot.com",
  FIREBASE_STORAGE_BASE:
    "https://firebasestorage.googleapis.com/v0/b/kkr-repo-60a6a.appspot.com/o",

  // ─── Cache ─────────────────────────────────────────────────
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes

  // ─── Retry ─────────────────────────────────────────────────
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,

  // ─── Dev Info (for debugging) ──────────────────────────────
  DEV_HOST: DEV_HOST,
  DEV_API_URL: DEV_API,
};

console.log(`[Config] DETECTED HOST: ${DEV_HOST || "Local (10.0.2.2)"}`);
console.log(`[Config] ACTIVE API URL: ${config.API_BASE_URL}`);

export default config;
