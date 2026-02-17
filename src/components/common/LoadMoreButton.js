import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";

export default function LoadMoreButton({
  onPress,
  loading = false,
  hasMore = false,
  currentCount = 0,
  totalCount = 0,
  disabled = false,
}) {
  const { colors } = useTheme();

  if (!hasMore && currentCount > 0) {
    return (
      <View style={styles.endContainer}>
        <View style={[styles.endDivider, { backgroundColor: colors.border }]} />
        <Text style={[styles.endText, { color: colors.textTertiary }]}>
          Showing all {totalCount} result{totalCount !== 1 ? "s" : ""}
        </Text>
        <View style={[styles.endDivider, { backgroundColor: colors.border }]} />
      </View >
    );
  }

  if (currentCount === 0) {
    return null;
  }

  const remaining = totalCount - currentCount;

  return (
    <View style={styles.wrapper}>
      {/* Progress indicator */}
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        Showing {currentCount} of {totalCount}
      </Text>

      {/* Progress bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: colors.primary,
              width:
                totalCount > 0
                  ? `${(currentCount / totalCount) * 100}%`
                  : "0%",
            },
          ]}
        />
      </View>

      {/* Load More Button */}
      <TouchableOpacity
        onPress={onPress}
        disabled={loading || disabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          { backgroundColor: colors.primaryFaded, borderColor: colors.primaryLight, shadowColor: colors.shadow },
          (loading || disabled) && [styles.buttonDisabled, { borderColor: colors.border }],
        ]}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.spinner}
            />
            <Text style={[styles.buttonTextLoading, { color: colors.primaryLight }]}>Loading...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons
              name="chevron-down-circle-outline"
              size={spacing.iconLg}
              color={colors.primary}
            />
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              Load More{remaining > 0 ? ` (${remaining} remaining)` : ""}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: "center",
  },

  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    // color: colors.textSecondary, // handled inline
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  progressBarContainer: {
    width: "60%",
    height: 4,
    // backgroundColor: colors.borderLight, // handled inline
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    // backgroundColor: colors.primary, // handled inline
    borderRadius: 2,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: colors.primaryFaded, // handled inline
    paddingVertical: spacing.buttonPaddingV,
    paddingHorizontal: spacing.buttonPaddingH + 8,
    borderRadius: spacing.buttonRadius,
    borderWidth: 1.5,
    // borderColor: colors.primaryLight, // handled inline
    minWidth: 200,
    elevation: 1,
    // shadowColor: colors.shadow, // handled inline
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },

  buttonDisabled: {
    opacity: 0.6,
    // borderColor: colors.border, // handled inline
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    // color: colors.primary, // handled inline
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  spinner: {
    marginRight: spacing.sm,
  },

  buttonTextLoading: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    // color: colors.primaryLight, // handled inline
  },

  // End state — all results shown
  endContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },

  endDivider: {
    flex: 1,
    height: 1,
    // backgroundColor: colors.border, // handled inline
  },

  endText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    // color: colors.textTertiary, // handled inline
    textAlign: "center",
  },
});
