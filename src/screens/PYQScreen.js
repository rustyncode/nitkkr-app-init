import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import SearchBar from "../components/common/SearchBar";
import FilterBar from "../components/filters/FilterBar";
import SyncStatusBar from "../components/common/SyncStatusBar";
import PaperList from "../components/papers/PaperList";
import usePapers from "../hooks/usePapers";
import { useTheme } from "../context/ThemeContext";
import LoadingOverlay from "../components/common/LoadingOverlay";

export default function PYQScreen({ route }) {
  const { colors } = useTheme();

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
    suggestions,
  } = usePapers(route?.params?.searchQuery);

  // ─── Filter bar expand/collapse ─────────────────────────────
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const toggleFilters = useCallback(() => {
    setFiltersExpanded((prev) => !prev);
  }, []);

  const handleRetry = useCallback(() => {
    loadPapers(true);
  }, [loadPapers]);

  const handleResetAll = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 
        Sticky Header Section
        Moved outside ListHeaderComponent to prevent re-renders and focus loss 
        when typing in SearchBar.
      */}
      <View style={[styles.listHeader, { backgroundColor: colors.background }]}>
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
          suggestions={suggestions}
          onSuggestionPress={(suggestion) => {
            setSearchQuery(suggestion.code);
          }}
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

      {/* Paper List */}
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
        // ListHeaderComponent is now null (or we could pass a small spacer)
        ListHeaderComponent={null}
      />
      <LoadingOverlay visible={loading && !refreshing && papers.length === 0} message="Loading Papers..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor handled inline
  },
  listHeader: {
    // backgroundColor handled inline
    zIndex: 10, // Ensure header stays above list if needed
    // Shadow for sticky effect
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
