import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";
import { downloadAndOpen, formatFileSize } from "../../utils/download";
import * as FileSystem from "expo-file-system/legacy";
import {
  notifyDownloadComplete,
  notifyDownloadFailed,
} from "../../utils/notifications";

// ─── Exam type badge config ──────────────────────────────────

const getExamBadgeConfig = (colors) => ({
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
});

const getCategoryBadgeConfig = (colors) => ({
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
});

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
  const { colors } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Check if file is already downloaded
  useEffect(() => {
    const checkDownloadStatus = async () => {
      try {
        const filePath = `${FileSystem.documentDirectory}pyq_downloads/${constructedFileName || 'temp.pdf'}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        setIsDownloaded(fileInfo.exists && fileInfo.size > 0);
      } catch (error) {
        setIsDownloaded(false);
      }
    };

    if (constructedFileName) {
      checkDownloadStatus();
    }
  }, [constructedFileName]);

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

  // Construct proper filename from paper data
  const code = subjectCode || "PAPER";
  const examTypeShort = examType ? examType.replace(/\s/g, '').substring(0, 6) : "EXAM";
  const yearShort = year || new Date().getFullYear();
  const sessionShort = session ? session.substring(0, 3) : "";
  const constructedFileName = `${code}-${examTypeShort}${midsemNumber || ""}-${yearShort}${sessionShort ? `-${sessionShort}` : ""}.pdf`;

  const EXAM_BADGE_CONFIG = getExamBadgeConfig(colors);
  const CATEGORY_BADGE_CONFIG = getCategoryBadgeConfig(colors);

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
      // Ensure we have valid data to construct fileName
      if (!paper || !paper.examType || !paper.year) {
        Alert.alert("Error", "Paper information is incomplete. Cannot download.");
        setDownloading(false);
        return;
      }

      // Construct fileName from available paper data
      const code = paper.subjectCode || paper.code || "UNKNOWN";
      const examTypeShort = examConfig.shortLabel.replace(/\s/g, ''); // Use short label, remove spaces
      const year = paper.year || new Date().getFullYear();
      const sessionShort = paper.session ? paper.session.substring(0, 3) : "UNK"; // e.g., "Dec" or "May"

      const constructedFileName = `${code}-${examTypeShort}-${year}-${sessionShort}.pdf`;
      const downloadUrl = paper.downloadUrl || paper.pdf_url || paper.url; // Use existing downloadUrl first, then fallbacks

      if (!downloadUrl) {
        Alert.alert("Download Error", "No download URL available for this paper.");
        setDownloading(false);
        return;
      }

      const success = await downloadAndOpen(
        downloadUrl,
        constructedFileName, // Use the newly constructed file name
        (progress) => {
          setDownloadProgress(progress.progress || 0);
        },
      );

      if (success) {
        notifyDownloadComplete(constructedFileName);
      } else {
        notifyDownloadFailed(constructedFileName);
      }
    } catch (err) {
      console.error("[PaperCard] Download error:", err.message);
      notifyDownloadFailed(fileName || "file.pdf"); // Fallback to fileName or generic name
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
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight, shadowColor: colors.shadowDark }]}>
        <View style={styles.cardContainer}>
          {/* Left Content */}
          <View style={styles.leftContentArea}>
            {/* ─── Top: Subject Code + Year Badge ───────────────── */}
            <View style={styles.topRow}>
              <View style={styles.topLeft}>
                {/* Subject Code (big, bold) */}
                <Text style={[styles.subjectCode, { color: colors.textPrimary }]} numberOfLines={1}>
                  {subjectCode || "—"}
                </Text>
                {/* Subject Name (smaller, below code) */}
                {subjectName ? (
                  <Text style={[styles.subjectName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {subjectName}
                  </Text>
                ) : null}
              </View>

              {/* Year badge */}
              <View style={[styles.yearBadge, { backgroundColor: colors.primaryFaded, borderColor: colors.primaryLight + "30" }]}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={colors.primary}
                />
                <Text style={[styles.yearText, { color: colors.primary }]}>{year || "—"}</Text>
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
              <View style={[styles.fileTypeBadge, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={fileIcon} size={11} color={colors.textTertiary} />
                <Text style={[styles.fileTypeText, { color: colors.textTertiary }]}>
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
                <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
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
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>{sizeText}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right Content - Download Button */}
          <View style={styles.rightButtonArea}>

            {/* Download button */}
            <TouchableOpacity
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.7}
              style={[
                styles.downloadButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                downloading && { backgroundColor: colors.primaryLight },
              ]}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : isDownloaded ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.white}
                />
              ) : (
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={colors.white}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Download progress bar (full width below) ────────────────────────── */}
        {downloading && downloadProgress > 0 && (
          <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(downloadProgress * 100)}%`, backgroundColor: colors.accent },
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
    // backgroundColor: colors.surface, // handled inline
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    borderWidth: 1,
    // borderColor: colors.borderLight, // handled inline
    elevation: 3,
    // shadowColor: colors.shadowDark, // handled inline
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  cardContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  leftContentArea: {
    flex: 1,
  },

  rightButtonArea: {
    justifyContent: "center",
    alignItems: "center",
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
    // color: colors.textPrimary, // handled inline
    letterSpacing: typography.letterSpacing.wide,
  },

  subjectName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    // color: colors.textSecondary, // handled inline
    marginTop: 2,
    letterSpacing: typography.letterSpacing.normal,
  },

  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: colors.primaryFaded, // handled inline
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: spacing.chipRadius,
    gap: 4,
    borderWidth: 1,
    // borderColor: colors.primaryLight + "30", // handled inline
  },

  yearText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    // color: colors.primary, // handled inline
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
    backgroundColor: "#F59E0B", // kept static or should be dynamic? keeping static for now as it was warningLight
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.chipRadius - 6,
  },

  sessionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: "#fff",
  },

  fileTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: colors.surfaceAlt, // handled inline
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm - 2,
    borderRadius: spacing.chipRadius - 6,
    gap: 3,
  },

  fileTypeText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.semibold,
    // color: colors.textTertiary, // handled inline
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
    // color: colors.textSecondary, // handled inline
  },



  fileNameContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },

  fileName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    // color: colors.textTertiary, // handled inline
    fontFamily: "monospace",
  },

  // ─── Download button ───────────────────────────────────────

  downloadButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    width: 64,
    height: 64,
    // backgroundColor: colors.primary, // handled inline
    // shadowColor: colors.primary, // handled inline
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  downloadButtonActive: {
    // backgroundColor: colors.primaryLight, // handled inline
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
    // color: colors.white, // handled inline
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
    // color: colors.white, // handled inline
  },

  // ─── Progress bar ──────────────────────────────────────────

  progressBarContainer: {
    height: 3,
    // backgroundColor: colors.borderLight, // handled inline
    borderRadius: 2,
    marginTop: spacing.sm + 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    // backgroundColor: colors.accent, // handled inline
    borderRadius: 2,
  },
});
