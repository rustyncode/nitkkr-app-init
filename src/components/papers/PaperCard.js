import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/spacing";
import { downloadAndOpen, formatFileSize, isFileDownloaded } from "../../utils/download";
import * as FileSystem from "expo-file-system";
import {
  notifyDownloadComplete,
  notifyDownloadFailed,
} from "../../utils/notifications";
import { toggleBookmark, isBookmarked } from "../../services/bookmarkService";

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
  const [bookmarked, setBookmarked] = useState(false);


  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Check if file is already downloaded using utility
  useEffect(() => {
    const checkDownloadStatus = async () => {
      const downloaded = await isFileDownloaded(constructedFileName);
      setIsDownloaded(downloaded);
    };

    if (constructedFileName) {
      checkDownloadStatus();
    }
  }, [constructedFileName]);

  // Check bookmark status
  useEffect(() => {
    const checkBookmark = async () => {
      setBookmarked(await isBookmarked("papers", paper.id));
    };
    checkBookmark();
  }, [paper.id]);

  const handleBookmarkToggle = async () => {
    const added = await toggleBookmark("papers", paper);
    setBookmarked(added);
  };

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

  // ─── Actions ────────────────────────────────────────────────

  const handlePress = useCallback(async () => {
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

    let url = downloadUrl || paper.pdf_url || paper.pdfUrl;
    if (url && !url.startsWith("http")) {
      const baseUrl = config.API_URL.replace("/api/v1", "");
      url = `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    if (!url) {
      Alert.alert("Error", "No download link available for this paper.");
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);

    try {
      const success = await downloadAndOpen(
        url,
        constructedFileName,
        (progress) => {
          setDownloadProgress(progress.progress || 0);
        },
      );

      if (success) {
        setIsDownloaded(true);
      }
    } catch (err) {
      console.error("[PaperCard] Press error:", err.message);
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }, [downloading, downloadUrl, paper.pdf_url, paper.pdfUrl, constructedFileName, scaleAnim]);

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
                {/* Subject Name (Full) */}
                {subjectName ? (
                  <Text style={[styles.subjectName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {subjectName}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity onPress={handleBookmarkToggle} style={styles.bookmarkBtn}>
                <Ionicons
                  name={bookmarked ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={bookmarked ? colors.primary : colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {/* ─── Badges Row: Exam type, Year, File ────────── */}
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

              {/* Year badge */}
              <View style={[styles.yearBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight }]}>
                <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
                <Text style={[styles.yearBadgeText, { color: colors.textSecondary }]}>{year || "—"}</Text>
              </View>

              {/* File type indicator */}
              <View style={[styles.fileTypeBadge, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={fileIcon} size={11} color={colors.textTertiary} />
                <Text style={[styles.fileTypeText, { color: colors.textTertiary }]}>
                  {(fileExtension || "pdf").toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Content - Consolidated Action Buttons */}
          <View style={styles.rightButtonArea}>
            <TouchableOpacity
              onPress={handlePress}
              disabled={downloading}
              style={[
                styles.previewBtn,
                { backgroundColor: isDownloaded ? colors.featureGreen : colors.primary },
                downloading && { opacity: 0.7 }
              ]}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name={isDownloaded ? "eye-outline" : "book-outline"} size={16} color="#FFF" />
                  <Text style={styles.previewBtnText}>
                    {isDownloaded ? "OPEN" : "PREVIEW"}
                  </Text>
                </>
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
    alignItems: "center",
    gap: spacing.md,
  },

  leftContentArea: {
    flex: 1,
    paddingRight: 4,
  },

  rightButtonArea: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
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
  bookmarkBtn: {
    padding: 6,
    marginLeft: 8,
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

  // ─── Refactored Styles ───────────────────────────────────

  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    minWidth: 90,
  },

  previewBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.chipRadius - 6,
    gap: 4,
    borderWidth: 1,
  },

  yearBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },

  progressBarContainer: {
    height: 3,
    borderRadius: 2,
    marginTop: spacing.sm + 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
