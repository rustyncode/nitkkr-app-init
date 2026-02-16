import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";
import { spacing, typography } from "../../theme/spacing";

export default function FilterChip({
  label,
  value,
  isActive = false,
  onPress,
  activeColor = colors.primary,
  activeBgColor = colors.primaryFaded,
  icon = null,
  size = "md",
  disabled = false,
}) {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(value);
    }
  };

  const sizeStyles = SIZE_VARIANTS[size] || SIZE_VARIANTS.md;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[
        styles.chip,
        sizeStyles.chip,
        isActive && [
          styles.chipActive,
          {
            backgroundColor: activeBgColor,
            borderColor: activeColor,
          },
        ],
        disabled && styles.chipDisabled,
      ]}
    >
      {icon && (
        <Text
          style={[
            styles.icon,
            isActive && { color: activeColor },
            disabled && styles.textDisabled,
          ]}
        >
          {icon}
        </Text>
      )}

      <Text
        style={[
          styles.label,
          sizeStyles.label,
          isActive && [styles.labelActive, { color: activeColor }],
          disabled && styles.textDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const SIZE_VARIANTS = {
  sm: {
    chip: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
      borderRadius: spacing.chipRadius - 4,
    },
    label: {
      fontSize: typography.fontSize.xs,
    },
  },
  md: {
    chip: {
      paddingHorizontal: spacing.chipPaddingH,
      paddingVertical: spacing.chipPaddingV,
      borderRadius: spacing.chipRadius,
    },
    label: {
      fontSize: typography.fontSize.sm,
    },
  },
  lg: {
    chip: {
      paddingHorizontal: spacing.chipPaddingH + 4,
      paddingVertical: spacing.chipPaddingV + 2,
      borderRadius: spacing.chipRadius,
    },
    label: {
      fontSize: typography.fontSize.md,
    },
  },
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },

  chipActive: {
    elevation: 2,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  chipDisabled: {
    opacity: 0.5,
  },

  icon: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  label: {
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.normal,
  },

  labelActive: {
    fontWeight: typography.fontWeight.semibold,
  },

  textDisabled: {
    color: colors.textTertiary,
  },
});
