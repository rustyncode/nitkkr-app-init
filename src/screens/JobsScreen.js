import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "../theme/spacing";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../api/client";

const getJobFeatures = (colors) => [
  {
    icon: "briefcase-outline",
    title: "Campus Placements",
    description: "Get real-time updates on upcoming campus placement drives and package details.",
    color: colors.featureBlue,
    bgColor: colors.featureBlueBg,
  },
  {
    icon: "code-slash-outline",
    title: "Off-Campus Opportunities",
    description: "Curated off-campus openings from top companies relevant to NIT KKR students.",
    color: colors.featurePurple,
    bgColor: colors.featurePurpleBg,
  },
  {
    icon: "school-outline",
    title: "Internship Listings",
    description: "Industry and research internships — all BTech roles in one place.",
    color: colors.featureGreen,
    bgColor: colors.featureGreenBg,
  },
  {
    icon: "trending-up-outline",
    title: "Career Growth",
    description: "Historical placement stats and hiring trends for different branches.",
    color: colors.featureOrange,
    bgColor: colors.featureOrangeBg,
  },
];

const JobCard = ({ job }) => {
  const { colors, isDark } = useTheme();

  // Highlight partner companies (MNCs)
  const isPartner = ["Google", "Microsoft", "Amazon", "Atlassian", "Flipkart", "PhonePe"].includes(job.company);

  return (
    <TouchableOpacity
      style={[
        styles.jobCard,
        {
          backgroundColor: colors.surface,
          borderColor: isPartner ? colors.primary + "40" : colors.borderLight,
          borderWidth: isPartner ? 1.5 : 1,
        },
        isPartner && styles.partnerCard
      ]}
      activeOpacity={0.7}
      onPress={() => job.link && Linking.openURL(job.link).catch(() => { })}
    >
      {isPartner && (
        <View style={[styles.partnerTag, { backgroundColor: colors.primary }]}>
          <Ionicons name="sparkles" size={10} color="#FFF" />
          <Text style={styles.partnerTagText}>PARTNER</Text>
        </View>
      )}

      <View style={styles.jobCardTop}>
        <View style={[styles.jobIconBgSmall, { backgroundColor: isPartner ? colors.primary + "15" : colors.primarySoft }]}>
          <Ionicons name={isPartner ? "star" : "business-outline"} size={24} color={isPartner ? colors.primary : colors.primary} />
        </View>
        <View style={styles.jobInfo}>
          <Text style={[styles.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
          <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
        </View>
        <View style={[styles.jobTypeBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : colors.primary + '15' }]}>
          <Text style={[styles.jobTypeText, { color: colors.primary }]}>{job.type}</Text>
        </View>
      </View>

      <View style={styles.jobCardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textTertiary }]}>{job.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color={colors.featureGreen} />
          <Text style={[styles.detailText, { color: colors.textTertiary }]}>{job.stipend || "TBD"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textTertiary }]}>{job.deadline}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function JobsScreen() {
  const { colors } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadJobs = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const result = await apiClient.fetchJobsCached({ forceRefresh: force });
      setJobs(result.data || []);
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

  const handleTPOPress = () => {
    Linking.openURL("https://nitkkr.ac.in/training-placement-cell").catch(() => { });
  };

  const renderHeader = () => (
    <View>
      {/* Simplified Hero */}
      <View style={styles.hero}>
        <View style={[styles.heroIconBg, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="briefcase" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
          Jobs & Placements
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Your gateway to campus placements, internships, and student-level career opportunities
        </Text>
      </View>

      {/* Primary CTA - T&P Website */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.primaryCTA, { backgroundColor: colors.primary }]}
          onPress={handleTPOPress}
          activeOpacity={0.85}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Visit Training & Placement Cell</Text>
              <Text style={styles.ctaSubtitle}>Official placement updates & announcements</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.9)" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Glance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Glance</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>200+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Companies</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.featureGreen }]}>₹44L+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest Package</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>90%+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Placement Rate</Text>
          </View>
        </View>
      </View>

      {/* Dynamic Job List Title */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
            Latest Opportunities
          </Text>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item, index) => item.id || index.toString()}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={renderHeader}
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
          <Ionicons name="hourglass-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {error ? "Couldn't reach server." : "No openings listed right now. Check back soon!"}
          </Text>
        </View>
      )}
      ListFooterComponent={<View style={{ height: 80 }} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  heroIconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.black,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  primaryCTA: {
    borderRadius: spacing.cardRadius + 2,
    padding: spacing.lg + 4,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "rgba(255, 255, 255, 0.85)",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    borderRadius: spacing.cardRadius,
    paddingVertical: spacing.lg + 4,
    alignItems: "center",
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.black,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  jobCard: {
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
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
});
