import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { spacing, typography } from "../../theme/spacing";
import { downloadAndOpen, formatFileSize } from "../../utils/download";
import {
  notifyDownloadComplete,
  notifyDownloadFailed,
} from "../../utils/notifications";

// ─── Exam type badge config ──────────────────────────────────

const EXAM_BADGE_CONFIG = {
  "End Semester": {
    bg: colors.chipEnd,
    text: colors.chipEndText,
    icon: "document-text",
    shortLabel: "END SEM",
  },
  "Mid Semester": {
    bg: colors.chipMid,
    text: colors.chipMidText,
    icon: "create",
    shortLabel: "MID SEM",
  },
};

// ─── Category badge config ───────────────────────────────────

const CATEGORY_BADGE_CONFIG = {
  "Program Core": {
    bg: colors.categoryPC,
    text: colors.categoryPCText,
    label: "PC",
  },
  "Institute Required": {
    bg: colors.categoryIR,
    text: colors.categoryIRText,
    label: "IR",
  },
  "Program Elective": {
    bg: colors.categoryPE,
    text: colors.categoryPEText,
    label: "PE",
  },
  "Open Elective": {
    bg: colors.categoryOE,
    text: colors.categoryOEText,
    label: "OE",
  },
  "Technical Core": {
    bg: colors.categoryTC,
    text: colors.categoryTCText,
    label: "TC",
  },
};

// ─── Department short labels ─────────────────────────────────

const DEPT_SHORT = {
  "Civil Engineering": "Civil",
  "Computer Science & Engineering": "CSE",
  "Chemical Engineering": "Chemical",
  "Electronics & Communication Engineering": "ECE",
  "Electrical Engineering": "EE",
  "Humanities & Social Sciences": "HSS",
  "Information Technology": "IT",
  Mathematics: "Maths",
  "Mechanical Engineering": "Mech",
  Physics: "Physics",
  "Production & Industrial Engineering": "PIE",
};

// ─── PaperCard Component ─────────────────────────────────────

export default function PaperCard({ paper, index }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (!paper) return null;

  const {
    subjectCode,
    subjectName,
    department,
    category,
    examType,
    examTypeRaw,
    midsemNumber,
    year,
    session,
    variant,
    fileName,
    fileExtension,
    fileSizeKB,
    downloadUrl,
  } = paper;

  const examConfig =
    EXAM_BADGE_CONFIG[examType] || EXAM_BADGE_CONFIG["End Semester"];
  const catConfig = CATEGORY_BADGE_CONFIG[category] || null;
  const deptShort = DEPT_SHORT[department] || department || "—";

  // Build midsem label
  let midsemLabel = "";
  if (examType === "Mid Semester" && midsemNumber) {
    midsemLabel = ` ${midsemNumber}`;
  }

  // Build session/variant detail
  const detailParts = [];
  if (session) detailParts.push(session);
  if (variant) detailParts.push(`(${variant})`);
  const detailText = detailParts.join(" ");

  // File size display
  const sizeText = fileSizeKB ? formatFileSize(fileSizeKB * 1024) : null;

  // File type icon
  const fileIcon =
    fileExtension === "pdf"
      ? "document-text"
      : ["jpg", "jpeg", "png"].includes(fileExtension)
        ? "image"
        : "document";

  // ─── Download handler ──────────────────────────────────────

  const handleDownload = useCallback(async () => {
    if (downloading) return;

    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    setDownloading(true);
    setDownloadProgress(0);

    try {
      const success = await downloadAndOpen(
        downloadUrl,
        fileName,
        (progress) => {
          setDownloadProgress(progress.progress || 0);
        },
      );

      if (success) {
        notifyDownloadComplete(fileName);
      } else {
        notifyDownloadFailed(fileName);
      }
    } catch (err) {
      console.error("[PaperCard] Download error:", err.message);
      notifyDownloadFailed(fileName);
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }, [downloading, downloadUrl, fileName, scaleAnim]);

  // ─── Render ────────────────────────────────────────────────

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles.card}>
        {/* ─── Top: Subject Code + Year Badge ───────────────── */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            {/* Subject Code (big, bold) */}
            <Text style={styles.subjectCode} numberOfLines={1}>
              {subjectCode || "—"}
            </Text>
            {/* Subject Name (smaller, below code) */}
            {subjectName ? (
              <Text style={styles.subjectName} numberOfLines={1}>
                {subjectName}
              </Text>
            ) : null}
          </View>

          {/* Year badge */}
          <View style={styles.yearBadge}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={colors.primary}
            />
            <Text style={styles.yearText}>{year || "—"}</Text>
          </View>
        </View>

        {/* ─── Badges Row: Exam type, midsem, category ──────── */}
        <View style={styles.badgesRow}>
          {/* Exam type badge */}
          <View style={[styles.examBadge, { backgroundColor: examConfig.bg }]}>
            <Ionicons
              name={examConfig.icon}
              size={12}
              color={examConfig.text}
            />
            <Text style={[styles.examBadgeText, { color: examConfig.text }]}>
              {examConfig.shortLabel}
              {midsemLabel}
            </Text>
          </View>

          {/* Category badge */}
          {catConfig && (
            <View style={[styles.catBadge, { backgroundColor: catConfig.bg }]}>
              <Text style={[styles.catBadgeText, { color: catConfig.text }]}>
                {catConfig.label}
              </Text>
            </View>
          )}

          {/* Session badge */}
          {detailText ? (
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionText}>{detailText}</Text>
            </View>
          ) : null}

          {/* File type indicator */}
          <View style={styles.fileTypeBadge}>
            <Ionicons name={fileIcon} size={11} color={colors.textTertiary} />
            <Text style={styles.fileTypeText}>
              {(fileExtension || "pdf").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ─── Department & Info Row ─────────────────────────── */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="school-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText} numberOfLines={1}>
              {deptShort}
            </Text>
          </View>

          {sizeText && (
            <View style={styles.infoItem}>
              <Ionicons
                name="cloud-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>{sizeText}</Text>
            </View>
          )}
        </View>

        {/* ─── Divider ──────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ─── Bottom: File name + Download button ──────────── */}
        <View style={styles.bottomRow}>
          {/* File name (truncated) */}
          <View style={styles.fileNameContainer}>
            <Text
              style={styles.fileName}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {fileName || "unknown"}
            </Text>
          </View>

          {/* Download button */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.7}
            style={[
              styles.downloadButton,
              downloading && styles.downloadButtonActive,
            ]}
          >
            {downloading ? (
              <View style={styles.downloadingContent}>
                <ActivityIndicator size="small" color={colors.white} />
                {downloadProgress > 0 && (
                  <Text style={styles.progressText}>
                    {Math.round(downloadProgress * 100)}%
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.downloadContent}>
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.downloadText}>Download</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ─── Download progress bar ────────────────────────── */}
        {downloading && downloadProgress > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(downloadProgress * 100)}%` },
              ]}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.cardMargin,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 3,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  // ─── Top row ────────────────────────────────────────────────

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
  },

  topLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },

  subjectCode: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },

  subjectName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: typography.letterSpacing.normal,
  },

  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: spacing.chipRadius,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primaryLight + "30",
  },

  yearText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  // ─── Badges row ─────────────────────────────────────────────

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm - 2,
    marginBottom: spacing.md,
  },

  examBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.chipRadius - 6,
    gap: 4,
  },

  examBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  catBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.chipRadius - 6,
  },

  catBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wider,
  },

  sessionBadge: {
    backgroundColor: colors.warningLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.chipRadius - 6,
  },

  sessionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },

  fileTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm - 2,
    borderRadius: spacing.chipRadius - 6,
    gap: 3,
  },

  fileTypeText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
  },

  // ─── Info row ───────────────────────────────────────────────

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 1,
  },

  infoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },

  // ─── Divider ────────────────────────────────────────────────

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md,
  },

  // ─── Bottom row ─────────────────────────────────────────────

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  fileNameContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },

  fileName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    fontFamily: "monospace",
  },

  // ─── Download button ───────────────────────────────────────

  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 1,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.buttonRadiusSm,
    minWidth: 120,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  downloadButtonActive: {
    backgroundColor: colors.primaryLight,
    elevation: 0,
    shadowOpacity: 0,
  },

  downloadContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm - 2,
  },

  downloadText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: typography.letterSpacing.wide,
  },

  downloadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  progressText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  // ─── Progress bar ──────────────────────────────────────────

  progressBarContainer: {
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginTop: spacing.sm + 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
