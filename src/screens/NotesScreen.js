import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { spacing, typography } from "../theme/spacing";

const PLANNED_ITEMS = [
  {
    icon: "document-text-outline",
    title: "Subject-wise Notes",
    description: "Organized by department, semester, and subject code.",
    color: colors.featureBlue,
    bgColor: colors.featureBlueBg,
  },
  {
    icon: "pencil-outline",
    title: "Handwritten Notes",
    description: "Top-quality handwritten notes from toppers and seniors.",
    color: colors.featurePurple,
    bgColor: colors.featurePurpleBg,
  },
  {
    icon: "flash-outline",
    title: "Quick Revision",
    description: "Condensed revision materials for last-minute prep.",
    color: colors.featureOrange,
    bgColor: colors.featureOrangeBg,
  },
  {
    icon: "cloud-download-outline",
    title: "Offline Access",
    description:
      "Download notes to study anytime, anywhere — no internet needed.",
    color: colors.featureGreen,
    bgColor: colors.featureGreenBg,
  },
  {
    icon: "share-social-outline",
    title: "Share with Friends",
    description:
      "Easily share notes with classmates via WhatsApp, Telegram, etc.",
    color: colors.featureTeal,
    bgColor: colors.featureTealBg,
  },
  {
    icon: "star-outline",
    title: "Bookmark Favorites",
    description: "Save your most-used notes for quick access later.",
    color: colors.featureRed,
    bgColor: colors.featureRedBg,
  },
];

function PlannedItem({ icon, title, description, color, bgColor }) {
  return (
    <View style={styles.plannedItem}>
      <View style={[styles.plannedIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.plannedTextContainer}>
        <Text style={styles.plannedTitle}>{title}</Text>
        <Text style={styles.plannedDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function NotesScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.heroSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="book-outline" size={52} color={colors.primaryLight} />
        </View>

        <Text style={styles.title}>Notes</Text>

        <View style={styles.comingSoonBadge}>
          <Ionicons name="rocket-outline" size={15} color={colors.secondary} />
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>

        <Text style={styles.description}>
          We're building a comprehensive notes library for every department and
          subject at NIT Kurukshetra.
        </Text>
      </View>

      {/* What to Expect */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: colors.secondaryFaded },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={colors.secondary}
            />
          </View>
          <Text style={styles.sectionTitle}>What to Expect</Text>
        </View>

        {PLANNED_ITEMS.map((item, index) => (
          <PlannedItem key={index} {...item} />
        ))}
      </View>

      {/* Contribute CTA */}
      <View style={styles.section}>
        <View style={styles.contributeCard}>
          <Ionicons name="heart-outline" size={28} color={colors.error} />
          <Text style={styles.contributeTitle}>Want to Contribute?</Text>
          <Text style={styles.contributeText}>
            Have notes you'd like to share with fellow NITians? We'd love your
            help building this section. Stay tuned for the upload feature!
          </Text>
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
    backgroundColor: colors.secondaryFaded,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.chipRadius,
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.secondary + "40",
  },
  comingSoonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondaryDark,
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

  // ─── Planned Items ─────────────────────────────────────────
  plannedItem: {
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
  plannedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  plannedTextContainer: {
    flex: 1,
  },
  plannedTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  plannedDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // ─── Contribute Card ───────────────────────────────────────
  contributeCard: {
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
  contributeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  contributeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
