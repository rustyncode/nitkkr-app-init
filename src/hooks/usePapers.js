import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { fetchAllPapersCached } from "../api/client";
import { queryPapers, extractFilterOptions } from "../utils/paperEngine";
import { getSubjectName } from "../constants/subjectNames";

// ─── Initial filter state ───────────────────────────────────

const INITIAL_FILTERS = {
  deptCode: "",
  examType: "",
  midsemNumber: "",
  year: "",
  category: "",
  subjectCode: "",
  session: "",
};

const PAGE_SIZE = 10;

// ─── Hook ───────────────────────────────────────────────────

export default function usePapers() {
  // ─── State ──────────────────────────────────────────────────

  // The full dataset (fetched once, cached locally)
  const [allPapers, setAllPapers] = useState([]);

  // Derived / displayed papers (computed by paperEngine)
  const [papers, setPapers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalRecords: 0,
    totalPages: 0,
    hasMore: false,
    nextPage: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    deptCodes: [],
    subjectCodes: [],
    categories: [],
    examTypes: [],
    years: [],
    sessions: [],
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Sync status
  const [syncStatus, setSyncStatus] = useState({
    fromCache: false,
    isStale: false,
    cachedAt: null,
    totalPapersLoaded: 0,
    lastSyncError: null,
  });

  // Track current page for "load more" (local pagination)
  const currentPageRef = useRef(1);

  // Debounce ref for search
  const debounceTimerRef = useRef(null);

  // Track whether initial load has happened
  const initialLoadDone = useRef(false);

  // ─── Preprocess records with search text ──────────────────

  const preprocessRecords = useCallback((records) => {
    return records.map((r) => {
      // Look up subject name from subject code mapping
      const subjectName = getSubjectName(r.subjectCode) || "";

      return {
        ...r,
        subjectName, // attach subject name to the record
        searchText: [
          r.subjectCode,
          subjectName,
          r.department,
          r.category,
          r.examType,
          r.examTypeRaw,
          r.year,
          r.session,
          r.fileName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " "),
      };
    });
  }, []);

  // ─── Run local query (paperEngine) ────────────────────────
  //
  // This is the core function: no API call, just in-memory
  // filtering / searching / sorting / pagination.

  const runLocalQuery = useCallback(
    (dataset, query, activeFilters, page = 1) => {
      if (!dataset || dataset.length === 0) {
        setPapers([]);
        setPagination({
          currentPage: 1,
          pageSize: PAGE_SIZE,
          totalRecords: 0,
          totalPages: 0,
          hasMore: false,
          nextPage: null,
        });
        return;
      }

      const result = queryPapers(dataset, {
        query: query.trim(),
        filters: activeFilters,
        page,
        limit: PAGE_SIZE,
        sortBy: "year",
        sortOrder: "desc",
      });

      if (page === 1) {
        setPapers(result.data);
      } else {
        // Append for "load more"
        setPapers((prev) => [...prev, ...result.data]);
      }

      setPagination(result.pagination);
      currentPageRef.current = page;
    },
    [],
  );

  // ─── Fetch ALL papers (one-time network call, cached) ─────

  const loadAllPapers = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const { data, fromCache, isStale, cachedAt } =
          await fetchAllPapersCached({
            forceRefresh,
            onFreshData: (freshData) => {
              // Background refresh completed (stale-while-revalidate)
              const processed = preprocessRecords(freshData);
              setAllPapers(processed);

              // Re-derive filter options from fresh data
              const options = extractFilterOptions(processed);
              setFilterOptions(options);

              // Re-run local query with current search/filters
              // We can't access current state inside this callback reliably,
              // so we store a flag and let the effect pick it up
              setSyncStatus((prev) => ({
                ...prev,
                fromCache: false,
                isStale: false,
                cachedAt: Date.now(),
                totalPapersLoaded: processed.length,
                lastSyncError: null,
              }));
            },
          });

        const processed = preprocessRecords(data);
        setAllPapers(processed);

        // Derive filter options from the dataset itself
        const options = extractFilterOptions(processed);
        setFilterOptions(options);

        // Run initial local query (page 1, current search/filters)
        // We do this inline so the first render shows data
        currentPageRef.current = 1;

        setSyncStatus({
          fromCache,
          isStale,
          cachedAt: cachedAt || Date.now(),
          totalPapersLoaded: processed.length,
          lastSyncError: null,
        });

        initialLoadDone.current = true;
      } catch (err) {
        console.error("[usePapers] loadAllPapers error:", err.message);
        setError(err.message || "Failed to load papers");
        setSyncStatus((prev) => ({
          ...prev,
          lastSyncError: err.message,
        }));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [preprocessRecords],
  );

  // ─── Effect: run local query whenever data/search/filters change ─

  useEffect(() => {
    if (allPapers.length === 0 && !initialLoadDone.current) return;

    // Debounce to handle rapid search typing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      runLocalQuery(allPapers, searchQuery, filters, 1);
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [allPapers, searchQuery, filters, runLocalQuery]);

  // ─── Load more (local pagination — instant) ───────────────

  const loadMore = useCallback(() => {
    if (loadingMore || !pagination.hasMore) return;

    const nextPage = pagination.nextPage;
    if (!nextPage) return;

    setLoadingMore(true);

    // Simulate a tiny delay so the UI shows the loading indicator briefly
    // (otherwise it's so fast the user doesn't see it at all)
    requestAnimationFrame(() => {
      runLocalQuery(allPapers, searchQuery, filters, nextPage);
      setLoadingMore(false);
    });
  }, [
    allPapers,
    searchQuery,
    filters,
    loadingMore,
    pagination.hasMore,
    pagination.nextPage,
    runLocalQuery,
  ]);

  // ─── Pull-to-refresh (force re-fetch from API) ───────────

  const onRefresh = useCallback(() => {
    loadAllPapers(true);
  }, [loadAllPapers]);

  // ─── Convenience alias for retry ──────────────────────────

  const loadPapers = useCallback(
    (isRefresh = false) => {
      loadAllPapers(isRefresh);
    },
    [loadAllPapers],
  );

  // ─── Update a single filter ───────────────────────────────

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      // Toggle: if same value selected again, deselect it
      const newValue = prev[key] === value ? "" : value;
      return { ...prev, [key]: newValue };
    });
  }, []);

  // ─── Replace all filters at once ──────────────────────────

  const setAllFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // ─── Clear all filters ────────────────────────────────────

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // ─── Clear search ─────────────────────────────────────────

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // ─── Reset everything ─────────────────────────────────────

  const resetAll = useCallback(() => {
    setSearchQuery("");
    setFilters(INITIAL_FILTERS);
  }, []);

  // ─── Count active filters ────────────────────────────────

  const activeFilterCount = useMemo(
    () =>
      Object.values(filters).filter(
        (v) => v !== "" && v !== null && v !== undefined,
      ).length,
    [filters],
  );

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== "";

  // ─── Fetch full dataset on mount ──────────────────────────

  useEffect(() => {
    loadAllPapers(false);
  }, [loadAllPapers]);

  // ─── Return ───────────────────────────────────────────────

  return {
    // Data
    papers,
    pagination,
    filterOptions,

    // Search
    searchQuery,
    setSearchQuery,
    clearSearch,

    // Filters
    filters,
    updateFilter,
    setAllFilters,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,

    // Loading states
    loading,
    loadingMore,
    loadingFilters,
    refreshing,

    // Error
    error,

    // Actions
    loadPapers,
    loadMore,
    onRefresh,
    resetAll,
    loadAllPapers,

    // Sync status (for UI indicators)
    syncStatus,
  };
}

export { INITIAL_FILTERS, PAGE_SIZE };
