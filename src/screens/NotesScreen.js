import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../theme/spacing";

export default function NotesScreen() {
  const { colors } = useTheme();

  const PLANNED_ITEMS = useMemo(() => [
    {
      icon: "document-text-outline",
      title: "Subject-wise Notes",
      description: "Organized by department, semester, and subject code.",
    // color handled inline
      bgColor: colors.featureBlueBg,
    },
    {
      icon: "pencil-outline",
      title: "Handwritten Notes",
      description: "Top-quality handwritten notes from toppers and seniors.",
    // color handled inline
      bgColor: colors.featurePurpleBg,
    },
    {
      icon: "flash-outline",
      title: "Quick Revision",
      description: "Condensed revision materials for last-minute prep.",
    // color handled inline
      bgColor: colors.featureOrangeBg,
    },
    {
      icon: "cloud-download-outline",
      title: "Offline Access",
      description:
        "Download notes to study anytime, anywhere — no internet needed.",
    // color handled inline
      bgColor: colors.featureGreenBg,
    },
    {
      icon: "share-social-outline",
      title: "Share with Friends",
      description:
        "Easily share notes with classmates via WhatsApp, Telegram, etc.",
    // color handled inline
      bgColor: colors.featureTealBg,
    },
    {
      icon: "star-outline",
      title: "Bookmark Favorites",
      description: "Save your most-used notes for quick access later.",
    // color handled inline
      bgColor: colors.featureRedBg,
    },
  ], [colors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.heroSection}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft, borderColor: colors.borderLight }]}>
          <Ionicons name="book-outline" size={52} color={colors.primaryLight} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Notes</Text>

        <View style={[
          styles.comingSoonBadge,
          {
    // backgroundColor handled inline
    // borderColor handled inline
          }
        ]}>
          <Ionicons name="rocket-outline" size={15} color={colors.secondary} />
          <Text style={[styles.comingSoonText, { color: colors.secondaryDark }]}>Coming Soon</Text>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What to Expect</Text>
        </View>

        {PLANNED_ITEMS.map((item, index) => (
          <PlannedItem key={index} {...item} colors={colors} />
        ))}
      </View>

      {/* Contribute CTA */}
      <View style={styles.section}>
        <View style={[
          styles.contributeCard,
          {
    // backgroundColor handled inline
    // borderColor handled inline
    // shadowColor handled inline
          }
        ]}>
          <Ionicons name="heart-outline" size={28} color={colors.error} />
          <Text style={[styles.contributeTitle, { color: colors.textPrimary }]}>Want to Contribute?</Text>
          <Text style={[styles.contributeText, { color: colors.textSecondary }]}>
            Have notes you'd like to share with fellow NITians? We'd love your
            help building this section. Stay tuned for the upload feature!
          </Text>
        </View>
      </View>

      {/* Decorative Dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotSmall, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotMedium, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotLarge, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotMedium, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotSmall, { backgroundColor: colors.border }]} />
      </View>
    </ScrollView>
  );
}

function PlannedItem({ icon, title, description, color, bgColor, colors }) {
  return (
    <View style={[
      styles.plannedItem,
      {
    // backgroundColor handled inline
    // borderColor handled inline
    // shadowColor handled inline
      }
    ]}>
      <View style={[styles.plannedIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.plannedTextContainer}>
        <Text style={[styles.plannedTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.plannedDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor handled inline
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
    // backgroundColor handled inline
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    borderWidth: 2,
    // borderColor handled inline
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    // color handled inline
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor handled inline
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.chipRadius,
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    // borderColor handled inline
  },
  comingSoonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    // color handled inline
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  description: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.regular,
    // color handled inline
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
    // color handled inline
    letterSpacing: 0.2,
  },

  // ─── Planned Items ─────────────────────────────────────────
  plannedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    // backgroundColor handled inline
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    // borderColor handled inline
    elevation: 2,
    // shadowColor handled inline
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
    // color handled inline
    marginBottom: spacing.xs,
  },
  plannedDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    // color handled inline
    lineHeight: 20,
  },

  // ─── Contribute Card ───────────────────────────────────────
  contributeCard: {
    // backgroundColor handled inline
    borderRadius: spacing.cardRadius + 2,
    padding: spacing.xl + 4,
    alignItems: "center",
    borderWidth: 1,
    // borderColor handled inline
    elevation: 2,
    // shadowColor handled inline
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  contributeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    // color handled inline
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  contributeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    // color handled inline
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
    // backgroundColor handled inline
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
