import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme";
import { spacing, typography } from "../theme/spacing";
import config from "../constants/config";

const LOGO = require("../../assets/nitkkr-logo.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Quick Actions (tappable grid) ─────────────────────────

const QUICK_ACTIONS = [
  {
    key: "PYQ",
    icon: "document-text",
    label: "PYQ Papers",
    subtitle: "1000+ papers",
    gradient: ["#6366F1", "#818CF8"],
    bg: "rgba(99, 102, 241, 0.10)",
    color: "#6366F1",
    route: "PYQ",
  },
  {
    key: "Jobs",
    icon: "briefcase",
    label: "Jobs",
    subtitle: "Coming soon",
    gradient: ["#F59E0B", "#FBBF24"],
    bg: "rgba(245, 158, 11, 0.10)",
    color: "#F59E0B",
    route: "Jobs",
  },
  {
    key: "Notes",
    icon: "book",
    label: "Notes",
    subtitle: "Coming soon",
    gradient: ["#10B981", "#34D399"],
    bg: "rgba(16, 185, 129, 0.10)",
    color: "#10B981",
    route: "Notes",
  },
  {
    key: "Alerts",
    icon: "notifications",
    label: "Alerts",
    subtitle: "Live updates",
    gradient: ["#EF4444", "#F87171"],
    bg: "rgba(239, 68, 68, 0.10)",
    color: "#EF4444",
    route: "Alerts",
  },
];

// ─── Stats ──────────────────────────────────────────────────

const STATS = [
  {
    value: "10+",
    label: "Departments",
    icon: "school",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.10)",
  },
  {
    value: "1000+",
    label: "Papers",
    icon: "document-text",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.10)",
  },
  {
    value: "2015–25",
    label: "Years",
    icon: "calendar",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.10)",
  },
];

// ─── Features ───────────────────────────────────────────────

const FEATURES = [
  {
    icon: "search",
    title: "Smart Search",
    description:
      "Find papers by subject name, code, department — works offline",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.10)",
  },
  {
    icon: "cloud-download",
    title: "Instant Download",
    description: "Download PDFs and open directly in your viewer app",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.10)",
  },
  {
    icon: "notifications",
    title: "College Alerts",
    description: "Live notifications from NIT KKR website — never miss updates",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.10)",
  },
  {
    icon: "wifi",
    title: "Offline First",
    description:
      "Everything cached locally. Works without internet after first sync",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.10)",
  },
];

// ─── Coming Soon ────────────────────────────────────────────

const COMING_FEATURES = [
  {
    icon: "briefcase",
    title: "Placement Hub",
    tag: "Soon",
    tagColor: "#10B981",
    tagBg: "rgba(16, 185, 129, 0.12)",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.10)",
  },
  {
    icon: "book",
    title: "Lecture Notes",
    tag: "Soon",
    tagColor: "#10B981",
    tagBg: "rgba(16, 185, 129, 0.12)",
    color: "#14B8A6",
    bg: "rgba(20, 184, 166, 0.10)",
  },
  {
    icon: "analytics",
    title: "Exam Analytics",
    tag: "Planned",
    tagColor: "#3B82F6",
    tagBg: "rgba(59, 130, 246, 0.12)",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.10)",
  },
  {
    icon: "chatbubbles",
    title: "AI Assistant",
    tag: "Exploring",
    tagColor: "#F59E0B",
    tagBg: "rgba(245, 158, 11, 0.12)",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.10)",
  },
  {
    icon: "people",
    title: "Study Groups",
    tag: "Planned",
    tagColor: "#3B82F6",
    tagBg: "rgba(59, 130, 246, 0.12)",
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.10)",
  },
  {
    icon: "calendar",
    title: "Calendar",
    tag: "Planned",
    tagColor: "#3B82F6",
    tagBg: "rgba(59, 130, 246, 0.12)",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.10)",
  },
];

// ─── How to Use ─────────────────────────────────────────────

const STEPS = [
  {
    num: "1",
    title: "Browse PYQs",
    desc: "Go to PYQ tab and explore papers from all departments",
    icon: "reader-outline",
    color: "#6366F1",
  },
  {
    num: "2",
    title: "Search & Filter",
    desc: "Use smart search or filters to find exactly what you need",
    icon: "filter-outline",
    color: "#3B82F6",
  },
  {
    num: "3",
    title: "Download",
    desc: "Tap download to save PDF and open it directly",
    icon: "cloud-download-outline",
    color: "#10B981",
  },
  {
    num: "4",
    title: "Stay Updated",
    desc: "Check Alerts tab for latest NIT KKR notifications",
    icon: "notifications-outline",
    color: "#EF4444",
  },
];

// ─── Sub-components ─────────────────────────────────────────

function QuickActionCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.quickIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.quickLabel} numberOfLines={1}>
        {item.label}
      </Text>
      <Text style={styles.quickSub} numberOfLines={1}>
        {item.subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function StatChip({ item }) {
  return (
    <View style={styles.statChip}>
      <View style={[styles.statIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statValue}>{item.value}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </View>
    </View>
  );
}

function FeatureRow({ item, isLast }) {
  return (
    <View style={[styles.featureRow, !isLast && styles.featureRowBorder]}>
      <View style={[styles.featureIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{item.title}</Text>
        <Text style={styles.featureDesc}>{item.description}</Text>
      </View>
    </View>
  );
}

function ComingChip({ item }) {
  return (
    <View style={styles.comingChip}>
      <View style={[styles.comingIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <Text style={styles.comingTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={[styles.comingTag, { backgroundColor: item.tagBg }]}>
        <Text style={[styles.comingTagText, { color: item.tagColor }]}>
          {item.tag}
        </Text>
      </View>
    </View>
  );
}

function StepItem({ item, isLast }) {
  return (
    <View style={styles.stepRow}>
      {/* Timeline */}
      <View style={styles.stepTimeline}>
        <View style={[styles.stepDot, { backgroundColor: item.color }]}>
          <Text style={styles.stepNum}>{item.num}</Text>
        </View>
        {!isLast && <View style={styles.stepLine} />}
      </View>
      {/* Content */}
      <View style={[styles.stepContent, isLast && { marginBottom: 0 }]}>
        <View style={styles.stepHeader}>
          <Ionicons name={item.icon} size={15} color={item.color} />
          <Text style={styles.stepTitle}>{item.title}</Text>
        </View>
        <Text style={styles.stepDesc}>{item.desc}</Text>
      </View>
    </View>
  );
}

function SectionHeader({ icon, iconColor, iconBg, title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleWebsitePress = () => {
    Linking.openURL("https://nitkkr.ac.in").catch(() => {});
  };

  const navigateTo = (route) => {
    navigation.navigate(route);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <View style={styles.heroInner}>
          <View style={styles.heroLogoWrap}>
            <Image source={LOGO} style={styles.heroLogo} resizeMode="contain" />
          </View>

          <Text style={styles.heroTitle}>{config.APP_NAME}</Text>

          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>{config.APP_TAGLINE}</Text>
          </View>

          <Text style={styles.heroDesc}>{config.APP_DESCRIPTION}</Text>
        </View>
      </View>

      {/* ─── Quick Actions Grid ───────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((item) => (
            <QuickActionCard
              key={item.key}
              item={item}
              onPress={() => navigateTo(item.route)}
            />
          ))}
        </View>
      </View>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="pulse" size={18} color={colors.primary} />
            <Text style={styles.statsHeaderText}>At a Glance</Text>
          </View>
          <View style={styles.statsRow}>
            {STATS.map((item, i) => (
              <StatChip key={i} item={item} />
            ))}
          </View>
        </View>
      </View>

      {/* ─── Features ─────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="sparkles"
          iconColor="#8B5CF6"
          iconBg="rgba(139, 92, 246, 0.10)"
          title="What You Can Do"
          subtitle="Available right now"
        />
        <View style={styles.featuresCard}>
          {FEATURES.map((item, i) => (
            <FeatureRow
              key={i}
              item={item}
              isLast={i === FEATURES.length - 1}
            />
          ))}
        </View>
      </View>

      {/* ─── How to Use ───────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="map-outline"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.10)"
          title="Get Started"
          subtitle="4 simple steps"
        />
        <View style={styles.stepsCard}>
          {STEPS.map((item, i) => (
            <StepItem key={i} item={item} isLast={i === STEPS.length - 1} />
          ))}
        </View>
      </View>

      {/* ─── Coming Soon ──────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="rocket"
          iconColor="#F59E0B"
          iconBg="rgba(245, 158, 11, 0.10)"
          title="Coming Soon"
          subtitle="On the roadmap"
        />
        <View style={styles.comingGrid}>
          {COMING_FEATURES.map((item, i) => (
            <ComingChip key={i} item={item} />
          ))}
        </View>

        {/* Suggestion CTA */}
        <View style={styles.suggestCard}>
          <View style={styles.suggestIconWrap}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
          </View>
          <View style={styles.suggestText}>
            <Text style={styles.suggestTitle}>Have an idea?</Text>
            <Text style={styles.suggestDesc}>
              We're building this for you. Share your suggestions!
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textTertiary}
          />
        </View>
      </View>

      {/* ─── About ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="information-circle"
          iconColor="#0284C7"
          iconBg="rgba(2, 132, 199, 0.10)"
          title="About NIT Kurukshetra"
          subtitle="Est. 1963"
        />
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            National Institute of Technology Kurukshetra is an Institution of
            National Importance established in 1963 — one of India's premier
            engineering institutes offering UG, PG, and doctoral programs.
          </Text>
          <TouchableOpacity
            style={styles.websiteBtn}
            onPress={handleWebsitePress}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={16} color={colors.white} />
            <Text style={styles.websiteBtnText}>nitkkr.ac.in</Text>
            <Ionicons
              name="open-outline"
              size={12}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for NIT Kurukshetra students
        </Text>
        <Text style={styles.footerVersion}>
          {config.APP_NAME} v{config.APP_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const CARD_RADIUS = 18;
const CARD_SHADOW = {
  elevation: 3,
  shadowColor: "rgba(15, 23, 42, 0.08)",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 140, // room for floating tab bar
  },

  // ─── Hero ──────────────────────────────────────────────────
  hero: {
    backgroundColor: colors.primary,
    overflow: "hidden",
    position: "relative",
  },
  heroCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  heroInner: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  heroLogoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.20)",
  },
  heroLogo: {
    width: 58,
    height: 58,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textInverse,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentLight,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accentLight,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroDesc: {
    fontSize: 14.5,
    fontWeight: "400",
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 14,
    maxWidth: 260,
  },

  // ─── Sections ──────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textTertiary,
    marginTop: 1,
  },

  // ─── Quick Actions Grid ────────────────────────────────────
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...CARD_SHADOW,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  quickSub: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textTertiary,
    marginTop: 3,
    textAlign: "center",
  },

  // ─── Stats Card ────────────────────────────────────────────
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...CARD_SHADOW,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statsHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statChip: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statTextWrap: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.textTertiary,
    marginTop: 2,
    textAlign: "center",
  },

  // ─── Features Card ─────────────────────────────────────────
  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...CARD_SHADOW,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12.5,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 17,
  },

  // ─── Steps Card ────────────────────────────────────────────
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    padding: 16,
    paddingTop: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...CARD_SHADOW,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepTimeline: {
    alignItems: "center",
    width: 32,
    marginRight: 14,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.white,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    marginBottom: 18,
    paddingTop: 2,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12.5,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 17,
    paddingLeft: 21,
  },

  // ─── Coming Soon Grid ─────────────────────────────────────
  comingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  comingChip: {
    width: (SCREEN_WIDTH - 32 - 20) / 3,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...CARD_SHADOW,
  },
  comingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  comingTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  comingTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingTagText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // ─── Suggest Card ──────────────────────────────────────────
  suggestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.06)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
    gap: 12,
  },
  suggestIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestText: {
    flex: 1,
  },
  suggestTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  suggestDesc: {
    fontSize: 11.5,
    fontWeight: "400",
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },

  // ─── About Card ────────────────────────────────────────────
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...CARD_SHADOW,
  },
  aboutText: {
    fontSize: 13.5,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  websiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    alignSelf: "center",
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  websiteBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.white,
  },

  // ─── Footer ────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textTertiary,
    textAlign: "center",
  },
  footerVersion: {
    fontSize: 10.5,
    fontWeight: "400",
    color: colors.textTertiary,
    marginTop: 4,
    opacity: 0.6,
  },
});
