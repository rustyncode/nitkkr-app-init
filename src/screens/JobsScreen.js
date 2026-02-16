import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { spacing, typography } from "../theme/spacing";

const JOB_FEATURES = [
  {
    icon: "briefcase-outline",
    title: "Campus Placements",
    description:
      "Get real-time updates on upcoming campus placement drives, eligible branches, and package details.",
    color: colors.featureBlue,
    bgColor: colors.featureBlueBg,
  },
  {
    icon: "code-slash-outline",
    title: "Off-Campus Opportunities",
    description:
      "Curated off-campus job and internship openings from top companies relevant to NIT KKR students.",
    color: colors.featurePurple,
    bgColor: colors.featurePurpleBg,
  },
  {
    icon: "school-outline",
    title: "Internship Listings",
    description:
      "Summer & winter internship opportunities — paid, research, and industry internships all in one place.",
    color: colors.featureGreen,
    bgColor: colors.featureGreenBg,
  },
  {
    icon: "trending-up-outline",
    title: "Placement Stats",
    description:
      "Historical placement statistics, average & highest packages, and company-wise hiring trends.",
    color: colors.featureOrange,
    bgColor: colors.featureOrangeBg,
  },
  {
    icon: "document-text-outline",
    title: "Resume & Interview Prep",
    description:
      "Resume templates, interview tips, and company-specific preparation guides from placed seniors.",
    color: colors.featureTeal,
    bgColor: colors.featureTealBg,
  },
  {
    icon: "people-outline",
    title: "Alumni Network",
    description:
      "Connect with NIT KKR alumni working at top companies for referrals, guidance, and mentorship.",
    color: colors.featureRed,
    bgColor: colors.featureRedBg,
  },
];

function FeatureItem({ icon, title, description, color, bgColor }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function JobsScreen() {
  const handleTPOPress = () => {
    Linking.openURL("https://nitkkr.ac.in/training-placement-cell").catch(
      () => {},
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="briefcase-outline"
            size={52}
            color={colors.primaryLight}
          />
        </View>

        <Text style={styles.title}>Jobs & Placements</Text>

        <View style={styles.comingSoonBadge}>
          <Ionicons name="rocket-outline" size={15} color={colors.accent} />
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>

        <Text style={styles.description}>
          Your one-stop destination for campus placements, internships, and
          career opportunities at NIT Kurukshetra.
        </Text>
      </View>

      {/* What to Expect */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: colors.accentFaded },
            ]}
          >
            <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
          </View>
          <Text style={styles.sectionTitle}>What to Expect</Text>
        </View>

        {JOB_FEATURES.map((item, index) => (
          <FeatureItem key={index} {...item} />
        ))}
      </View>

      {/* Quick Stats Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Ionicons
              name="stats-chart-outline"
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={styles.sectionTitle}>Quick Glance</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: colors.featureBlueBg },
              ]}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={colors.featureBlue}
              />
            </View>
            <Text style={styles.statValue}>200+</Text>
            <Text style={styles.statLabel}>Companies Visit</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: colors.featureGreenBg },
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={colors.featureGreen}
              />
            </View>
            <Text style={styles.statValue}>₹44L+</Text>
            <Text style={styles.statLabel}>Highest Package</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: colors.featureOrangeBg },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={colors.featureOrange}
              />
            </View>
            <Text style={styles.statValue}>90%+</Text>
            <Text style={styles.statLabel}>Placement Rate</Text>
          </View>
        </View>
      </View>

      {/* TPO Link */}
      <View style={styles.section}>
        <View style={styles.tpoCard}>
          <View style={styles.tpoIconContainer}>
            <Ionicons name="link-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.tpoTitle}>Visit T&P Cell</Text>
          <Text style={styles.tpoDescription}>
            For official placement announcements and updates, visit the NIT KKR
            Training & Placement Cell website.
          </Text>
          <TouchableOpacity
            style={styles.tpoButton}
            onPress={handleTPOPress}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={18} color={colors.white} />
            <Text style={styles.tpoButtonText}>Open T&P Website</Text>
            <Ionicons
              name="open-outline"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notify Me CTA */}
      <View style={styles.section}>
        <View style={styles.notifyCard}>
          <Ionicons
            name="notifications-outline"
            size={28}
            color={colors.accent}
          />
          <Text style={styles.notifyTitle}>Get Notified</Text>
          <Text style={styles.notifyDescription}>
            We'll notify you as soon as the Jobs & Placements section goes live.
            Stay tuned for updates!
          </Text>
          <View style={styles.notifyBadge}>
            <Ionicons name="time-outline" size={14} color={colors.secondary} />
            <Text style={styles.notifyBadgeText}>Launching Soon</Text>
          </View>
        </View>
      </View>

      {/* Decorative Dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotSmall]} />
        <View style={[styles.dot, styles.dotMedium]} />
        <View style={[styles.dot, styles.dotLarge]} />
        <View style={[styles.dot, styles.dotMedium]} />
        <View style={[styles.dot, styles.dotSmall]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.giant + 80,
  },

  // ─── Hero ──────────────────────────────────────────────────
  heroSection: {
    alignItems: "center",
    paddingTop: spacing.xxxl + 8,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentFaded,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.chipRadius,
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.accent + "40",
  },
  comingSoonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.accentDark,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  description: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },

  // ─── Section ───────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  // ─── Feature Items ─────────────────────────────────────────
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // ─── Stats Grid ────────────────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    textAlign: "center",
  },

  // ─── TPO Card ──────────────────────────────────────────────
  tpoCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius + 2,
    padding: spacing.xl + 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  tpoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryFaded,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  tpoTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  tpoDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  tpoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.buttonRadius,
    gap: spacing.sm,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tpoButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  // ─── Notify Card ───────────────────────────────────────────
  notifyCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius + 2,
    padding: spacing.xl + 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accentFaded,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  notifyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  notifyDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  notifyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryFaded,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.chipRadius,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary + "30",
  },
  notifyBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondaryDark,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // ─── Decorative Dots ───────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  dot: {
    borderRadius: 50,
    backgroundColor: colors.border,
  },
  dotSmall: {
    width: 4,
    height: 4,
    opacity: 0.3,
  },
  dotMedium: {
    width: 6,
    height: 6,
    opacity: 0.5,
  },
  dotLarge: {
    width: 8,
    height: 8,
    opacity: 0.7,
  },
});
