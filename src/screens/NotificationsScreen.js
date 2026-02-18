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
import LoadingOverlay from "../components/common/LoadingOverlay";
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
  "Exam Date Sheets": {
    icon: "document-text-outline",
    color: "#D32F2F",
    bgColor: "#FFCDD2",
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
  "Academic Calendar": {
    icon: "calendar-number-outline",
    color: "#1976D2",
    bgColor: "#BBDEFB",
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
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
  const { colors, isDark } = useTheme();
  const config = getCategoryConfig(item.category);

  const handlePress = () => {
    if (item.link) {
      Linking.openURL(item.link).catch(() => { });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.modernCard,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : colors.borderLight,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.cardMain}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor + "50" }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.categoryLabel, { color: config.color }]}>
              {item.category?.toUpperCase() || "GENERAL"}
            </Text>
            <Text style={[styles.timeText, { color: colors.textTertiary }]}>
              {getRelativeDate(item.date)}
            </Text>
          </View>

          <Text style={[styles.contentTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.cardFooterRow}>
            <View style={styles.tagWrapper}>
              <Ionicons name="megaphone-outline" size={12} color={colors.textTertiary} />
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {item.source === "announcements" ? "Official Announcement" : "College Alert"}
              </Text>
            </View>
            {item.link && (
              <View style={[styles.openBtn, { backgroundColor: colors.primary + "10" }]}>
                <Text style={[styles.openBtnText, { color: colors.primary }]}>
                  {item.link.toLowerCase().endsWith(".pdf") ? "View PDF" : "Open Link"}
                </Text>
                <Ionicons name="chevron-forward" size={12} color={colors.primary} />
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
          <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>
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
        <Ionicons name="notifications-off-outline" size={48} color={colors.primaryLight} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Notifications</Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        There are no recent notifications from NIT Kurukshetra at the moment.
      </Text>
      {onRetry && (
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={onRetry} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={18} color="#FFF" />
          <Text style={[styles.retryButtonText, { color: "#FFF" }]}>Retry</Text>
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
            <View style={[styles.skeletonBlock, { width: 44, height: 44, borderRadius: 22 }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={[styles.skeletonBlock, { width: 80, height: 18, borderRadius: 10, marginBottom: 8 }]} />
              <View style={[styles.skeletonBlock, { width: "100%", height: 14, marginBottom: 6 }]} />
              <View style={[styles.skeletonBlock, { width: "75%", height: 14, marginBottom: 8 }]} />
              <View style={[styles.skeletonBlock, { width: 100, height: 12 }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const previousTitlesRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  const applyFilter = useCallback((data, category) => {
    if (!data) return;
    if (category === "All") {
      setFilteredNotifications(data);
    } else if (category === "Others") {
      setFilteredNotifications(
        data.filter((item) => item.category !== "Academic" && item.category !== "Examination")
      );
    } else {
      setFilteredNotifications(
        data.filter((item) => item.category === category)
      );
    }
  }, []);

  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const { data, fromCache, isStale, lastFetched: fetchedAt } = await fetchNotificationsCached({
          forceRefresh: isRefresh,
        });

        const freshItems = data || [];
        setNotifications(freshItems);
        setTotalCount(freshItems.length);
        if (fetchedAt) setLastFetched(new Date(fetchedAt).toISOString());

        // Process categories
        const counts = freshItems.reduce((acc, item) => {
          const cat = item.category || "General";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        const othersCount = freshItems.filter(
          (item) => item.category !== "Academic" && item.category !== "Examination"
        ).length;

        const finalCats = Object.keys(counts)
          .filter((c) => c !== "Academic" && c !== "Examination")
          .map((c) => ({ name: c, count: counts[c] }))
          .concat(othersCount > 0 ? [{ name: "Others", count: othersCount }] : [])
          .sort((a, b) => {
            if (a.name === "Examination") return -1;
            if (b.name === "Examination") return 1;
            return b.count - a.count;
          });

        setCategories(finalCats);
        applyFilter(freshItems, selectedCategory);

        if (!isFirstLoadRef.current && freshItems.length > 0 && !fromCache) {
          const prevTitles = previousTitlesRef.current;
          const newItems = freshItems.filter(i => i.title && !prevTitles.has(i.title));
          if (newItems.length > 0) {
            notifyNewCollegeAlerts(newItems.length, newItems[0].title);
          }
        }

        previousTitlesRef.current = new Set(freshItems.filter(i => i.title).map(i => i.title));
        isFirstLoadRef.current = false;
      } catch (err) {
        console.error("[NotificationsScreen] Error:", err.message);
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, applyFilter]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    applyFilter(notifications, selectedCategory);
  }, [selectedCategory, notifications, applyFilter]);

  const handleCategoryPress = useCallback((category) => {
    setSelectedCategory((prev) => (prev === category ? "All" : category));
  }, []);

  const handleRefresh = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  const ListHeader = useCallback(() => (
    <View style={[styles.infoBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.infoLeft}>
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <View>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>Past 30 Days</Text>
          {lastFetched && (
            <Text style={[styles.lastSyncedText, { color: colors.textTertiary }]}>
              Synced: {new Date(lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.infoRight}>
        <Text style={[styles.countText, { color: colors.primary }]}>{filteredNotifications.length}</Text>
        <Text style={[styles.countLabel, { color: colors.textSecondary }]}> alerts</Text>
      </View>
    </View>
  ), [colors, lastFetched, filteredNotifications.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      {loading && notifications.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => <NotificationCard item={item} />}
          keyExtractor={(item, index) => item.id || `notif-${index}`}
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
            />
          }
        />
      )}
      <LoadingOverlay visible={loading && !refreshing && notifications.length > 0} message="Checking for updates..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.massive + 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  modernCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardMain: {
    flexDirection: "row",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDetails: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 2,
  },
  openBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "700",
  },
  lastSyncedText: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  countText: {
    fontSize: 16,
    fontWeight: "800",
  },
  countLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  chipsContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  chipsContent: {
    paddingHorizontal: spacing.xl,
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: "rgba(0,0,0,0.05)",
    gap: 6,
  },
  chipActive: {
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  chipCount: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chipCountActive: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
    paddingVertical: 50,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 250,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  skeletonContainer: {
    padding: spacing.md,
  },
  skeletonCard: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  skeletonBlock: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
  },
});
