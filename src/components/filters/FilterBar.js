import React, { memo } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FilterChip from "./FilterChip";
import { spacing, typography } from "../../theme/spacing";

// ─── Department code → short display labels ──────────────────

const DEPT_LABELS = {
  CE: "Civil",
  CS: "CSE",
  CH: "Chemical",
  EC: "ECE",
  EE: "EE",
  HS: "HSS",
  IT: "IT",
  MA: "Maths",
  ME: "Mech",
  PH: "Physics",
  PR: "PIE",
};

// ─── Exam type display labels ────────────────────────────────

const EXAM_TYPE_OPTIONS = [
  { label: "End Sem", value: "End Semester" },
  { label: "Mid Sem", value: "Mid Semester" },
];

// ─── Midsem number options ───────────────────────────────────

const MIDSEM_OPTIONS = [
  { label: "MS-1", value: "1" },
  { label: "MS-2", value: "2" },
];

// ─── Category short labels ───────────────────────────────────

const CATEGORY_LABELS = {
  "Program Core": "PC",
  "Institute Required": "IR",
  "Program Elective": "PE",
  "Open Elective": "OE",
  "Technical Core": "TC",
};

// ─── Filter Row Component ────────────────────────────────────

const FilterRow = memo(function FilterRow({ label, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.filterRow}>
      <Text style={[styles.filterLabel, { color: colors.textTertiary }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
});

// ─── Main FilterBar ──────────────────────────────────────────

function FilterBar({
  filters,
  filterOptions,
  onUpdateFilter,
  onClearFilters,
  activeFilterCount,
  expanded = true,
  onToggleExpand,
}) {
  const { colors } = useTheme();
  if (!filterOptions) return null;

  const {
    deptCodes = [],
    years = [],
    categories = [],
    sessions = [],
  } = filterOptions;

  // Reverse years so newest appear first
  const sortedYears = [...years].sort((a, b) => b.localeCompare(a));

  // Only show sessions that are not null/empty
  const validSessions = sessions.filter(Boolean);

  const showMidsemRow = filters.examType === "Mid Semester";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      {/* ─── Toggle Header ──────────────────────────────────── */}
      <TouchableOpacity
        style={styles.toggleHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.toggleLeft}>
          <Ionicons
            name="options-outline"
            size={spacing.iconMd}
            color={colors.primary}
          />
          <Text style={[styles.toggleText, { color: colors.textPrimary }]}>Filters</Text>
          {activeFilterCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.white }]}>{activeFilterCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.toggleRight}>
          {activeFilterCount > 0 && (
            <TouchableOpacity
              onPress={onClearFilters}
              style={styles.clearButton}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.clearText, { color: colors.error }]}>Clear All</Text>
            </TouchableOpacity>
          )}
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={spacing.iconMd}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* ─── Expanded Filter Rows ───────────────────────────── */}
      {expanded && (
        <View style={styles.filtersBody}>
          {/* Department */}
          {deptCodes.length > 0 && (
            <FilterRow label="Department">
              {deptCodes.map((code) => (
                <FilterChip
                  key={code}
                  label={DEPT_LABELS[code] || code}
                  value={code}
                  isActive={filters.deptCode === code}
                  onPress={() => onUpdateFilter("deptCode", code)}
                  size="sm"
                />
              ))}
            </FilterRow>
          )}

          {/* Exam Type */}
          <FilterRow label="Exam">
            {EXAM_TYPE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isActive={filters.examType === opt.value}
                onPress={() => onUpdateFilter("examType", opt.value)}
                activeColor={
                  opt.value === "End Semester"
                    ? colors.chipEndText
                    : colors.chipMidText
                }
                activeBgColor={
                  opt.value === "End Semester"
                    ? colors.chipEnd
                    : colors.chipMid
                }
                size="sm"
              />
            ))}
          </FilterRow>

          {/* Midsem Number — only visible when Mid Semester selected */}
          {showMidsemRow && (
            <FilterRow label="Mid Sem #">
              {MIDSEM_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  isActive={String(filters.midsemNumber) === opt.value}
                  onPress={() => onUpdateFilter("midsemNumber", opt.value)}
                  activeColor={colors.chipMid1Text}
                  activeBgColor={colors.chipMid1}
                  size="sm"
                />
              ))}
            </FilterRow>
          )}

          {/* Year */}
          {sortedYears.length > 0 && (
            <FilterRow label="Year">
              {sortedYears.map((yr) => (
                <FilterChip
                  key={yr}
                  label={yr}
                  value={yr}
                  isActive={filters.year === yr}
                  onPress={() => onUpdateFilter("year", yr)}
                  activeColor={colors.info}
                  activeBgColor={colors.infoLight}
                  size="sm"
                />
              ))}
            </FilterRow>
          )}

          {/* Category */}
          {categories.length > 0 && (
            <FilterRow label="Category">
              {categories.map((cat) => (
                <FilterChip
                  key={cat}
                  label={CATEGORY_LABELS[cat] || cat}
                  value={cat}
                  isActive={filters.category === cat}
                  onPress={() => onUpdateFilter("category", cat)}
                  activeColor={colors.success}
                  activeBgColor={colors.successLight}
                  size="sm"
                />
              ))}
            </FilterRow>
          )}

          {/* Session */}
          {validSessions.length > 0 && (
            <FilterRow label="Session">
              {validSessions.map((s) => (
                <FilterChip
                  key={s}
                  label={s}
                  value={s}
                  isActive={filters.session === s}
                  onPress={() => onUpdateFilter("session", s)}
                  activeColor={colors.warning}
                  activeBgColor={colors.warningLight}
                  size="sm"
                />
              ))}
            </FilterRow>
          )}
        </View>
      )}

      {/* ─── Collapsed Active Chips Summary ─────────────────── */}
      {!expanded && activeFilterCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collapsedChipsContent}
          keyboardShouldPersistTaps="handled"
        >
          {filters.deptCode !== "" && (
            <ActiveChipPill
              label={DEPT_LABELS[filters.deptCode] || filters.deptCode}
              onRemove={() => onUpdateFilter("deptCode", filters.deptCode)}
            />
          )}
          {filters.examType !== "" && (
            <ActiveChipPill
              label={
                filters.examType === "End Semester" ? "End Sem" : "Mid Sem"
              }
              onRemove={() => onUpdateFilter("examType", filters.examType)}
            />
          )}
          {filters.midsemNumber !== "" && filters.midsemNumber != null && (
            <ActiveChipPill
              label={`MS-${filters.midsemNumber}`}
              onRemove={() =>
                onUpdateFilter("midsemNumber", filters.midsemNumber)
              }
            />
          )}
          {filters.year !== "" && (
            <ActiveChipPill
              label={filters.year}
              onRemove={() => onUpdateFilter("year", filters.year)}
            />
          )}
          {filters.category !== "" && (
            <ActiveChipPill
              label={CATEGORY_LABELS[filters.category] || filters.category}
              onRemove={() => onUpdateFilter("category", filters.category)}
            />
          )}
          {filters.session !== "" && (
            <ActiveChipPill
              label={filters.session}
              onRemove={() => onUpdateFilter("session", filters.session)}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Small pill showing an active filter (collapsed mode) ────

function ActiveChipPill({ label, onRemove }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onRemove}
      style={[styles.activePill, { backgroundColor: colors.primaryFaded, borderColor: colors.primaryLight }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.activePillText, { color: colors.primary }]}>{label}</Text>
      <Ionicons name="close-circle" size={14} color={colors.primaryLight} />
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },

  // Toggle header
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },

  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  toggleText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },

  toggleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  clearButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  clearText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Filter body (expanded)
  filtersBody: {
    paddingBottom: spacing.md,
  },

  // Filter row
  filterRow: {
    marginBottom: spacing.sm,
  },

  filterLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wider,
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.xs + 2,
  },

  chipScrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.chipGap,
    flexDirection: "row",
    alignItems: "center",
  },

  // Collapsed active chips
  collapsedChipsContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  activePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm + 2,
    paddingRight: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
  },

  activePillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default memo(FilterBar);
