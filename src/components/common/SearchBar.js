import React, { useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search by subject, code, department...",
  onFocus,
  onBlur,
}) {
  const { colors } = useTheme();
  const inputRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const hasValue = value && value.length > 0;

  const handleFocus = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onFocus && onFocus();
  };

  const handleBlur = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onBlur && onBlur();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText && onChangeText("");
    }
    inputRef.current?.focus();
  };

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow
        }
      ]}>
        {/* Search Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="search"
            size={spacing.iconMd}
            color={hasValue ? colors.primary : colors.textTertiary}
          />
        </View>

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primaryLight}
        />

        {/* Clear button */}
        {hasValue && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.clearIconBg, { backgroundColor: colors.textTertiary }]}>
              <Ionicons
                name="close"
                size={spacing.iconSm}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: spacing.inputRadius,
    borderWidth: 1.5,
    height: spacing.inputHeight,
    paddingHorizontal: spacing.sm,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  iconContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    paddingVertical: 0,
    paddingHorizontal: spacing.xs,
    height: "100%",
  },

  clearButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  clearIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
