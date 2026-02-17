import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "../theme/spacing";
import { fetchNotificationsCached } from "../api/client";
import { notifyNewCollegeAlerts } from "../utils/notifications";
import { useTheme } from "../context/ThemeContext";

// ─── Category icon & color map ──────────────────────────────

const CATEGORY_CONFIG = {
  Examination: {
    icon: "school-outline",
    color: "#C62828",
    bgColor: "#FFEBEE",
  },
  Results: {
    icon: "trophy-outline",
    color: "#FFD700",
    bgColor: "#FFF9C4",
  },
  Scholarship: {
    icon: "cash-outline",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
  },
  Placements: {
    icon: "rocket-outline",
    color: "#FF4500",
    bgColor: "#FFCCBC",
  },
  Recruitment: {
    icon: "briefcase-outline",
    color: "#1565C0",
    bgColor: "#E3F2FD",
  },
  Admission: {
    icon: "enter-outline",
    color: "#6A1B9A",
    bgColor: "#F3E5F5",
  },
  Events: {
    icon: "calendar-outline",
    color: "#E65100",
    bgColor: "#FFF3E0",
  },
  "Sports & Culture": {
    icon: "musical-notes-outline",
    color: "#d81b60",
    bgColor: "#fce4ec",
  },
  "Academic Event": {
    icon: "flask-outline",
    color: "#00838F",
    bgColor: "#E0F7FA",
  },
  "Student Welfare": {
    icon: "people-outline",
    color: "#4527A0",
    bgColor: "#EDE7F6",
  },
  Administrative: {
    icon: "document-outline",
    color: "#455A64",
    bgColor: "#ECEFF1",
  },
  Academic: {
    icon: "library-outline",
    color: "#0277BD",
    bgColor: "#E1F5FE",
  },
  General: {
    icon: "megaphone-outline",
    color: "#5D4037",
    bgColor: "#EFEBE9",
  },
};

function getCategoryConfig(category) {
  return (
    CATEGORY_CONFIG[category] || {
      icon: "megaphone-outline",
      color: "#5D4037",
      bgColor: "#EFEBE9",
    }
  );
}

// ─── Format date ────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00Z");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function getRelativeDate(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00Z");
    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
    const diffMs = todayUTC.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
    return formatDate(dateStr);
  } catch {
    return formatDate(dateStr);
  }
}

// ─── Notification Card ──────────────────────────────────────

function NotificationCard({ item }) {
  const { colors } = useTheme();
  const config = getCategoryConfig(item.category);

  const handlePress = () => {
    if (item.link) {
      Linking.openURL(item.link).catch(() => { });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        {/* Category Icon */}
        <View
          style={[styles.categoryIcon, { backgroundColor: config.bgColor }]}
        >
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>

          {/* Category + Date Row */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: config.bgColor },
              ]}
            >
              <Text style={[styles.categoryText, { color: config.color }]}>
                {item.category || "General"}
              </Text>
            </View>
            <Text style={styles.dateText}>{getRelativeDate(item.date)}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={3}>
            {item.title}
          </Text>

          {/* Bottom Row */}
          <View style={styles.cardBottomRow}>
            <View style={styles.sourceBadge}>
              <Ionicons
                name={
                  item.source === "announcements"
                    ? "megaphone-outline"
                    : "notifications-outline"
                }
                size={12}
                color={colors.textTertiary}
              />
              <Text style={styles.sourceText}>
                {item.source === "announcements"
                  ? "Announcement"
                  : "Notification"}
              </Text>
            </View>
            {item.link && (
              <View style={styles.linkIndicator}>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.linkText}>Open</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Category Filter Chips ──────────────────────────────────

function CategoryChip({ label, isActive, onPress, count }) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.chipCount, isActive && styles.chipCountActive]}>
          <Text
            style={[
              styles.chipCountText,
              isActive && styles.chipCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyNotifications({ onRetry }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons
          name="notifications-off-outline"
          size={48}
          color={colors.primaryLight}
        />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        There are no recent notifications from NIT Kurukshetra at the moment.
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.white} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Error State ────────────────────────────────────────────

function ErrorState({ error, onRetry }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
      </View>
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyMessage}>
        {error || "Could not load notifications. Please check your connection."}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.white} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <View
              style={[
                styles.skeletonBlock,
                { width: 44, height: 44, borderRadius: 22 },
              ]}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View
                style={[
                  styles.skeletonBlock,
                  { width: 80, height: 18, borderRadius: 10, marginBottom: 8 },
                ]}
              />
              <View
                style={[
                  styles.skeletonBlock,
                  { width: "100%", height: 14, marginBottom: 6 },
                ]}
              />
              <View
                style={[
                  styles.skeletonBlock,
                  { width: "75%", height: 14, marginBottom: 8 },
                ]}
              />
              <View
                style={[styles.skeletonBlock, { width: 100, height: 12 }]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Track previously seen notification titles to detect new ones
  const previousTitlesRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // ─── Fetch notifications ───────────────────────────────────

  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const {
          data: result,
          fromCache,
          isStale,
        } = await fetchNotificationsCached(
          { days: 30 },
          {
            forceRefresh: isRefresh,
            onFreshData: (freshResult) => {
              // Background refresh completed — check for new alerts
              const freshItems = freshResult.data || [];

              // Detect new notifications from background refresh
              const prevTitles = previousTitlesRef.current;
              const newItems = freshItems.filter(
                (item) => item.title && !prevTitles.has(item.title),
              );
              if (newItems.length > 0) {
                notifyNewCollegeAlerts(newItems.length, newItems[0].title);
              }

              // Update known titles
              previousTitlesRef.current = new Set(
                freshItems.filter((i) => i.title).map((i) => i.title),
              );

              setNotifications(freshItems);
              setTotalCount(freshResult.total || freshItems.length);
              setLastFetched(freshResult.lastFetched || null);
            },
          },
        );
        const items = result.data || [];

        // Detect new notifications compared to what we had before
        if (!isFirstLoadRef.current && items.length > 0) {
          const prevTitles = previousTitlesRef.current;
          const newItems = items.filter(
            (item) => item.title && !prevTitles.has(item.title),
          );
          if (newItems.length > 0) {
            // Fire a local notification about new college alerts
            notifyNewCollegeAlerts(newItems.length, newItems[0].title);
          }
        }

        // Update the set of known titles
        previousTitlesRef.current = new Set(
          items.filter((i) => i.title).map((i) => i.title),
        );
        isFirstLoadRef.current = false;

        setNotifications(items);
        setTotalCount(result.total || items.length);
        setLastFetched(result.lastFetched || null);

        // Extract categories efficiently
        const categoryCounts = items.reduce((acc, item) => {
          const cat = item.category || "General";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        const finalCats = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setCategories(finalCats);

        // Apply current filter
        if (selectedCategory === "All") {
          setFilteredNotifications(items);
        } else if (selectedCategory === "Others") {
          setFilteredNotifications(
            items.filter((item) => item.category !== "Academic" && item.category !== "Examination"),
          );
        } else {
          setFilteredNotifications(
            items.filter((item) => item.category === selectedCategory),
          );
        }
      } catch (err) {
        console.error("[NotificationsScreen] Error:", err.message);
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory],
  );

  // ─── Initial load ──────────────────────────────────────────

  useEffect(() => {
    loadNotifications();
  }, []);

  // ─── Apply category filter when selection changes ──────────

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredNotifications(notifications);
    } else if (selectedCategory === "Others") {
      setFilteredNotifications(
        notifications.filter((item) => item.category !== "Academic" && item.category !== "Examination"),
      );
    } else {
      setFilteredNotifications(
        notifications.filter((item) => item.category === selectedCategory),
      );
    }
  }, [selectedCategory, notifications]);

  // ─── Handle category press ─────────────────────────────────

  const handleCategoryPress = useCallback((category) => {
    setSelectedCategory((prev) => (prev === category ? "All" : category));
  }, []);

  // ─── Handle refresh ────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // ─── Render item ───────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }) => <NotificationCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item, index) => item.id || `notif-${index}`,
    [],
  );

  // ─── List Header ───────────────────────────────────────────

  const ListHeader = useCallback(() => {
    return (
      <View>
        {/* Info Bar */}
        <View style={[styles.infoBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.infoLeft}>
            <Ionicons
              name="globe-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              Latest from nitkkr.ac.in (30 days)
            </Text>
          </View>
          <Text style={styles.countText}>
            {filteredNotifications.length} item
            {filteredNotifications.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Category Chips */}
        {categories.length > 0 && (
          <View style={styles.chipsContainer}>
            <FlatList
              data={[{ name: "All", count: totalCount }, ...categories]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.chipsContent}
              renderItem={({ item }) => (
                <CategoryChip
                  label={item.name}
                  count={item.count}
                  isActive={selectedCategory === item.name}
                  onPress={() => handleCategoryPress(item.name)}
                />
              )}
            />
          </View>
        )}
      </View>
    );
  }, [
    categories,
    selectedCategory,
    handleCategoryPress,
    filteredNotifications.length,
    totalCount,
  ]);

  // ─── Loading state ─────────────────────────────────────────

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
      </View>
    );
  }

  // ─── Error state ───────────────────────────────────────────

  if (error && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorState error={error} onRetry={() => loadNotifications(false)} />
      </View>
    );
  }

  // ─── Main List ─────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          filteredNotifications.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <EmptyNotifications onRetry={() => loadNotifications(false)} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary, colors.accent]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
            title="Refreshing notifications..."
            titleColor={colors.textSecondary}
          />
        }
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={7}
        initialNumToRender={8}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor handled by theme hook
  },
  listContent: {
    paddingBottom: spacing.massive + 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  // ─── Info Bar ──────────────────────────────────────────────
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    // backgroundColor handled inline
    borderBottomWidth: 1,
    // borderBottomColor handled inline
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    // color handled inline
  },
  countText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    // color handled inline
  },

  // ─── Category Chips ────────────────────────────────────────
  chipsContainer: {
    // backgroundColor handled inline
    borderBottomWidth: 1,
    // borderBottomColor handled inline
    paddingVertical: spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor handled inline
    paddingVertical: spacing.sm - 2,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.chipRadius,
    borderWidth: 1.5,
    // borderColor handled inline
    gap: spacing.xs,
  },
  chipActive: {
    // backgroundColor handled inline
    // borderColor handled inline
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    // color handled inline
  },
  chipTextActive: {
    // color handled inline
    fontWeight: typography.fontWeight.semibold,
  },
  chipCount: {
    // backgroundColor handled inline
    borderRadius: 8,
    minWidth: 20,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  chipCountActive: {
    // backgroundColor handled inline
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    // color handled inline
  },
  chipCountTextActive: {
    // color handled inline
  },

  // ─── Card ──────────────────────────────────────────────────
  card: {
    marginHorizontal: spacing.screenHorizontal,
    marginTop: spacing.sm,
    // backgroundColor handled inline
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    borderWidth: 1,
    // borderColor handled inline
    elevation: 1,
    // shadowColor handled inline
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    // color handled inline
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    // color handled inline
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    marginBottom: spacing.sm,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sourceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    // color handled inline
  },
  linkIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  linkText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    // color handled inline
  },

  // ─── Empty / Error ─────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.giant,
    minHeight: 350,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor handled inline
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
    borderWidth: 2,
    // borderColor handled inline
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    // color handled inline
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    // color handled inline
    textAlign: "center",
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.xxl,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor handled inline
    paddingVertical: spacing.buttonPaddingV,
    paddingHorizontal: spacing.buttonPaddingH,
    borderRadius: spacing.buttonRadius,
    gap: spacing.sm,
    elevation: 3,
    // shadowColor handled inline
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  retryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    // color handled inline
  },

  // ─── Skeleton ──────────────────────────────────────────────
  skeletonContainer: {
    padding: spacing.screenHorizontal,
    paddingTop: spacing.lg,
  },
  skeletonCard: {
    // backgroundColor handled inline
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    // borderColor handled inline
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  skeletonBlock: {
    // backgroundColor handled inline
    borderRadius: 4,
  },
});
