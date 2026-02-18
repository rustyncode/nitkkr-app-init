import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "../theme/spacing";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../api/client";
import SearchBar from "../components/common/SearchBar";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { toggleBookmark, isBookmarked } from "../services/bookmarkService";
import { useFocusEffect } from "@react-navigation/native";

import JobCard from "../components/jobs/JobCard";

export default function JobsScreen() {
  const { colors, isDark } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const loadJobs = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const result = await apiClient.fetchJobsCached({
        forceRefresh: force,
        onFreshData: (fresh) => {
          setJobs(fresh.data || []);
          setLastFetched(new Date().toISOString());
        }
      });
      setJobs(result.data || []);
      if (result.lastFetched) setLastFetched(new Date(result.lastFetched).toISOString());
      else if (!result.fromCache) setLastFetched(new Date().toISOString());
    } catch (err) {
      console.error("[JobsScreen] Load failed:", err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Reactive filtering
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  }, [jobs, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Stable Header Section (outside FlatList to preserve focus) */}
      <View style={styles.listHeader}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Jobs & Careers</Text>
            {lastFetched && (
              <Text style={styles.lastFetchedText}>
                Synced: {new Date(lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          Find your next opportunity at top MNCs
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search title, company or location..."
          onClear={() => setSearchQuery("")}
        />
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={null}
        renderItem={({ item }) => <JobCard job={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadJobs(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={!loading && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={searchQuery ? "search-outline" : "hourglass-outline"}
              size={64}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {searchQuery ? "No results found" : "Updating Openings"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery
                ? `We couldn't find any jobs matching "${searchQuery}"`
                : "Checking for new opportunities. Please check back later!"}
            </Text>
          </View>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      <LoadingOverlay visible={loading && !refreshing && jobs.length === 0} message="Syncing Opportunities..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorBanner: {
    position: 'absolute',
    bottom: spacing.xxl + 20,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
    alignItems: "center",
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
  },
  jobCard: {
    marginHorizontal: spacing.lg,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  jobIconBgSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  jobCompany: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  jobTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobTypeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  jobCardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  partnerCard: {
    shadowColor: "#FF4500",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  partnerTag: {
    position: "absolute",
    top: -10,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 10,
    elevation: 4,
  },
  partnerTagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: typography.fontWeight.black,
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
});
