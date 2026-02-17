import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";

export default function EmptyState({
  icon = "document-text-outline",
  title = "No papers found",
  message = "Try adjusting your search or filters to find what you're looking for.",
  hint = null,
  actionLabel,
  onAction,
  showAction = true,
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {/* Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryFaded, borderColor: colors.borderLight }]}>
        <Ionicons name={icon} size={48} color={colors.primaryLight} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

      {/* Message */}
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {/* Hint — secondary helper text (e.g., "Try searching by subject code") */}
      {hint ? (
        <View style={[styles.hintContainer, { backgroundColor: colors.infoLight, borderColor: colors.info + "30" }]}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.info}
          />
          <Text style={[styles.hintText, { color: colors.infoDark }]}>{hint}</Text>
        </View>
      ) : null}

      {/* Action Button */}
      {showAction && actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.actionButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh-outline"
            size={spacing.iconMd}
            color={colors.white}
          />
          <Text style={[styles.actionText, { color: colors.white }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

      {/* Decorative dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotSmall, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotMedium, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotLarge, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotMedium, { backgroundColor: colors.border }]} />
        <View style={[styles.dot, styles.dotSmall, { backgroundColor: colors.border }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.giant,
    minHeight: 320,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor: colors.primaryFaded, // handled inline
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
    borderWidth: 2,
    // borderColor: colors.borderLight, // handled inline
  },

  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    // color: colors.textPrimary, // handled inline
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.normal,
  },

  message: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    // color: colors.textSecondary, // handled inline
    textAlign: "center",
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },

  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: colors.infoLight, // handled inline
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.cardRadiusSm,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
    maxWidth: 300,
    borderWidth: 1,
    // borderColor: colors.info + "30", // handled inline
  },

  hintText: {
    flex: 1,
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.medium,
    // color: colors.infoDark, // handled inline
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: colors.primary, // handled inline
    paddingVertical: spacing.buttonPaddingV,
    paddingHorizontal: spacing.buttonPaddingH,
    borderRadius: spacing.buttonRadius,
    gap: spacing.sm,
    elevation: 3,
    // shadowColor: colors.primary, // handled inline
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  actionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    // color: colors.white, // handled inline
  },

  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xxxl,
  },

  dot: {
    borderRadius: 50,
    // backgroundColor: colors.border, // handled inline
  },

  dotSmall: {
    width: 4,
    height: 4,
    opacity: 0.4,
  },

  dotMedium: {
    width: 6,
    height: 6,
    opacity: 0.6,
  },

  dotLarge: {
    width: 8,
    height: 8,
    opacity: 0.8,
  },
});
