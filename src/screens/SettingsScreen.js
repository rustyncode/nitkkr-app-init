import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../theme/spacing";
import { getCacheStats, clearAllCache, purgeStaleCache } from "../utils/cache";
import config from "../constants/config";

// ─── Format bytes to human-readable ─────────────────────────

function formatSize(kb) {
  if (kb < 1) return "< 1 KB";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({ icon, label, value, colorOverride }) {
  const { colors } = useTheme();
  const activeColor = colorOverride || colors.primary;

  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.statIconCircle, { backgroundColor: activeColor + "18" }]}>
        <Ionicons name={icon} size={20} color={activeColor} />
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ─── Cache Entry Row ────────────────────────────────────────

function CacheEntryRow({ entry }) {
  const { colors } = useTheme();
  const isStale = entry.isStale;

  return (
    <View style={[styles.cacheEntryRow, { borderBottomColor: colors.borderLight }]}>
      <View style={styles.cacheEntryLeft}>
        <Ionicons
          name={isStale ? "time-outline" : "checkmark-circle-outline"}
          size={16}
          color={isStale ? colors.warning : colors.success}
        />
        <Text style={[styles.cacheEntryKey, { color: colors.textPrimary }]} numberOfLines={1}>
          {entry.key}
        </Text>
      </View>
      <View style={styles.cacheEntryRight}>
        <Text style={[styles.cacheEntrySize, { color: colors.textTertiary }]}>
          {formatSize(Math.round(entry.size / 1024))}
        </Text>
        <Text
          style={[
            styles.cacheEntryStatus,
            { color: isStale ? colors.warning : colors.success },
          ]}
        >
          {isStale ? "Stale" : "Fresh"}
        </Text>
      </View>
    </View>
  );
}

// ─── Section Header ─────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon} size={22} color={colors.primary} />
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── Action Button ──────────────────────────────────────────

function ActionButton({
  icon,
  label,
  sublabel,
  onPress,
  colorOverride,
  destructive = false,
  loading = false,
  disabled = false,
  rightElement,
}) {
  const { colors } = useTheme();
  // Default to primary if no override
  const baseColor = colorOverride || colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        destructive && styles.actionButtonDestructive,
        disabled && styles.actionButtonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      <View
        style={[
          styles.actionIconCircle,
          {
            backgroundColor: destructive ? colors.errorLight : baseColor + "18",
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={destructive ? colors.error : baseColor}
          />
        ) : (
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? colors.error : baseColor}
          />
        )}
      </View>
      <View style={styles.actionTextContainer}>
        <Text
          style={[
            styles.actionLabel,
            { color: destructive ? colors.error : colors.textPrimary },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.actionSublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
        ) : null}
      </View>

      {rightElement ? rightElement : (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors } = useTheme();

  const [cacheStats, setCacheStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [purging, setPurging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Load cache stats ───────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      console.warn("[Settings] Failed to load cache stats:", err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ─── Pull to refresh ───────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  // ─── Clear all cache ───────────────────────────────────────

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Clear All Cache",
      "This will remove all cached data.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              await clearAllCache();
              await loadStats();
              Alert.alert("Cache Cleared", "All cached data has been removed.");
            } catch (err) {
              Alert.alert("Error", "Failed to clear cache: " + err.message);
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  }, [loadStats]);

  // ─── Purge stale only ──────────────────────────────────────

  const handlePurgeStale = useCallback(async () => {
    setPurging(true);
    try {
      const purged = await purgeStaleCache();
      await loadStats();
      Alert.alert(
        "Stale Cache Purged",
        `Removed ${purged} expired cache ${purged === 1 ? "entry" : "entries"}.`,
      );
    } catch (err) {
      Alert.alert("Error", "Failed to purge stale cache: " + err.message);
    } finally {
      setPurging(false);
    }
  }, [loadStats]);

  // ─── Render ─────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >

      {/* ─── Cache Overview ────────────────────────────────────── */}
      <SectionHeader
        icon="server-outline"
        title="Cache Storage"
        subtitle="Offline data"
      />

      {loadingStats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading cache stats...</Text>
        </View>
      ) : cacheStats ? (
        <>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="layers-outline"
              label="Entries"
              value={cacheStats.totalEntries}
              colorOverride={colors.primary}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Fresh"
              value={cacheStats.freshCount}
              colorOverride={colors.success}
            />
            <StatCard
              icon="time-outline"
              label="Stale"
              value={cacheStats.staleCount}
              colorOverride={colors.warning}
            />
            <StatCard
              icon="cloud-download-outline"
              label="Size"
              value={formatSize(cacheStats.totalSizeKB)}
              colorOverride={colors.info}
            />
          </View>
        </>
      ) : null}

      {/* ─── Cache Actions ─────────────────────────────────────── */}
      <SectionHeader
        icon="construct-outline"
        title="Cache Management"
        subtitle="Control your cached data"
      />

      <View style={[styles.actionsCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <ActionButton
          icon="refresh-outline"
          label="Refresh Stats"
          sublabel="Reload cache statistics"
          onPress={handleRefresh}
          colorOverride={colors.info}
          loading={refreshing}
        />

        <View style={[styles.actionDivider, { backgroundColor: colors.borderLight }]} />

        <ActionButton
          icon="trash-outline"
          label="Clear All Cache"
          sublabel="Remove all offline data"
          onPress={handleClearAll}
          destructive
          loading={clearing}
          disabled={!cacheStats || cacheStats.totalEntries === 0}
        />
      </View>

      {/* ─── App Info ──────────────────────────────────────────── */}
      <SectionHeader icon="apps-outline" title="App Information" />

      <View style={[styles.appInfoCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={styles.appInfoRow}>
          <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>App Name</Text>
          <Text style={[styles.appInfoValue, { color: colors.textPrimary }]}>{config.APP_NAME}</Text>
        </View>
        <View style={[styles.appInfoDivider, { backgroundColor: colors.borderLight }]} />

        <View style={styles.appInfoRow}>
          <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Version</Text>
          <Text style={[styles.appInfoValue, { color: colors.textPrimary }]}>{config.APP_VERSION}</Text>
        </View>
      </View>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Built with ❤️ for NIT Kurukshetra students
        </Text>
        <Text style={[styles.footerVersion, { color: colors.textTertiary }]}>
          v{config.APP_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.giant + 80,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.normal,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    marginTop: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "40%",
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xxs,
  },
  cacheEntriesCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  cacheEntriesTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  cacheEntryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  cacheEntryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.md,
  },
  cacheEntryKey: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  cacheEntryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cacheEntrySize: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  cacheEntryStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    minWidth: 36,
    textAlign: "right",
  },
  emptyCache: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  emptyCacheText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyCacheSubtext: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    textAlign: "center",
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  actionsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    overflow: "hidden",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 80,
  },
  actionButtonDestructive: {},
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  actionSublabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    marginTop: 1,
  },
  actionDivider: {
    height: 1,
    marginLeft: 38 + spacing.lg + spacing.md,
  },
  appInfoCard: {
    marginHorizontal: spacing.lg,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  appInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  appInfoLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  appInfoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    maxWidth: "60%",
    textAlign: "right",
  },
  appInfoDivider: {
    height: 1,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
  },
  footerVersion: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
});
