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
      <View style={styles.premiumHero}>
        <View style={[styles.mainIconCircle, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
          <Ionicons name="journal" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.premiumTitle, { color: colors.textPrimary }]}>Notes & Resources</Text>

        <View style={[styles.modernBadge, { backgroundColor: colors.secondary + "15" }]}>
          <Ionicons name="time" size={14} color={colors.secondary} />
          <Text style={[styles.modernBadgeText, { color: colors.secondary }]}>In Development</Text>
        </View>

        <Text style={[styles.premiumDescription, { color: colors.textSecondary }]}>
          We're curating the best notes and academic resources for every subject at NIT Kurukshetra.
        </Text>
      </View>

      {/* Contribute CTA */}
      <View style={styles.section}>
        <View style={[styles.premiumContributeCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.contributeIcon, { backgroundColor: colors.error + "10" }]}>
            <Ionicons name="heart" size={24} color={colors.error} />
          </View>
          <Text style={[styles.contributeTitle, { color: colors.textPrimary }]}>Want to help?</Text>
          <Text style={[styles.contributeText, { color: colors.textSecondary }]}>
            Share your notes with fellow NITians and help us build the ultimate student library.
          </Text>
        </View>
      </View>

      {/* What to Expect (Moved to bottom) */}
      <View style={[styles.section, { marginTop: spacing.xxl }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIconCircle, { backgroundColor: colors.primary + "10" }]}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Future Features</Text>
        </View>

        <View style={styles.plannedGrid}>
          {PLANNED_ITEMS.map((item, index) => (
            <PlannedItem key={index} {...item} colors={colors} />
          ))}
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
  premiumHero: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  mainIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1.5,
  },
  premiumTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  modernBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    marginBottom: spacing.lg,
  },
  modernBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  premiumDescription: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },

  // ─── Section ───────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ─── Planned Items ─────────────────────────────────────────
  plannedGrid: {
    gap: spacing.md,
  },
  plannedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: 0,
  },
  plannedIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  plannedTextContainer: {
    flex: 1,
  },
  plannedTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 1,
  },
  plannedDescription: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  // ─── Contribute Card ───────────────────────────────────────
  premiumContributeCard: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contributeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contributeTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  contributeText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },

  // ─── Decorative Dots ───────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.giant,
    paddingBottom: spacing.xl,
  },
  dot: {
    borderRadius: 50,
  },
  dotSmall: {
    width: 4,
    height: 4,
    opacity: 0.2,
  },
  dotMedium: {
    width: 6,
    height: 6,
    opacity: 0.4,
  },
  dotLarge: {
    width: 8,
    height: 8,
    opacity: 0.6,
  },
});
