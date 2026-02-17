import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";

// ─── Format relative time from timestamp ────────────────────

function formatTimeAgo(timestamp) {
  if (!timestamp) return null;

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ─── Determine status config from syncStatus ────────────────

function getStatusConfig(syncStatus, loading, error, colors) {
  if (error) {
    return {
      icon: "alert-circle-outline",
      color: colors.error,
      bgColor: colors.errorLight,
      borderColor: colors.error + "30",
      label: "Sync failed",
      showRetry: true,
    };
  }

  if (loading) {
    return {
      icon: "sync-outline",
      color: colors.primary,
      bgColor: colors.primaryFaded,
      borderColor: colors.primary + "20",
      label: "Syncing papers...",
      showRetry: false,
    };
  }

  if (!syncStatus || !syncStatus.cachedAt) {
    return {
      icon: "cloud-offline-outline",
      color: colors.textTertiary,
      bgColor: colors.surfaceAlt,
      borderColor: colors.borderLight,
      label: "Not synced yet",
      showRetry: false,
    };
  }

  if (syncStatus.isStale) {
    return {
      icon: "time-outline",
      color: colors.warning,
      bgColor: colors.warningLight,
      borderColor: colors.warning + "30",
      label: "Updating in background...",
      showRetry: false,
    };
  }

  if (syncStatus.fromCache) {
    return {
      icon: "cloud-done-outline",
      color: colors.success,
      bgColor: colors.successLight,
      borderColor: colors.success + "25",
      label: "Cached",
      showRetry: false,
    };
  }

  return {
    icon: "checkmark-circle-outline",
    color: colors.success,
    bgColor: colors.successLight,
    borderColor: colors.success + "25",
    label: "Synced",
    showRetry: false,
  };
}

// ─── SyncStatusBar Component ────────────────────────────────
//
// Displays a compact bar at the top of the PYQ screen showing:
//   • Sync status icon + label (synced / cached / stale / error)
//   • Total papers loaded
//   • Last synced time
//   • Optional retry button on error
//
// Props:
//   syncStatus  — { fromCache, isStale, cachedAt, totalPapersLoaded, lastSyncError }
//   loading     — boolean
//   error       — string | null
//   onRetry     — function (called when retry button pressed)

export default function SyncStatusBar({
  syncStatus = {},
  loading = false,
  error = null,
  onRetry,
}) {
  const { colors } = useTheme();

  const config = useMemo(
    () => getStatusConfig(syncStatus, loading, error, colors),
    [syncStatus, loading, error, colors]
  );

  const timeAgo = useMemo(
    () => formatTimeAgo(syncStatus?.cachedAt),
    [syncStatus?.cachedAt]
  );

  const totalPapers = syncStatus?.totalPapersLoaded || 0;

  // Don't render anything if we haven't loaded and aren't loading
  if (!loading && !error && !syncStatus?.cachedAt && totalPapers === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bgColor, borderBottomColor: config.borderColor },
      ]}
    >
      {/* Left: status icon + label */}
      <View style={styles.leftSection}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>

      {/* Right: paper count + time + retry */}
      <View style={styles.rightSection}>
        {totalPapers > 0 && !loading && (
          <View style={styles.badge}>
            <Ionicons
              name="document-text-outline"
              size={11}
              color={colors.textTertiary}
            />
            <Text style={styles.badgeText}>{totalPapers}</Text>
          </View>
        )}

        {timeAgo && !loading && (
          <View style={styles.badge}>
            <Ionicons
              name="time-outline"
              size={11}
              color={colors.textTertiary}
            />
            <Text style={styles.badgeText}>{timeAgo}</Text>
          </View>
        )}

        {config.showRetry && onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.errorLight, borderColor: colors.error + "30" }]}
            onPress={onRetry}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh-outline" size={13} color={colors.error} />
            <Text style={[styles.retryText, { color: colors.error }]}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 32,
  },

  // Left side
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Right side
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.chipRadius,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Retry button
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
  },
  retryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
