import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import SearchBar from "../components/common/SearchBar";
import FilterBar from "../components/filters/FilterBar";
import SyncStatusBar from "../components/common/SyncStatusBar";
import PaperList from "../components/papers/PaperList";
import usePapers from "../hooks/usePapers";
import { colors } from "../theme";

export default function PYQScreen() {
  // ─── Data hook ──────────────────────────────────────────────
  const {
    papers,
    pagination,
    filterOptions,
    searchQuery,
    setSearchQuery,
    clearSearch,
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
    resetAll,
    loadPapers,
    syncStatus,
  } = usePapers();

  // ─── Filter bar expand/collapse ─────────────────────────────
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const toggleFilters = useCallback(() => {
    setFiltersExpanded((prev) => !prev);
  }, []);

  // ─── Retry handler ──────────────────────────────────────────
  const handleRetry = useCallback(() => {
    loadPapers(false);
  }, [loadPapers]);

  // ─── Reset all filters and search ───────────────────────────
  const handleResetAll = useCallback(() => {
    resetAll();
    setFiltersExpanded(false);
  }, [resetAll]);

  // ─── Sticky header (sync status + search + filters) rendered inside list ──
  const ListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* Sync Status Bar */}
        <SyncStatusBar
          syncStatus={syncStatus}
          loading={loading && !refreshing}
          error={error}
          onRetry={handleRetry}
        />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search subject, code, department..."
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          filterOptions={filterOptions}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          expanded={filtersExpanded}
          onToggleExpand={toggleFilters}
        />
      </View>
    ),
    [
      syncStatus,
      loading,
      refreshing,
      error,
      handleRetry,
      searchQuery,
      setSearchQuery,
      clearSearch,
      filters,
      filterOptions,
      updateFilter,
      clearFilters,
      activeFilterCount,
      filtersExpanded,
      toggleFilters,
    ],
  );

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Paper List with integrated sync status/search/filters as ListHeader */}
      <PaperList
        papers={papers}
        pagination={pagination}
        loading={loading}
        loadingMore={loadingMore}
        refreshing={refreshing}
        error={error}
        hasActiveFilters={hasActiveFilters}
        searchQuery={searchQuery}
        onLoadMore={loadMore}
        onRefresh={onRefresh}
        onRetry={handleRetry}
        onResetFilters={handleResetAll}
        ListHeaderComponent={<ListHeader />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listHeader: {
    backgroundColor: colors.background,
  },
});
