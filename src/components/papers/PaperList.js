import React, { memo, useCallback } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Text,
} from "react-native";
import PaperCard from "./PaperCard";
import LoadMoreButton from "../common/LoadMoreButton";
import EmptyState from "../common/EmptyState";
import { colors } from "../../theme";
import { spacing, typography } from "../../theme/spacing";
import { looksLikeSubjectName } from "../../constants/subjectNames";

// ─── Skeleton Loader for initial loading state ───────────────

function SkeletonCard() {
  return (
    <View style={styles.skeletonWrapper}>
      <View style={styles.skeletonCard}>
        {/* Top row skeleton */}
        <View style={styles.skeletonTopRow}>
          <View style={[styles.skeletonBlock, { width: 100, height: 22 }]} />
          <View
            style={[
              styles.skeletonBlock,
              { width: 60, height: 22, borderRadius: 12 },
            ]}
          />
        </View>

        {/* Badges skeleton */}
        <View style={styles.skeletonBadgesRow}>
          <View
            style={[
              styles.skeletonBlock,
              { width: 70, height: 20, borderRadius: 10 },
            ]}
          />
          <View
            style={[
              styles.skeletonBlock,
              { width: 30, height: 20, borderRadius: 10 },
            ]}
          />
          <View
            style={[
              styles.skeletonBlock,
              { width: 45, height: 20, borderRadius: 10 },
            ]}
          />
        </View>

        {/* Info row skeleton */}
        <View style={styles.skeletonInfoRow}>
          <View style={[styles.skeletonBlock, { width: 80, height: 14 }]} />
          <View style={[styles.skeletonBlock, { width: 50, height: 14 }]} />
        </View>

        {/* Divider */}
        <View style={styles.skeletonDivider} />

        {/* Bottom row skeleton */}
        <View style={styles.skeletonBottomRow}>
          <View style={[styles.skeletonBlock, { width: 140, height: 12 }]} />
          <View
            style={[
              styles.skeletonBlock,
              { width: 110, height: 36, borderRadius: 8 },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

// ─── Error State ─────────────────────────────────────────────

function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Something went wrong"
      message={
        error ||
        "Could not load papers. Please check your connection and try again."
      }
      actionLabel="Retry"
      onAction={onRetry}
      showAction={!!onRetry}
    />
  );
}

// ─── Results Count Header ────────────────────────────────────

const ResultsHeader = memo(function ResultsHeader({
  totalRecords,
  hasFilters,
}) {
  if (totalRecords === 0) return null;

  return (
    <View style={styles.resultsHeader}>
      <Text style={styles.resultsText}>
        {totalRecords} paper{totalRecords !== 1 ? "s" : ""} found
        {hasFilters ? " (filtered)" : ""}
      </Text>
    </View>
  );
});

// ─── Key Extractor ───────────────────────────────────────────

const keyExtractor = (item, index) => {
  return item.id || `paper-${index}`;
};

// ─── Item Separator (defined outside component to avoid re-creation) ─

const ItemSeparator = () => <View style={{ height: 2 }} />;

// ─── PaperList Component ─────────────────────────────────────

function PaperList({
  papers = [],
  pagination = {},
  loading = false,
  loadingMore = false,
  refreshing = false,
  error = null,
  hasActiveFilters = false,
  searchQuery = "",
  onLoadMore,
  onRefresh,
  onRetry,
  onResetFilters,
  ListHeaderComponent,
}) {
  const { currentPage = 1, totalRecords = 0, hasMore = false } = pagination;

  // ─── Render individual paper card ───────────────────────────

  const renderItem = useCallback(
    ({ item, index }) => <PaperCard paper={item} index={index} />,
    [],
  );

  // ─── Footer: Load More or Loading indicator ─────────────────

  const renderFooter = useCallback(() => {
    if (papers.length === 0) return null;

    return (
      <LoadMoreButton
        onPress={onLoadMore}
        loading={loadingMore}
        hasMore={hasMore}
        currentCount={papers.length}
        totalCount={totalRecords}
        disabled={loading}
      />
    );
  }, [papers.length, onLoadMore, loadingMore, hasMore, totalRecords, loading]);

  // ─── Empty state ────────────────────────────────────────────

  const renderEmpty = useCallback(() => {
    // Don't show empty state while loading
    if (loading) return null;

    // Show error state
    if (error) {
      return <ErrorState error={error} onRetry={onRetry} />;
    }

    // Show empty state with appropriate message
    if (hasActiveFilters) {
      // Check if the user searched by what looks like a subject name
      const isSubjectNameSearch = looksLikeSubjectName(searchQuery);
      const subjectHint = isSubjectNameSearch
        ? "Subject name not found in our records. Try searching by subject code instead (e.g., CSPC20, EEPC15, ECPC17)."
        : null;

      return (
        <EmptyState
          icon="filter-outline"
          title="No matching papers"
          message="No papers match your current search and filter criteria. Try broadening your search."
          hint={subjectHint}
          actionLabel="Clear Filters"
          onAction={onResetFilters}
          showAction={!!onResetFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="document-text-outline"
        title="No papers found"
        message="It looks like there are no papers available right now. Pull down to refresh."
        actionLabel="Refresh"
        onAction={onRefresh}
        showAction={!!onRefresh}
      />
    );
  }, [loading, error, hasActiveFilters, onRetry, onResetFilters, onRefresh]);

  // ─── Loading skeleton for initial load ──────────────────────

  if (loading && papers.length === 0) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent}
        <ResultsHeader totalRecords={0} hasFilters={hasActiveFilters} />
        <LoadingSkeleton />
      </View>
    );
  }

  // ─── Main list ──────────────────────────────────────────────

  return (
    <FlatList
      data={papers}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        papers.length === 0 && styles.emptyContentContainer,
      ]}
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          <ResultsHeader
            totalRecords={totalRecords}
            hasFilters={hasActiveFilters}
          />
        </>
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary, colors.accent]}
          tintColor={colors.primary}
          progressBackgroundColor={colors.surface}
          title="Pull to refresh..."
          titleColor={colors.textSecondary}
        />
      }
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={7}
      initialNumToRender={5}
      updateCellsBatchingPeriod={100}
      getItemLayout={null} // dynamic heights, can't use this
      // Scroll behavior
      showsVerticalScrollIndicator={true}
      bounces={true}
      overScrollMode="always"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  contentContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive + 80,
  },

  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  separator: {
    height: spacing.xxs,
  },

  // ─── Results header ─────────────────────────────────────────

  resultsHeader: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },

  resultsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.normal,
  },

  // ─── Skeleton styles ────────────────────────────────────────

  skeletonContainer: {
    paddingTop: spacing.md,
  },

  skeletonWrapper: {
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.cardMargin,
  },

  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  skeletonBlock: {
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },

  skeletonTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  skeletonBadgesRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  skeletonInfoRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },

  skeletonDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md,
  },

  skeletonBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default memo(PaperList);
