import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";

export default function FilterChip({
  label,
  value,
  isActive = false,
  onPress,
  activeColor,
  activeBgColor,
  icon = null,
  size = "md",
  disabled = false,
}) {
  const { colors } = useTheme();

  // Use theme colors as defaults if not provided
  const finalActiveColor = activeColor || colors.primary;
  const finalActiveBgColor = activeBgColor || colors.primaryFaded;

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
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        isActive && [
          styles.chipActive,
          {
            backgroundColor: finalActiveBgColor,
            borderColor: finalActiveColor,
          },
        ],
        disabled && styles.chipDisabled,
      ]}
    >
      {icon && (
        <Text
          style={[
            styles.icon,
            { color: colors.textSecondary },
            isActive && { color: finalActiveColor },
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
          { color: colors.textSecondary },
          isActive && [styles.labelActive, { color: finalActiveColor }],
          disabled && [styles.textDisabled, { color: colors.textTertiary }],
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
    borderWidth: 1.5,
    gap: spacing.xs,
    elevation: 1,
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
  },

  label: {
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },

  labelActive: {
    fontWeight: typography.fontWeight.semibold,
  },

  textDisabled: {
  },
});
